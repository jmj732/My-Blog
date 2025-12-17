import { pipeline, PipelineType, env } from "@xenova/transformers";

// Skip local model checks and use remote models only
env.allowLocalModels = false;
env.useBrowserCache = true;

// Use a singleton pattern to ensure the model is loaded only once
class EmbeddingService {
    static instance: EmbeddingService;
    private pipe: any = null;
    private modelName = "Xenova/all-MiniLM-L6-v2";

    private constructor() { }

    static getInstance(): EmbeddingService {
        if (!EmbeddingService.instance) {
            EmbeddingService.instance = new EmbeddingService();
        }
        return EmbeddingService.instance;
    }

    async init() {
        if (this.pipe) return;

        // Disable local model checking to ensure we fetch from the CDN initially if not cached
        // env.allowLocalModels = false;

        this.pipe = await pipeline("feature-extraction", this.modelName);
    }

    async generateEmbedding(text: string): Promise<number[]> {
        await this.init();

        const output = await this.pipe(text, { pooling: "mean", normalize: true });
        // Convert Tensor to standard array
        return Array.from(output.data);
    }
}

export const embeddingService = EmbeddingService.getInstance();
