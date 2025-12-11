import "server-only";

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

async function getEmbedder(): Promise<FeatureExtractionFn | null> {
    if (pipelineInstance) {
        return pipelineInstance;
    }

    try {
        // Dynamic import - only load when needed, and fail gracefully
        const { pipeline } = await import("@xenova/transformers");

        const embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );

        // Return a wrapper function that matches our FeatureExtractionFn type
        pipelineInstance = async (text: string, options?: EmbeddingOptions) => {
            const result = await embedder(text, options);
            return {
                data: result.data as Float32Array
            };
        };

        return pipelineInstance;
    } catch (error) {
        console.warn("[AI] Failed to load transformers library (Vercel serverless environment):", error);
        return null;
    }
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const model = await getEmbedder();

        if (!model) {
            console.warn("[AI] Embeddings not available in this environment");
            return null;
        }

        const output = await model(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    } catch (error) {
        console.warn("[AI] Failed to generate embedding:", error);
        return null;
    }
}
