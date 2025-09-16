"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/parallax";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Pastel Background Elements */}
      <div className="absolute inset-0">
        {/* Soft pastel gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-purple-100/20 to-indigo-100/30 dark:from-pink-800/10 dark:via-purple-800/10 dark:to-indigo-800/10" />
        
        {/* Floating pastel elements */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.05, 1],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-pink-200/40 dark:bg-pink-400/20 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.1, 1],
            y: [0, 15, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200/50 dark:bg-purple-400/25 rounded-full blur-lg"
        />
        
        <motion.div
          animate={{ 
            rotate: [0, -360],
            scale: [1, 1.2, 1],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/4 w-20 h-20 bg-indigo-200/40 dark:bg-indigo-400/20 rounded-full blur-lg"
        />
        
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.15, 1],
            x: [0, -15, 0]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 right-1/3 w-16 h-16 bg-rose-200/50 dark:bg-rose-400/25 rounded-full blur-md"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 content-max-width container-padding text-center">
        <FadeIn direction="up" delay={0.2}>
          <motion.h1 
            className="text-display text-foreground mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect Brands &{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Creators
            </span>
          </motion.h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.4}>
          <motion.p 
            className="text-body-large text-muted-foreground mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The marketplace where brands discover authentic creators and creators earn fair, 
            transparent payouts. Track performance, verify engagement, and scale together.
          </motion.p>
        </FadeIn>

        <FadeIn direction="up" delay={0.6}>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/auth">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg px-8 py-4 h-auto rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 text-lg px-8 py-4 h-auto rounded-xl font-semibold transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>
        </FadeIn>
      </div>

      {/* Apple-style Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border border-muted-foreground/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
