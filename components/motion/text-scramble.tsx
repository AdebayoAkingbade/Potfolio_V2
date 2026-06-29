"use client";

import * as React from "react";

const glyphs = "01{}[]<>/\\+-*=#";

export function TextScramble({ text, className }: { text: string; className?: string }) {
  const [output, setOutput] = React.useState(text);
  const intervalRef = React.useRef<number | null>(null);

  const runScramble = React.useCallback(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    if (intervalRef.current) window.clearInterval(intervalRef.current);

    let frame = 0;
    const totalFrames = 18;

    const tick = () => {
      frame += 1;
      const progress = Math.min(1, frame / totalFrames);
      if (progress >= 1) {
        setOutput(text);
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      setOutput(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index / text.length < progress) return char;
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join(""),
      );
    };

    intervalRef.current = window.setInterval(tick, 28);
  }, [text]);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span className={className} onFocus={runScramble} onMouseEnter={runScramble}>
      {output}
    </span>
  );
}
