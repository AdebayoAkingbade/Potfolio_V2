"use client";

import Link from "next/link";
import { Command, Menu } from "lucide-react";
import { motion } from "framer-motion";

import { navItems, siteConfig } from "@/data/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Navbar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const sectionItems = navItems.filter((item) => item.href.startsWith("#"));
  const ids = sectionItems.map((item) => item.href.replace("#", ""));
  const activeSection = useActiveSection(ids);
  const direction = useScrollDirection();

  return (
    <motion.header
      className="fixed left-0 right-0 top-4 z-40 px-4"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: direction === "down" ? -96 : 0, opacity: direction === "down" ? 0 : 1 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
    >
      <nav
        aria-label="Main navigation"
        className="glass mx-auto flex h-14 w-[calc(100vw-2rem)] max-w-5xl items-center justify-between rounded-lg px-3"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-2 py-2 font-display text-sm font-semibold"
          aria-label="Go home"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-xs text-background">
            {siteConfig.initials}
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isSection = item.href.startsWith("#");
            const id = isSection ? item.href.replace("#", "") : "";
            const active = isSection && activeSection === id;

            return (
              <Link
                key={item.href}
                href={isSection ? `/${item.href}` : item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-md bg-primary/10"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <Button
            aria-label="Open command palette"
            title="Open command palette"
            size="icon"
            variant="ghost"
            onClick={onOpenCommand}
          >
            <Command className="hidden h-4 w-4 sm:block" />
            <Menu className="h-4 w-4 sm:hidden" />
          </Button>
          <ThemeSwitcher />
        </div>
      </nav>
    </motion.header>
  );
}
