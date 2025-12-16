"use client";

import Link from "next/link";
import { Moon, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchDialogButton } from "@/components/search/search-dialog-button";
import { useAuth } from "@/components/auth/auth-provider";

export function Header() {
    const { user, loading, logout } = useAuth();

    const authSection = (() => {
        if (loading) {
            return (
                <div className="h-9 w-28 rounded-md bg-muted animate-pulse" aria-busy="true" />
            );
        }

        if (user) {
            const displayName = user.nickname || user.name || user.email || "로그인됨";
            return (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 bg-card/60">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserRound className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="leading-tight">
                            <div className="text-sm font-semibold">{displayName}</div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            await logout();
                            console.log("Logout complete, staying on current page");
                        }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        로그아웃
                    </Button>
                </div>
            );
        }

        return (
            <Button
                onClick={() => window.location.href = '/api/auth/login'}
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-none font-bold"
            >
                로그인
            </Button>
        );
    })();

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
                    <Link href="/community" className="hover:text-primary transition-colors">
                        커뮤니티
                    </Link>
                    <Link href="/write" className="hover:text-primary transition-colors">
                        글쓰기
                    </Link>
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

                    {authSection}
                </div>
            </div>
        </header>
    );
}
