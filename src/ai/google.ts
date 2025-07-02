import { EmbedContentConfig, GoogleGenAI } from "@google/genai";
import { Prompt, LLM } from "./llm";
import { EmbeddingModel } from "./embedding";

// LLM

type GeminiModel =
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite";

type GeminiInput =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export class Gemini implements LLM {
  private ai;
  private model;

  constructor(model: GeminiModel = "gemini-2.0-flash") {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    this.model = model;
  }

  private createInput(prompt: Prompt[]): GeminiInput[] {
    return prompt.map((p) => {
      if (p.type === "text") {
        return { text: p.content };
      } else if (p.type === "image") {
        return {
          inlineData: {
            mimeType: p.mimeType,
            data: Buffer.from(p.content).toString("base64"),
          },
        };
      } else {
        throw new Error("Unknown prompt type");
      }
    });
  }

  async prompt(prompt: Prompt[]) {
    const input = this.createInput(prompt);
    const result = await this.ai.models.generateContent({
      model: this.model,
      contents: input,
    });
    if (result.text === undefined) throw new Error("Failed to generate text");
    return result.text;
  }

  async *promptStreamed(prompt: Prompt[]) {
    const input = this.createInput(prompt);
    const stream = await this.ai.models.generateContentStream({
      model: this.model,
      contents: input,
    });

    for await (const chunk of stream) {
      if (chunk.text === undefined) throw new Error("Failed to generate text");
      yield chunk.text;
    }
  }
}

// Embedding

type GoogleEmbeddingModel = "text-embedding-004";

type GoogleEmbeddingConstructor = {
  model?: GoogleEmbeddingModel;
  config?: EmbedContentConfig;
};

export class GoogleEmbedding implements EmbeddingModel {
  private ai;
  private model;
  private config;

  constructor({
    model = "text-embedding-004",
    config,
  }: GoogleEmbeddingConstructor) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    this.model = model;
    this.config = config;
  }

  async embed(content: string[]) {
    const result = await this.ai.models.embedContent({
      model: this.model,
      contents: content,
      config: this.config,
    });
    if (!result.embeddings) throw new Error("Failed to embed content");
    const values = Array.from(
      result.embeddings.values().map((v) => v.values)
    ).filter((v) => v !== undefined);
    if (values.length !== content.length)
      throw new Error("Failed to embed content");
    return values;
  }
}
