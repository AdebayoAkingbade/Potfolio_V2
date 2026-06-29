import Link from "next/link";
import { Code2, Github, Linkedin, Mail } from "lucide-react";

import { siteConfig } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/70 py-10">
      <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="h-4 w-4" />
            Built with React, Next.js, Three.js, and TypeScript.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            aria-label="GitHub profile"
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            aria-label="LinkedIn profile"
            href={siteConfig.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
          <Link
            aria-label="Email"
            href={`mailto:${siteConfig.email}`}
            className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Mail className="h-5 w-5" />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">© {year} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
