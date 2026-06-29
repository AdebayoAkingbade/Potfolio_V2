"use client";

import { Download, ExternalLink } from "lucide-react";

import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ResumePreview({ children }: { children: React.ReactElement }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogDescription>
            A quick snapshot for recruiters with your current experience, projects, and core
            stack.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-muted/[0.35] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Summary</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">{siteConfig.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{siteConfig.role}</p>
            <p className="mt-4 leading-7 text-muted-foreground">{siteConfig.intro}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild>
              <a href={siteConfig.resume} download>
                <Download className="h-4 w-4" />
                Download Resume
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${siteConfig.email}`}>
                <ExternalLink className="h-4 w-4" />
                Email Me
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
