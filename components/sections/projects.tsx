"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import type { ProjectCategory } from "@/types/site";
import { projects } from "@/data/site";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const allCategory = "All";
const categories: Array<ProjectCategory | typeof allCategory> = [
  allCategory,
  ...Array.from(new Set(projects.map((project) => project.category))),
];

export function Projects() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<ProjectCategory | typeof allCategory>(
    allCategory,
  );

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = category === allCategory || project.category === category;
    const searchable = `${project.title} ${project.description} ${project.stack.join(" ")} ${project.category}`;
    const matchesQuery = searchable.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <SectionWrapper id="projects">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <AnimatedHeading
            eyebrow="Projects"
            title="Selected work with the kind of detail senior hiring teams look for."
            description="Every project opens into implementation notes covering problem framing, architecture, system design, delivery challenges, and lessons learned."
          />

          <div className="rounded-lg border border-border bg-card p-4">
            <label
              className="text-sm font-medium text-muted-foreground"
              htmlFor="project-search"
            >
              Search projects
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="project-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try AI, RBAC, fintech..."
                className="pl-9"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={category === item ? "default" : "outline"}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <motion.div layout className="mt-10 grid gap-6 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 ? (
          <div className="mt-10 rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            No matching project yet.
          </div>
        ) : null}
      </div>
    </SectionWrapper>
  );
}
