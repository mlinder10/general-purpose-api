import { stripAndParse } from "@/llm";
import Gemini from "@/llm/gemini";

export async function POST(req: Request) {
  try {
    const { word } = await req.json();
    if (!word) return new Response("Missing required fields", { status: 400 });

    const result = await defineWord(word);
    if (!result.success) return new Response(result.error, { status: 400 });

    return new Response(JSON.stringify(word.data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

type DefineResult =
  | {
      success: true;
      data: {
        meanings: {
          definition: string;
          partOfSpeech: string;
          example: string;
        }[];
      };
    }
  | {
      success: false;
      error: string;
    };

async function defineWord(word: string) {
  const prompt = `
    You are an expert dictionary who can define a word.
    If the word is not in the dictionary, or you cannot give an accurate definition, respond with an error.
    Please respond in the following JSON format:

    (example input: 'word')
    {
      "success": true,
      "data": {
        "meanings": [
          {
            "definition": <definition of word, ex. "A group of letters that forms a single concept."> (string),
            "partOfSpeech": <part of speech of word, ex. "noun"> (string),
            "example": <example sentence using word, ex. "The word apple is a fruit."> (string)
          }
        ]
      }
    }

    OR:

    {
      "success": false,
      "error": "<error message>"
    }

    Your Input: ${word}
  `;

  const llm = new Gemini();
  const result = await llm.prompt([{ type: "text", content: prompt }]);

  const definition = stripAndParse<DefineResult>(result);
  if (definition === null) throw new Error("Failed to parse definition");

  return definition;
}
