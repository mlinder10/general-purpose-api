import { readFileSync, writeFileSync } from "fs";
import { embedContent } from "./gemini";
import { zip } from "@/utils/helpers";
import { db } from "./db";
import { VNC_EXERCISE_VECTOR_DIMENSIONALITY, vncExercises } from "@/db";

type Exercise = {
  id: string;
  name: string;
  description: string;
  directions: string[];
  cues: string[];
  image: string;
  videoId: string;
  bodyPart: string;
  primaryGroup: string;
  secondaryGroups: string[];
  exerciseType: string;
  equipmentType: string;
  repsLow: number;
  repsHigh: number;
};

function readData<T>(filename: string): T {
  const raw = readFileSync(filename);
  return JSON.parse(raw.toString()) as T;
}

function writeData<T>(filename: string, data: T) {
  const raw = JSON.stringify(data);
  writeFileSync(filename, raw);
}

async function getEmbeddings(exercises: Exercise[]) {
  // removed names
  // weighting
  // heavy primary group weighting
  const exercisesText = exercises.map(
    (e) => `
    PRIMARY: ${(e.primaryGroup + " ").repeat(10)}
    SECONDARY: ${e.secondaryGroups.join(" ")}
    BODY PART: ${e.bodyPart}

    GROUP TYPE: ${e.exerciseType}
    EQUIPMENT: ${e.equipmentType}
    MIN REPS: ${e.repsLow}
    MAX REPS: ${e.repsHigh}
    `
  );

  return await Promise.all(
    exercisesText.map((e) =>
      embedContent(e, {
        outputDimensionality: VNC_EXERCISE_VECTOR_DIMENSIONALITY,
        taskType: "CLUSTERING",
      })
    )
  );
}

const TARGET_FILE =
  "src/app/api/vnc/v1/_weights/embeddings/clustering_64d_no-names_groups-weighted_heavy-primary-groups.json";

export async function createEmbeddingsFile() {
  const exercises = readData<Exercise[]>(
    "src/app/api/vnc/v1/_weights/exercises.json"
  );
  const embeddings = await getEmbeddings(exercises);
  const exercisesWithEmbeddings = zip(exercises, embeddings);
  writeData(TARGET_FILE, exercisesWithEmbeddings);
}

export async function writeEmbeddingsToDB() {
  const exercisesWithEmbeddings = readData<[Exercise, number[]][]>(TARGET_FILE);

  await db.delete(vncExercises);

  await db.insert(vncExercises).values(
    exercisesWithEmbeddings.map(([exercise, embedding]) => ({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      directions: exercise.directions,
      cues: exercise.cues,
      image: exercise.image,
      videoId: exercise.videoId,
      bodyPart: exercise.bodyPart,
      primaryGroup: exercise.primaryGroup,
      secondaryGroups: exercise.secondaryGroups,
      exerciseType: exercise.exerciseType,
      equipmentType: exercise.equipmentType,
      repsLow: exercise.repsLow,
      repsHigh: exercise.repsHigh,
      vector: embedding,
    }))
  );
}
