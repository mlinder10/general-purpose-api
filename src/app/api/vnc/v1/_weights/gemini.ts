import { EmbedContentConfig, GoogleGenAI } from "@google/genai";

export async function embedContent(
  contents: string,
  config?: EmbedContentConfig
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const result = await ai.models.embedContent({
    model: "text-embedding-004",
    contents,
    config,
  });
  if (!result.embeddings) throw new Error("Failed to embed content");
  const values = Array.from(result.embeddings.values().map((v) => v.values)).at(
    0
  );
  if (!values) throw new Error("Failed to embed content");
  return values;
}
