"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 28, stiffness: 260 });
  const springY = useSpring(y, { damping: 28, stiffness: 260 });
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const onMove = (event: MouseEvent) => {
      setVisible(true);
      x.set(event.clientX - 18);
      y.set(event.clientY - 18);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  if (!visible) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-[80] hidden h-9 w-9 rounded-full border border-primary/50 bg-primary/10 mix-blend-difference md:block"
      style={{ x: springX, y: springY }}
    />
  );
}
