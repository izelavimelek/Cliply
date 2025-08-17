"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">MVP Dashboard</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
