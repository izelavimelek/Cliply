"use client";

import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/parallax";
import { 
  Target, 
  BarChart, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Smart Campaign Matching",
    description: "AI-powered matching connects brands with the perfect creators for their campaigns"
  },
  {
    icon: BarChart,
    title: "Real-time Analytics",
    description: "Track performance, engagement, and ROI with comprehensive analytics and reporting"
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Automated, secure payouts with transparent fee structures and instant transfers"
  },
  {
    icon: Zap,
    title: "Fast Verification",
    description: "Automated content verification ensures quality and compliance with campaign requirements"
  },
  {
    icon: TrendingUp,
    title: "Growth Tools",
    description: "Built-in tools to help creators grow their audience and brands scale their reach"
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Dedicated support team and community forums for creators and brands"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-white dark:bg-black">
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
              Built for{" "}
              <span className="text-primary">
                Transparency
              </span>
            </motion.h2>
            <motion.p 
              className="text-body-large text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Fairness, and growth in the creator economy. Experience the future of brand-creator partnerships.
            </motion.p>
          </div>
        </FadeIn>
        
        <StaggerContainer className="apple-grid">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="apple-card apple-hover h-full"
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5
                    }}
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto"
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-subheadline text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-body text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Apple-style Trust Section */}
        <FadeIn direction="up" delay={0.4}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 text-center"
          >
            <div className="apple-glass rounded-3xl p-12">
              <h3 className="text-subheadline text-foreground mb-4">
                Trusted by 10,000+ Creators & 500+ Brands
              </h3>
              <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                Join the growing community of creators and brands who trust Cliply for their partnerships. 
                Start your journey today and experience the difference.
              </p>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
