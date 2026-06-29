"use client";

import * as React from "react";

export function useScrollDirection() {
  const [direction, setDirection] = React.useState<"up" | "down">("up");

  React.useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const nextY = window.scrollY;
      if (Math.abs(nextY - lastY) > 8) {
        setDirection(nextY > lastY && nextY > 120 ? "down" : "up");
        lastY = nextY;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return direction;
}
