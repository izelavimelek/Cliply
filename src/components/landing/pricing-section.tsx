"use client";

import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/parallax";
import { Check, Zap, Star, Crown } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Creators",
    description: "For content creators and influencers",
    price: "Free",
    period: "",
    popular: false,
    icon: Zap,
    features: [
      "No monthly fees",
      "Keep 85% of earnings",
      "Access to all campaigns",
      "Analytics dashboard",
      "Community support",
      "Basic verification tools"
    ],
    cta: "Get Started Free",
    href: "/auth"
  },
  {
    name: "Brands",
    description: "For businesses and marketers",
    price: "5%",
    period: "Platform fee on campaign budget",
    popular: true,
    icon: Star,
    features: [
      "Campaign management tools",
      "Creator discovery & matching",
      "Performance analytics",
      "Content verification system",
      "Priority support",
      "Advanced reporting"
    ],
    cta: "Start Campaign",
    href: "/auth"
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Custom",
    period: "Tailored pricing",
    popular: false,
    icon: Crown,
    features: [
      "Custom pricing",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "White-label options",
      "24/7 phone support"
    ],
    cta: "Contact Sales",
    href: "/contact"
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-white dark:bg-black">
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
              Simple,{" "}
              <span className="text-primary">
                Fair
              </span>{" "}
              Pricing
            </motion.h2>
            <motion.p 
              className="text-body-large text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              No hidden fees, no surprises. Just fair pricing for everyone in the creator economy.
            </motion.p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{ 
                  y: -8,
                  scale: plan.popular ? 1.02 : 1.01
                }}
                className="relative h-full"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                  >
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </motion.div>
                )}

                <div className={`apple-card apple-hover h-full ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}>
                  <div className="text-center">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5
                      }}
                      className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 mx-auto"
                    >
                      <plan.icon className="w-8 h-8 text-primary-foreground" />
                    </motion.div>

                    <h3 className="text-subheadline text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-body text-muted-foreground mb-6">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-8">
                      <span className="text-display text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-body text-muted-foreground ml-2">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 + featureIndex * 0.05 }}
                          className="flex items-center gap-3"
                        >
                          <Check className="w-5 h-5 text-success flex-shrink-0" />
                          <span className="text-body text-muted-foreground">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={plan.href}>
                        <button className={`w-full ${
                          plan.popular 
                            ? 'apple-button' 
                            : 'apple-button-outline'
                        }`}
                        >
                          {plan.cta}
                        </button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Apple-style Bottom Info */}
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
                Need a custom solution?
              </h3>
              <p className="text-body text-muted-foreground max-w-2xl mx-auto mb-8">
                We offer custom pricing and features for enterprise clients. 
                Contact our sales team to discuss your specific needs.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="apple-button-outline"
              >
                Contact Sales Team
              </motion.button>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
