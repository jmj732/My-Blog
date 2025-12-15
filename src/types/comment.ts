export interface Comment {
    id: string;
    postId: string;
    userId: string;
    parentId: string | null;
    content: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string | null;
    user?: {
        id: string;
        name: string | null;
        email?: string | null;
        image?: string | null;
    };
}
