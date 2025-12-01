import { pipeline } from "@xenova/transformers";

// Singleton pattern to avoid re-loading the model
let embedder: any = null;

async function getEmbedder() {
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
