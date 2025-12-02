import Link from "next/link";
import { Moon } from "lucide-react";

import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { SearchDialogButton } from "@/components/search/search-dialog-button";

function getInitials(name?: string | null, email?: string | null) {
    if (name && name.trim().length > 0) {
        const [first, second] = name.trim().split(" ");
        return (first?.[0] ?? "") + (second?.[0] ?? "");
    }
    if (email) {
        return email.charAt(0).toUpperCase();
    }
    return "👤";
}

export async function Header() {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur">
            <div className="container flex h-16 items-center gap-6">
                {/* Logo */}
                <div className="flex">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-lg font-bold text-white shadow-lg">
                            ✨
                        </div>
                        <span className="hidden text-xl font-bold text-gradient sm:inline-block">
                            AI Blog
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="hidden flex-1 items-center space-x-6 text-sm font-medium text-foreground/60 transition-colors md:flex">
                    <Link href="/posts" className="hover:text-foreground">
                        Posts
                    </Link>
                    <Link href="/write" className="hover:text-foreground">
                        Write
                    </Link>
                    <Link href="/about" className="hover:text-foreground">
                        About
                    </Link>
                    <Link href="/search" className="hover:text-foreground">
                        Search
                    </Link>
                </nav>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2">
                    <SearchDialogButton />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-white/10 hover:scale-110 transition-all"
                    >
                        <Moon className="h-5 w-5" />
                    </Button>

                    {user ? (
                        <>
                            <div className="hidden text-right text-xs leading-tight text-muted-foreground sm:block">
                                <p className="text-sm font-semibold text-white">
                                    {user.name ?? "Reader"}
                                </p>
                                {user.email && <p>{user.email}</p>}
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white">
                                {getInitials(user.name, user.email)}
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
                                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                                >
                                    Sign out
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
                            <Button className="bg-gradient-primary text-white hover:opacity-90">
                                Sign in
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </header>
    );
}
