"use client";

import * as React from "react";

import { CommandPalette } from "@/components/command-palette";
import { CursorFollower } from "@/components/cursor-follower";
import { Navbar } from "@/components/navbar";
import { ScrollProgress } from "@/components/scroll-progress";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  return (
    <>
      <ScrollProgress />
      <CursorFollower />
      <Navbar onOpenCommand={() => setCommandOpen(true)} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      {children}
    </>
  );
}
