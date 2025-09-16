"use client";

import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/parallax";
import { 
  UserPlus, 
  PenTool, 
  DollarSign
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create & Connect",
    description: "Brands create campaigns, creators discover opportunities that match their style and audience"
  },
  {
    number: "02", 
    icon: PenTool,
    title: "Create & Submit",
    description: "Creators produce authentic content and submit for verification with our smart caption system"
  },
  {
    number: "03",
    icon: DollarSign,
    title: "Track & Earn",
    description: "Monitor performance in real-time and receive automated payouts based on engagement metrics"
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="content-max-width container-padding">
        <FadeIn direction="up">
          <div className="text-center mb-20">
            <motion.h2 
              className="text-headline text-foreground mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              How{" "}
              <span className="text-primary">
                Cliply
              </span>{" "}
              Works
            </motion.h2>
            <motion.p 
              className="text-body-large text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Simple, transparent, and effective for everyone. Get started in minutes, not hours.
            </motion.p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ 
                  y: -8,
                  scale: 1.02
                }}
                className="relative"
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border to-border/50 z-0" />
                )}
                
                <div className="relative z-10 apple-card apple-hover">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-lg border border-border">
                    <span className="text-lg font-bold text-foreground">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5
                    }}
                    className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 mx-auto"
                  >
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </motion.div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-subheadline text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="text-body text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Apple-style CTA */}
        <FadeIn direction="up" delay={0.6}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 text-center"
          >
            <div className="apple-glass rounded-3xl p-12">
              <h3 className="text-subheadline text-foreground mb-4">
                Ready to get started?
              </h3>
              <p className="text-body text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of creators and brands who are already using Cliply to grow their business.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="apple-button"
              >
                Start Your Journey Today
              </motion.button>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
