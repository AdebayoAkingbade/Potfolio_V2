import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";

import type { Project } from "@/types/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <ul className="mt-5 space-y-3 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="leading-7">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CaseStudy({ project }: { project: Project }) {
  return (
    <main className="pt-28">
      <section className="container">
        <Button asChild variant="outline">
          <Link href="/#projects">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </Button>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{project.category}</Badge>
              <Badge variant="outline">{project.year}</Badge>
              <Badge variant="secondary">{project.role}</Badge>
            </div>
            <h1 className="mt-6 max-w-4xl text-balance font-display text-5xl font-semibold tracking-normal md:text-7xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
              {project.description}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Metrics</p>
            <div className="mt-5 grid gap-3">
              {project.metrics.map((metric) => (
                <div
                  key={metric}
                  className="rounded-md border border-border bg-muted/[0.35] p-3"
                >
                  {metric}
                </div>
              ))}
            </div>
            {project.liveUrl || project.githubUrl ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.liveUrl ? (
                  <Button asChild size="sm">
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">
                      Live demo
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
                {project.githubUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={project.githubUrl} target="_blank" rel="noreferrer">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-card">
          <Image
            src={project.image}
            alt={`${project.title} screenshot`}
            width={1586}
            height={1003}
            priority
            className="aspect-[16/10] w-full object-cover"
          />
        </div>
      </section>

      <section className="container section-pad">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Problem</p>
            <h2 className="mt-4 font-display text-3xl font-semibold">The work started here.</h2>
            <p className="mt-5 leading-8 text-muted-foreground">{project.problem}</p>
          </div>
          <DetailList title="Research" items={project.research} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DetailList title="Planning" items={project.planning} />
          <DetailList title="Architecture Highlights" items={project.architecture} />
          <DetailList title="System Design" items={project.systemDesign} />
          <DetailList title="Challenges" items={project.challenges} />
          <DetailList title="Solutions" items={project.solutions} />
          <DetailList title="Performance" items={project.performance} />
        </div>

        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Tech Stack</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-[#090b0f] p-6 text-white">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose" />
            <span className="h-3 w-3 rounded-full bg-ember" />
            <span className="h-3 w-3 rounded-full bg-mint" />
          </div>
          <h2 className="font-display text-2xl font-semibold">Code Snippet</h2>
          <pre className="mt-5 overflow-x-auto rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/[0.78]">
            <code>{project.codeSnippet}</code>
          </pre>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Gallery & Animations</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            The final product uses subtle hover tilt, reveal choreography, and responsive image
            transitions to make the case study feel alive without turning the page into a heavy
            demo reel.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {project.gallery.concat(project.image).map((image, index) => (
              <Image
                key={`${image}-${index}`}
                src={image}
                alt={`${project.title} gallery image ${index + 1}`}
                width={1586}
                height={1003}
                className="rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        </section>

        <DetailList title="Lessons Learned" items={project.lessons} />
      </section>
    </main>
  );
}
