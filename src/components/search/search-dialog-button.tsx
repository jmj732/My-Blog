"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SearchPanel } from "@/components/search/search-panel";

export function SearchDialogButton() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/10 hover:scale-110 transition-all"
                    aria-label="검색 열기"
                >
                    <Search className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl border-white/10 bg-background/95 backdrop-blur" showCloseButton>
                <SearchPanel autoFocus onNavigate={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
