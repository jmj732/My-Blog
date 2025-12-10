import "server-only";
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
let pipelineInstance: any = null;

async function getEmbedder(): Promise<FeatureExtractionFn> {
    if (!pipelineInstance) {
        pipelineInstance = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }

    // Return a wrapper function that matches our FeatureExtractionFn type
    return async (text: string, options?: EmbeddingOptions) => {
        const result = await pipelineInstance(text, options);
        return {
            data: result.data as Float32Array
        };
    };
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const model = await getEmbedder();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
}
