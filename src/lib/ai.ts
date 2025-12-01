import { pipeline } from "@xenova/transformers";

type EmbeddingOptions = {
    pooling?: "mean" | "cls";
    normalize?: boolean;
};

type FeatureExtractionFn = (
    text: string,
    options?: EmbeddingOptions
) => Promise<{ data: Float32Array | number[] }>;

// Singleton pattern to avoid re-loading the model
let embedder: FeatureExtractionFn | null = null;

async function getEmbedder(): Promise<FeatureExtractionFn> {
    if (!embedder) {
        embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }
    return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const model = await getEmbedder();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
}
