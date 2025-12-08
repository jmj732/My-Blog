import Link from "next/link";
import { Moon } from "lucide-react";

import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { SearchDialogButton } from "@/components/search/search-dialog-button";

function getInitials(name?: string | null, email?: string | null) {
    const cleaned = name?.trim();
    if (cleaned) {
        // Multi-word names: take first letter of first two words
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
        }

        // Single token: try camelCase/PascalCase (e.g., ChoJaemin -> CJ)
        const camelTokens = cleaned.split(/(?=[A-Z])/).filter(Boolean);
        if (camelTokens.length >= 2) {
            return `${camelTokens[0][0] ?? ""}${camelTokens[1][0] ?? ""}`.toUpperCase();
        }

        // Fallback: first two letters
        return cleaned.slice(0, 2).toUpperCase();
    }

    if (email) {
        const local = email.split("@")[0] ?? "";
        return local.slice(0, 2).toUpperCase() || "👤";
    }

    return "👤";
}

export async function Header() {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center gap-6">
                {/* Logo */}
                <div className="flex">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground font-bold rounded-none">
                            AI
                        </div>
                        <span className="hidden text-xl font-bold tracking-tighter sm:inline-block">
                            Blog
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="hidden flex-1 items-center space-x-6 text-sm font-medium text-muted-foreground transition-colors md:flex">
                    <Link href="/posts" className="hover:text-primary transition-colors">
                        포스트
                    </Link>
                    {user?.email === process.env.ADMIN_EMAIL && (
                        <Link href="/write" className="hover:text-primary transition-colors">
                            글쓰기
                        </Link>
                    )}
                    <Link href="/about" className="hover:text-primary transition-colors">
                        소개
                    </Link>
                    <Link href="/search" className="hover:text-primary transition-colors">
                        검색
                    </Link>
                </nav>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2">
                    <SearchDialogButton />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted transition-all rounded-none"
                    >
                        <Moon className="h-5 w-5" />
                    </Button>

                    {user ? (
                        <>
                            <div className="hidden text-right text-xs leading-tight text-muted-foreground sm:block">
                                <p className="text-sm font-semibold text-foreground">
                                    {user.name ?? user.email ?? "Reader"}
                                </p>
                            </div>
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut();
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="border-border hover:bg-muted rounded-none"
                                >
                                    로그아웃
                                </Button>
                            </form>
                        </>
                    ) : (
                        <form
                            action={async () => {
                                "use server";
                                await signIn("github");
                            }}
                        >
                            <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-none font-bold">
                                로그인
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </header>
    );
}
