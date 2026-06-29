"use client";

import * as React from "react";
import Link from "next/link";

import { useMagnetic } from "@/hooks/use-magnetic";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  download?: boolean;
};

export function MagneticButton({
  href,
  children,
  className,
  external,
  download,
}: MagneticButtonProps) {
  const ref = useMagnetic(0.22);
  const props = external
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};

  return (
    <Link
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      download={download}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background/60 px-4 text-sm font-medium transition hover:border-primary/50 hover:bg-primary/10",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
