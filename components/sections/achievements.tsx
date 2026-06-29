"use client";

import { motion } from "framer-motion";
import { Award, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { achievements } from "@/data/site";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";

const icons = [TrendingUp, ShieldCheck, Sparkles, Award];

export function Achievements() {
  return (
    <SectionWrapper id="achievements" className="py-16">
      <div className="container">
        <AnimatedHeading
          eyebrow="Achievements"
          title="Proof points that balance polish with production reality."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement, index) => {
            const Icon = icons[index % icons.length];

            return (
              <motion.article
                key={achievement.label}
                className="rounded-lg border border-border bg-card p-5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-md bg-secondary/[0.15] text-secondary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-6 font-display text-4xl font-semibold">{achievement.value}</p>
                <h3 className="mt-2 font-semibold">{achievement.label}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{achievement.detail}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
