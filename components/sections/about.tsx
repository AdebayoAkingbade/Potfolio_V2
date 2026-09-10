"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, GitBranch, MapPin } from "lucide-react";

import { siteConfig, stats } from "@/data/site";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";
import { StatCounter } from "@/components/motion/stat-counter";
import { Button } from "@/components/ui/button";

const timeline = [
  [
    "2020",
    "Joined Decagon and co-developed Web3 finance and commerce products across dashboards, GraphQL APIs, Docker, and Firebase-backed workflows.",
  ],
  [
    "2021",
    "Moved into frontend leadership at Conclase, building enterprise React and Next.js dashboards while mentoring junior engineers.",
  ],
  [
    "2024",
    "Designed backend services and dynamic RBAC workflows for Belrald's school management platform.",
  ],
  [
    "2024-2026",
    "Built Ecobank fintech onboarding, admin, SSO, RBAC, notification, and AI automation systems used across 30+ affiliates.",
  ],
];

export function About() {
  return (
    <SectionWrapper id="about" className="pt-32 md:pt-40">
      <div className="container">
        <AnimatedHeading
          eyebrow="About"
          title="I build products where interaction quality and system quality reinforce each other."
          description="My work sits between frontend craft, cloud architecture, AI product thinking, and the small details that make software feel trustworthy."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <motion.div
            className="relative overflow-hidden rounded-lg border border-border bg-card"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/images/portrait.png"
              alt={`${siteConfig.name}, ${siteConfig.role}`}
              width={1122}
              height={1402}
              priority
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/[0.76] to-transparent p-5 text-white">
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-mint" />
                {siteConfig.location}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/60">
                Product systems, motion, AI
              </p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              className="terminal-grid overflow-hidden rounded-lg border border-border bg-card"
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <div className="flex items-center gap-2 border-b border-border bg-muted/[0.35] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose" />
                <span className="h-3 w-3 rounded-full bg-ember" />
                <span className="h-3 w-3 rounded-full bg-mint" />
                <span className="ml-2 text-xs text-muted-foreground">about.tsx</span>
              </div>
              <div className="p-5 font-mono text-sm leading-8 text-muted-foreground md:p-7">
                <p>
                  <span className="text-primary">const</span>{" "}
                  <span className="text-foreground">engineer</span> = {"{"}
                </p>
                <p className="pl-5">
                  role: <span className="text-ember">&quot;{siteConfig.role}&quot;</span>,
                </p>
                <p className="pl-5">
                  focus:{" "}
                  <span className="text-ember">
                    &quot;fast interfaces, resilient systems&quot;
                  </span>
                  ,
                </p>
                <p className="pl-5">
                  method:{" "}
                  <span className="text-ember">
                    &quot;prototype, measure, refine, ship&quot;
                  </span>
                  ,
                </p>
                <p className="pl-5">
                  taste:{" "}
                  <span className="text-ember">&quot;minimal, expressive, useful&quot;</span>
                </p>
                <p>{"};"}</p>
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <StatCounter
                  key={stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                />
              ))}
            </div>

            <div className="rounded-lg border border-border bg-card p-5 md:p-7">
              <div className="mb-6 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <h3 className="font-display text-xl font-semibold">Timeline</h3>
              </div>
              <div className="space-y-5">
                {timeline.map(([year, detail], index) => (
                  <motion.div
                    key={year}
                    className="grid gap-3 border-l border-border pl-5 sm:grid-cols-[80px_1fr]"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.42, delay: index * 0.05 }}
                  >
                    <p className="font-display text-lg font-semibold text-primary">{year}</p>
                    <p className="leading-7 text-muted-foreground">{detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button asChild variant="outline">
              <a href={siteConfig.linkedin} target="_blank" rel="noreferrer">
                View professional profile
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
