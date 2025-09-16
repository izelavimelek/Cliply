"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/parallax";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="section-padding bg-primary text-primary-foreground relative overflow-hidden">
      {/* Apple-style Minimal Background */}
      <div className="absolute inset-0">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        
        {/* Apple-style geometric elements */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.2, 0.05]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10 content-max-width container-padding text-center">
        <FadeIn direction="up">
          <motion.h2 
            className="text-display text-primary-foreground mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join Thousands of Brands &{" "}
            <span className="text-primary-foreground/80">
              Creators
            </span>
          </motion.h2>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <motion.p 
            className="text-body-large text-primary-foreground/80 mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Start your journey today and experience the future of brand-creator partnerships. 
            No setup fees, no hidden costs, just results.
          </motion.p>
        </FadeIn>

        <FadeIn direction="up" delay={0.4}>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-foreground text-primary px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                Start Creating Today
                <ArrowRight className="ml-2 w-5 h-5 inline" />
              </motion.button>
            </Link>
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 text-lg"
              >
                <Play className="mr-2 w-5 h-5 inline" />
                Watch Demo
              </motion.button>
            </Link>
          </motion.div>
        </FadeIn>

        {/* Apple-style Bottom Text */}
        <FadeIn direction="up" delay={0.6}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <p className="text-body text-primary-foreground/60">
              Join the creator economy revolution. Start your journey today.
            </p>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}