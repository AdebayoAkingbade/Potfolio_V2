"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import { testimonials } from "@/data/site";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";

export function Testimonials() {
  return (
    <SectionWrapper id="testimonials" className="mesh-surface">
      <div className="container">
        <AnimatedHeading
          eyebrow="Testimonials"
          title="Collaborators describe the work as thoughtful, calm, and built to last."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              className="rounded-lg border border-border bg-card p-6"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <Quote className="h-7 w-7 text-primary" />
              <blockquote className="mt-5 text-pretty leading-8 text-muted-foreground">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-medium">{testimonial.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
