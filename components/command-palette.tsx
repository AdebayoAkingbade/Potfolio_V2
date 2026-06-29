"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { commandGroups } from "@/constants/commands";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  const run = (href: string) => {
    onOpenChange(false);
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }
    router.push(href.startsWith("#") ? `/${href}` : href);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-start bg-background/70 px-4 pt-24 backdrop-blur-md md:place-items-center md:pt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => onOpenChange(false)}
        >
          <motion.div
            className="glass w-full max-w-xl overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <CommandPrimitive label="Command menu" className="bg-transparent">
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <CommandPrimitive.Input
                  autoFocus
                  placeholder="Search navigation or actions..."
                  className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <CommandPrimitive.List className="max-h-96 overflow-y-auto p-2">
                <CommandPrimitive.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No result found.
                </CommandPrimitive.Empty>
                {commandGroups.map((group) => (
                  <CommandPrimitive.Group
                    key={group.heading}
                    heading={group.heading}
                    className="px-1 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {group.items.map((item) => (
                      <CommandPrimitive.Item
                        key={item.href}
                        value={item.label}
                        onSelect={() => run(item.href)}
                        className="mt-1 flex cursor-pointer items-center justify-between rounded-md px-3 py-3 text-sm normal-case tracking-normal text-foreground outline-none transition data-[selected=true]:bg-primary/10"
                      >
                        {item.label}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                ))}
              </CommandPrimitive.List>
            </CommandPrimitive>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
