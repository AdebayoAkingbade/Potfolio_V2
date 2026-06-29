"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Trophy } from "lucide-react";

import { experiences } from "@/data/site";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Timeline() {
  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <SectionWrapper id="experience" className="mesh-surface">
      <div className="container">
        <AnimatedHeading
          eyebrow="Experience"
          title="A career shaped by fast product loops and durable engineering choices."
          description="Across fintech, education, Web3, and enterprise products, the work has stayed consistent: turn complex requirements into secure, maintainable systems people can trust."
        />

        <div className="relative mt-14 space-y-6 before:absolute before:left-4 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-border md:before:left-1/2">
          {experiences.map((experience, index) => {
            const open = openIndex === index;

            return (
              <motion.article
                key={`${experience.company}-${experience.role}`}
                className={cn(
                  "relative grid gap-5 pl-12 md:grid-cols-2 md:pl-0",
                  index % 2 === 1 && "md:[&>div:first-child]:order-2",
                )}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <span className="absolute left-1 top-5 z-10 h-7 w-7 rounded-full border border-primary/50 bg-background p-1 md:left-1/2 md:-translate-x-1/2">
                  <span className="block h-full rounded-full bg-primary" />
                </span>

                <div className={cn(index % 2 === 0 ? "md:pr-12" : "md:pl-12")}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-border bg-card p-5 text-left transition hover:border-primary/50 hover:shadow-glow"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? -1 : index)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{experience.duration}</p>
                        <h3 className="mt-2 font-display text-2xl font-semibold">
                          {experience.role}
                        </h3>
                        <p className="mt-1 text-primary">{experience.company}</p>
                      </div>
                      <ChevronDown
                        className={cn("h-5 w-5 shrink-0 transition", open && "rotate-180")}
                      />
                    </div>
                    <p className="mt-4 leading-7 text-muted-foreground">{experience.summary}</p>
                  </button>
                </div>

                <div className={cn(index % 2 === 0 ? "md:pl-12" : "md:pr-12")}>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        className="rounded-lg border border-border bg-background/[0.72] p-5"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28 }}
                      >
                        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          <Trophy className="h-4 w-4 text-ember" />
                          Responsibilities
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                          {experience.responsibilities.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {experience.technologies.map((tech) => (
                            <Badge key={tech} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-5 grid gap-3">
                          {experience.achievements.map((achievement) => (
                            <div
                              key={achievement}
                              className="rounded-md border border-border bg-card/70 p-3 text-sm text-muted-foreground"
                            >
                              {achievement}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <a href="#projects">See selected projects</a>
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
