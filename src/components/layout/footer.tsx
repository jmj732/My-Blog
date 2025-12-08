import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold tracking-tighter">AI Blog</h3>
                        <p className="text-sm text-muted-foreground">
                            AI와 모던 웹 기술로 구동되는 아름다운 블로그.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">플랫폼</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/posts" className="text-muted-foreground hover:text-primary transition-colors">
                                    전체 포스트
                                </Link>
                            </li>
                            <li>
                                <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
                                    검색
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                                    소개
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">리소스</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    문서
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    API 참조
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    지원
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">연락하기</h4>
                        <div className="flex space-x-3">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 AI Blog. ❤️와 AI로 제작됨.
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
                            <a href="#" className="hover:text-primary transition-colors">이용약관</a>
                            <a href="#" className="hover:text-primary transition-colors">쿠키</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
