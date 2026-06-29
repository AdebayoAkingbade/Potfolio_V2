import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1
        className={cn("font-display text-4xl font-semibold tracking-normal md:text-6xl", className)}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2 className={cn("mt-12 font-display text-2xl font-semibold", className)} {...props} />
    ),
    p: ({ className, ...props }) => (
      <p className={cn("mt-5 leading-8 text-muted-foreground", className)} {...props} />
    ),
    a: ({ className, href = "", ...props }) => (
      <Link
        href={href}
        className={cn("font-medium text-primary underline-offset-4 hover:underline", className)}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("mt-6 list-disc space-y-3 pl-6 text-muted-foreground", className)} {...props} />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn("rounded-md border border-border bg-muted px-1.5 py-0.5 text-sm", className)}
        {...props}
      />
    ),
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "mt-6 overflow-x-auto rounded-lg border border-border bg-card p-4 text-sm",
          className,
        )}
        {...props}
      />
    ),
    ...components,
  };
}
