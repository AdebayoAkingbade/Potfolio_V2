import type { Metadata } from "next";

import { EngineLanding } from "@/components/portfolio-engine/engine-landing";
import { createMetadata } from "@/utils/metadata";

export const metadata: Metadata = createMetadata({
  title: "Portfolio Engine",
  description:
    "Create a professional portfolio website in minutes with Portfolio Engine by Akingbade.",
  path: "/portfolio-engine",
});

export default function PortfolioEnginePage() {
  return <EngineLanding />;
}
