import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-muted/30">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gradient">AI Blog</h3>
                        <p className="text-sm text-muted-foreground">
                            Beautiful blogging powered by AI and modern web technologies.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/posts" className="text-muted-foreground hover:text-foreground transition-colors">
                                    All Posts
                                </Link>
                            </li>
                            <li>
                                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Search
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    API Reference
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Connect</h4>
                        <div className="flex space-x-3">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-all hover:scale-110">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 AI Blog. Built with ❤️ and AI.
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
