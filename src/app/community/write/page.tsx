import { WritePageClient } from "@/app/write/write-page-client";

export default async function CommunityWritePage() {
    return (
        <WritePageClient
            user={{}}
            apiEndpoint="/api/v1/community/posts"
            editApiEndpoint="/api/v1/community/posts"
            viewPathPrefix="/community/posts"
            afterDeleteHref="/community"
            backHref="/community"
        />
    );
}
