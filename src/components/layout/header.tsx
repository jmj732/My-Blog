import Link from "next/link";
import { Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchDialogButton } from "@/components/search/search-dialog-button";
const BACKEND_LOGIN_URL = "https://gc-board-latest-1.onrender.com/oauth2/authorization/github";

export async function Header() {
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

                    <Link href={BACKEND_LOGIN_URL}>
                        <Button className="bg-primary text-primary-foreground hover:opacity-90 rounded-none font-bold">
                            로그인
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
