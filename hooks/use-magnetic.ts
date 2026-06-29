"use client";

import * as React from "react";

export function useMagnetic(strength = 0.26) {
  const ref = React.useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onMove = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const rect = element.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left - rect.width / 2;
      const y = mouseEvent.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    };

    const onLeave = () => {
      element.style.transform = "translate3d(0, 0, 0)";
    };

    element.addEventListener("mousemove", onMove);
    element.addEventListener("mouseleave", onLeave);

    return () => {
      element.removeEventListener("mousemove", onMove);
      element.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}
