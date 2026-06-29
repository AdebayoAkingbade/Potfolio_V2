"use client";

import * as React from "react";
import { motion } from "framer-motion";

import type { SkillCategory } from "@/types/site";
import { skillCategories, skills } from "@/data/site";
import { skillIconMap } from "@/components/icon-map";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const allCategory = "All";

function SkillRadar({ activeCategory }: { activeCategory: SkillCategory | typeof allCategory }) {
  const categories = skillCategories;
  const size = 280;
  const center = size / 2;
  const maxRadius = 106;
  const values = categories.map((category) => {
    const categorySkills = skills.filter((skill) => skill.category === category);
    const average =
      categorySkills.reduce((total, skill) => total + skill.level, 0) / categorySkills.length;
    return average / 100;
  });

  const pointFor = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
  };

  const polygon = values
    .map((value, index) => pointFor(index, maxRadius * value).join(","))
    .join(" ");

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Radar</p>
          <h3 className="mt-1 font-display text-xl font-semibold">Capability Shape</h3>
        </div>
        <Badge variant="secondary">{activeCategory}</Badge>
      </div>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto aspect-square w-full max-w-[280px]">
        {[0.35, 0.58, 0.82, 1].map((ring) => (
          <polygon
            key={ring}
            points={categories.map((_, index) => pointFor(index, maxRadius * ring).join(",")).join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-border"
          />
        ))}
        {categories.map((category, index) => {
          const [x, y] = pointFor(index, maxRadius + 22);
          return (
            <text
              key={category}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "fill-muted-foreground text-[10px] font-medium",
                activeCategory === category && "fill-primary",
              )}
            >
              {category}
            </text>
          );
        })}
        <motion.polygon
          points={polygon}
          fill="rgb(124 247 200 / 0.18)"
          stroke="#7cf7c8"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.9, transformOrigin: "center" }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      </svg>
    </div>
  );
}

export function Skills() {
  const [category, setCategory] = React.useState<SkillCategory | typeof allCategory>(allCategory);
  const filteredSkills =
    category === allCategory ? skills : skills.filter((skill) => skill.category === category);

  return (
    <SectionWrapper id="skills">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <AnimatedHeading
            eyebrow="Skills"
            title="A balanced toolkit for building, shipping, and evolving product systems."
            description="The portfolio is intentionally component-driven, with each interactive surface isolated to keep the static shell fast."
          />
          <SkillRadar activeCategory={category} />
        </div>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2 no-scrollbar" role="tablist">
          {[allCategory, ...skillCategories].map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? "default" : "outline"}
              size="sm"
              aria-pressed={category === item}
              onClick={() => setCategory(item as SkillCategory | typeof allCategory)}
            >
              {item}
            </Button>
          ))}
        </div>

        <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredSkills.map((skill, index) => {
            const Icon = skillIconMap[skill.icon as keyof typeof skillIconMap] ?? skillIconMap.code;

            return (
              <motion.article
                layout
                key={skill.name}
                className="group rounded-lg border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.025 }}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge variant="outline">{skill.experience}</Badge>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{skill.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{skill.category}</p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-mint via-cobalt to-ember"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
