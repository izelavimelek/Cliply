"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useThemePreference } from "@/hooks/useThemePreference";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
  const { setTheme, theme } = useThemePreference();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "transition-all duration-200",
            isCollapsed ? "h-7 w-7" : "h-9 w-9"
          )}
        >
          <Sun className={cn(
            "rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0",
            isCollapsed ? "h-3.5 w-3.5" : "h-[1.2rem] w-[1.2rem]"
          )} />
          <Moon className={cn(
            "absolute rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100",
            isCollapsed ? "h-3.5 w-3.5" : "h-[1.2rem] w-[1.2rem]"
          )} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="transition-all duration-200">
        <DropdownMenuItem onClick={() => setTheme("light")} className="transition-colors duration-200">
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="transition-colors duration-200">
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="transition-colors duration-200">
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
