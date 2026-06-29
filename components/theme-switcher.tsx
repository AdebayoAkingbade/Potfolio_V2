"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button aria-label="Toggle color theme" size="icon" variant="ghost">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const currentIndex = Math.max(
    0,
    themes.findIndex((item) => item.value === theme),
  );
  const next = themes[(currentIndex + 1) % themes.length];
  const Icon = themes[currentIndex]?.icon ?? Moon;

  return (
    <Button
      aria-label={`Switch theme to ${next.label}`}
      title={`Theme: ${themes[currentIndex]?.label ?? "Dark"}`}
      size="icon"
      variant="ghost"
      onClick={() => setTheme(next.value)}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
