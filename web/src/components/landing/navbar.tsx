"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
          <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">Cliply</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="#pricing" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="#team" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Team
            </Link>
          </div>

                           {/* Auth Buttons */}
                 <div className="hidden md:flex items-center space-x-4">
                   <ThemeToggle />
                   <Link href="/auth">
                     <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                       Log In
                     </Button>
                   </Link>
                   <Link href="/auth">
                     <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                       Get Started
                     </Button>
                   </Link>
                 </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link 
                href="#features" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="#pricing" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="#team" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Team
              </Link>
                                   <div className="pt-4 border-t border-border">
                       <div className="flex justify-center mb-4">
                         <ThemeToggle />
                       </div>
                       <Link href="/auth" className="block mb-3">
                         <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary">
                           Log In
                         </Button>
                       </Link>
                       <Link href="/auth">
                         <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                           Get Started
                         </Button>
                       </Link>
                     </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
