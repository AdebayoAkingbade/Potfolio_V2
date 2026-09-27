"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Gauge, Shield, Lock } from "lucide-react";

import type { Project } from "@/types/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = React.useRef<HTMLElement>(null);
  const isStealth = project.visibility === "stealth";

  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 8;
    const rotateX = -(y / rect.height - 0.5) * 8;
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const onLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <motion.article
      ref={ref}
      className={`group overflow-hidden rounded-lg border bg-card transition-transform duration-200 hover:border-primary/[0.45] hover:shadow-glow ${
        isStealth ? "border-amber-500/30 hover:border-amber-500/50" : "border-border"
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <Link href={`/projects/${project.slug}`} className="relative block overflow-hidden">
        {isStealth ? (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-background/80 px-2.5 py-1 text-xs font-medium text-amber-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            In Development
          </div>
        ) : null}
        <Image
          src={project.image}
          alt={`${project.title} product screenshot`}
          width={1586}
          height={1003}
          className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{project.category}</Badge>
          {isStealth ? (
            <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-medium">
              <Lock className="mr-1 h-3 w-3 inline" />
              {project.statusText || "AI Product · In Development"}
            </Badge>
          ) : (
            <Badge variant="outline">{project.year}</Badge>
          )}
          <Badge variant="secondary">{project.role}</Badge>
        </div>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-2xl font-semibold">{project.title}</h3>
            {isStealth ? (
              <span className="text-xs uppercase tracking-wider text-amber-400/90 font-medium">
                {project.developmentStatus || "Currently in Development"}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            {project.description}
          </p>
        </div>

        {isStealth ? (
          <div className="rounded-md border border-border/80 bg-background/50 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Capabilities Demonstrated
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(project.capabilitiesDemonstrated ?? project.stack.slice(0, 5)).map((cap) => (
                <span
                  key={cap}
                  className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground font-medium"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.stack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          {project.metrics.map((metric) => (
            <div
              key={metric}
              className="flex items-center gap-2 rounded-md border border-border bg-background/60 p-2 text-xs text-muted-foreground"
            >
              {isStealth ? (
                <Shield className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Gauge className="h-3.5 w-3.5 text-primary" />
              )}
              {metric}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {isStealth ? (
            <>
              <Button asChild>
                <Link href={`/projects/${project.slug}`}>
                  Executive Overview
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-amber-500/30 hover:bg-amber-500/10">
                <Link href="/#contact">
                  {project.safeCtaLabel || "Details Available on Request"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href={`/projects/${project.slug}`}>
                  Case study
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              {project.githubUrl ? (
                <Button asChild variant="outline">
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              ) : null}
              {project.liveUrl ? (
                <Button asChild variant="outline">
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    Live demo
                  </a>
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
