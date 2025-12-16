"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type PostActionsProps = {
    slug: string;
};

export function PostActions({ slug }: PostActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return;

        setIsDeleting(true);
        try {
            await apiRequest<void>(`/api/v1/posts/${encodeURIComponent(slug)}`, { method: "DELETE", useProxy: true });
            alert("글이 삭제되었습니다.");
            router.push("/posts");
        } catch (error) {
            console.error("delete failed", error);
            alert("삭제에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/write/${slug}`}>
                <Button variant="outline" className="border-2 border-border rounded-none">
                    <Pencil className="mr-2 h-4 w-4" />
                    수정
                </Button>
            </Link>
            <Button
                variant="destructive"
                className="rounded-none bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
        </div>
    );
}
