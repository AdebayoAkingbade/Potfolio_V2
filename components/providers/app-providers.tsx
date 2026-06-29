"use client";

import { ThemeProvider } from "next-themes";

import { useLenis } from "@/hooks/use-lenis";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useLenis();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
