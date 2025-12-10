"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { EditorRoot, EditorContent, type JSONContent } from "novel";
import { StarterKit } from "novel";
import { Placeholder } from "novel";
import { cx } from "class-variance-authority";
import { SlashCommand, slashCommand, suggestionItems } from "./slash-command";

// Note: Drag & drop is built into Novel's StarterKit via TipTap extensions
const extensions = [
    StarterKit.configure({
        bulletList: {
            HTMLAttributes: {
                class: cx("list-disc list-outside leading-3 -mt-2"),
            },
        },
        orderedList: {
            HTMLAttributes: {
                class: cx("list-decimal list-outside leading-3 -mt-2"),
            },
        },
        listItem: {
            HTMLAttributes: {
                class: cx("leading-normal -mb-2"),
            },
        },
        blockquote: {
            HTMLAttributes: {
                class: cx("border-l-4 border-primary pl-4"),
            },
        },
        codeBlock: {
            HTMLAttributes: {
                class: cx("rounded-md bg-muted text-foreground border border-border p-5 font-mono font-medium"),
            },
        },
        code: {
            HTMLAttributes: {
                class: cx("rounded-md bg-muted px-1.5 py-1 font-mono font-medium"),
                spellcheck: "false",
            },
        },
        horizontalRule: false,
        dropcursor: {
            color: "#ccff00",
            width: 4,
        },
        gapcursor: false,
    }),
    Placeholder.configure({
        placeholder: "여기에 내용을 작성하세요... ('/'를 입력하여 메뉴 열기)",
    }),
    slashCommand,
];

interface WritePageClientProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    initialPost?: {
        slug: string;
        title: string;
        content: string;
    };
    apiEndpoint?: string; // Custom API endpoint for creating posts
}

function parseInitialContent(raw?: string): JSONContent | undefined {
    if (!raw) return undefined;
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

export function WritePageClient({ user, initialPost, apiEndpoint = "/api/posts" }: WritePageClientProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialPost?.title ?? "");
    const [content, setContent] = useState<JSONContent | undefined>(
        parseInitialContent(initialPost?.content)
    );
    const [tags, setTags] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isEditing = Boolean(initialPost);

    useEffect(() => {
        if (initialPost) {
            setTitle(initialPost.title);
            setContent(parseInitialContent(initialPost.content));
        }
    }, [initialPost]);

    const handleSave = async () => {
        if (!title || !content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const isEdit = Boolean(isEditing && initialPost?.slug);
            const endpoint = isEdit ? `/api/posts/${initialPost?.slug}` : apiEndpoint;
            const response = await fetch(endpoint, {
                method: isEdit ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content: JSON.stringify(content), // Serialize JSONContent
                    tags,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save post");
            }

            const data = await response.json();
            alert(isEdit ? "글이 수정되었습니다!" : "글이 성공적으로 저장되었습니다!");
            router.push(`/posts/${data.slug ?? initialPost?.slug}`);
        } catch (error) {
            console.error("Save failed:", error);
            alert("저장에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialPost?.slug) return;
        if (!confirm("정말로 이 글을 삭제하시겠습니까?")) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/posts/${initialPost.slug}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete post");
            }

            alert("글이 삭제되었습니다.");
            router.push("/posts");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("삭제에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background">
            <div className="container relative z-10 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hover:bg-muted">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold uppercase tracking-tight">
                                {isEditing ? "글 수정" : "새 글 작성"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {user?.name || user?.email || "Guest"}님, 환영합니다!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <Button
                                variant="destructive"
                                className="rounded-none"
                                onClick={handleDelete}
                                disabled={isDeleting || isSaving}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </Button>
                        )}
                        <Button
                            className="bg-primary text-primary-foreground hover:opacity-90 rounded-none font-bold"
                            onClick={handleSave}
                            disabled={isSaving || isDeleting}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "저장 중..." : isEditing ? "수정" : "저장"}
                        </Button>
                    </div>
                </div>

                {/* Writing area */}
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Title input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                제목
                            </label>
                            <Input
                                placeholder="멋진 제목을 입력하세요..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-3xl font-bold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto py-4"
                            />
                        </div>

                        {/* Tags input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                태그
                            </label>
                            <Input
                                placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, TypeScript, Web)"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="border-border bg-card"
                            />
                        </div>

                        {/* Novel Editor */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-muted-foreground">
                                    내용
                                </label>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Sparkles className="w-3 h-3" />
                                    <span>/ 를 입력하여 블록 추가 • 블록을 드래그하여 이동</span>
                                </div>
                            </div>
                            <div className="novel-editor-wrapper border-2 border-border bg-card overflow-hidden">
                                <EditorRoot>
                                    <EditorContent
                                        initialContent={content}
                                        extensions={extensions}
                                        className="novel-editor"
                                        editorProps={{
                                            attributes: {
                                                class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6",
                                            },
                                        }}
                                        onUpdate={({ editor }) => {
                                            setContent(editor.getJSON());
                                        }}
                                    >
                                        <SlashCommand />
                                    </EditorContent>
                                </EditorRoot>
                            </div>
                        </div>

                        {/* Writing tips */}
                        <div className="p-4 border border-border bg-muted">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold mb-1 uppercase tracking-tight">글쓰기 팁</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border">/ </kbd> 를 입력하면 블록 메뉴가 나타납니다</li>
                                        <li>• <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border">↑</kbd> <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border">↓</kbd> 화살표로 메뉴 탐색</li>
                                        <li>• 각 블록 왼쪽의 드래그 핸들로 블록을 재정렬</li>
                                        <li>• 텍스트를 선택하면 포맷팅 메뉴가 나타납니다</li>
                                        <li>• 마크다운 문법이 자동으로 변환됩니다</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
