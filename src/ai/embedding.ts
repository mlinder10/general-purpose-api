export type EmbeddingModel = {
  embed: (content: string[]) => Promise<number[][]>;
};
