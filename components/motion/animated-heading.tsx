"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function AnimatedHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <motion.p
          className="text-sm font-medium uppercase tracking-[0.28em] text-primary"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          {eyebrow}
        </motion.p>
      ) : null}
      <motion.h2
        className="mt-4 text-balance font-display text-4xl font-semibold tracking-normal md:text-6xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.08 }}
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          className="mt-5 max-w-2xl text-pretty text-base leading-8 text-muted-foreground md:text-lg"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.14 }}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}
