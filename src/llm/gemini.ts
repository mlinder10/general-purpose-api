import { GoogleGenAI } from "@google/genai";
import { Prompt, LLM } from "./llm";

type GeminiModel =
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-lite"
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite";

type GeminiInput =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

class Gemini implements LLM {
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

export default Gemini;
