import type { Metadata } from "next";

import { PortfolioCreateWizard } from "@/components/portfolio-engine/create-wizard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Create Portfolio | Portfolio Engine",
  description: "Create a professional portfolio website with Portfolio Engine.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortfolioCreatePage() {
  return <PortfolioCreateWizard />;
}
