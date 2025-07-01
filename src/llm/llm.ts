export type Prompt =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "image";
      mimeType: "image/jpeg";
      content: Uint8Array;
    };

export type LLM = {
  prompt: (prompt: Prompt[]) => Promise<string>;
  promptStreamed: (prompt: Prompt[]) => AsyncGenerator<string>;
};

export function stripAndParse<T>(str: string): T | null {
  try {
    return JSON.parse(str.replace("```json", "").replace("```", "").trim());
  } catch (err) {
    console.error(err);
    return null;
  }
}
