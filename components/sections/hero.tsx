"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";

import { siteConfig, socialLinks } from "@/data/site";
import { socialIconMap } from "@/components/icon-map";
import { MagneticButton } from "@/components/magnetic-button";
import { TextScramble } from "@/components/motion/text-scramble";
import { ResumePreview } from "@/components/resume-preview";
import { Button } from "@/components/ui/button";

const ParticleBackground = React.lazy(() =>
  import("@/components/three/particle-background").then((mod) => ({
    default: mod.ParticleBackground,
  })),
);

export function Hero() {
  return (
    <section className="relative grid min-h-[100svh] place-items-center overflow-hidden px-4 py-24 text-white">
      <React.Suspense fallback={<div className="absolute inset-0 -z-10 bg-[#090b0f]" />}>
        <ParticleBackground />
      </React.Suspense>
      <div className="hero-copy z-10 text-center sm:mx-auto sm:max-w-6xl">
        <motion.p
          className="mx-auto flex w-full max-w-[20rem] items-center justify-center rounded-md border border-white/10 bg-white/[0.08] px-3 py-2 text-center text-[10px] font-medium uppercase leading-5 tracking-[0.14em] text-white/[0.78] backdrop-blur-md sm:inline-flex sm:w-auto sm:max-w-none sm:text-xs sm:tracking-[0.24em]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <TextScramble className="sm:hidden" text="Available for senior work" />
          <TextScramble className="hidden sm:inline" text="Available for senior product engineering work" />
        </motion.p>

        <motion.h1
          className="mx-auto mt-8 max-w-5xl text-balance font-display text-4xl font-semibold tracking-normal sm:text-7xl md:text-8xl lg:text-9xl"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {siteConfig.name}
        </motion.h1>

        <p className="mt-5 font-display text-xl text-mint md:text-3xl">
          {siteConfig.role}
        </p>

        <p className="mx-auto mt-5 max-w-[19rem] text-pretty text-sm leading-7 text-white/[0.72] sm:max-w-2xl sm:text-base sm:leading-8 md:text-lg">
          {siteConfig.intro}
        </p>

        <div className="mx-auto mt-9 flex max-w-[340px] flex-wrap items-center justify-center gap-3 sm:max-w-none">
          {socialLinks.map((link) => {
            const Icon = socialIconMap[link.key];
            const external = link.href.startsWith("http");

            if (link.key === "resume") {
              return (
                <ResumePreview key={link.key}>
                  <Button
                    type="button"
                    variant="glass"
                    className="h-11 border-white/25 bg-white/[0.14] text-white shadow-glow hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </ResumePreview>
              );
            }

            return (
              <MagneticButton
                key={link.key}
                href={link.href}
                external={external}
                className="border-white/25 bg-white/[0.14] text-white shadow-glow hover:border-primary/60 hover:bg-white/20"
              >
                <Icon className="h-4 w-4 transition group-hover:scale-110" />
                {link.label}
              </MagneticButton>
            );
          })}
        </div>
      </div>

      <motion.div
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <a href="#about" className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:text-white">
          Scroll
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 z-10 hidden w-[min(92vw,760px)] -translate-x-1/2 translate-y-1/2 grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.08] backdrop-blur-md md:grid"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: "50%" }}
        transition={{ delay: 1.15, duration: 0.6 }}
      >
        {[
          ["60fps", "WebGL interactions"],
          ["RSC", "Fast content shell"],
          ["AA+", "Accessible motion"],
        ].map(([value, label]) => (
          <div key={value} className="border-r border-white/10 p-4 last:border-r-0">
            <p className="font-display text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-white/[0.56]">{label}</p>
          </div>
        ))}
      </motion.div>

      <div className="sr-only">
        <Github />
        <Linkedin />
        <Mail />
      </div>
    </section>
  );
}
