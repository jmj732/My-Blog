import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Moon } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-effect">
            <div className="container flex h-16 items-center">
                {/* Logo */}
                <div className="mr-8 flex">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">✨</span>
                        </div>
                        <span className="hidden font-bold text-xl sm:inline-block text-gradient">
                            AI Blog
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
                    <Link
                        href="/posts"
                        className="transition-all duration-200 hover:text-foreground/80 text-foreground/60 hover:scale-105"
                    >
                        Posts
                    </Link>
                    <Link
                        href="/about"
                        className="transition-all duration-200 hover:text-foreground/80 text-foreground/60 hover:scale-105"
                    >
                        About
                    </Link>
                    <Link
                        href="/search"
                        className="transition-all duration-200 hover:text-foreground/80 text-foreground/60 hover:scale-105"
                    >
                        Search
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <Button variant="ghost" size="icon" className="hover:bg-white/10 transition-all duration-200 hover:scale-110">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10 transition-all duration-200 hover:scale-110">
                        <Moon className="h-5 w-5" />
                    </Button>
                    <Button className="bg-gradient-primary text-white hover:opacity-90 transition-all duration-200 hover:scale-105 ml-2">
                        Sign In
                    </Button>
                </div>
            </div>
        </header>
    );
}
