import type { PortfolioTemplate } from "@/types/portfolio-engine";

export const portfolioTemplates: PortfolioTemplate[] = [
  {
    id: "signal",
    name: "Signal",
    description: "A sharp technical profile for engineers, data people, and operators.",
    bestFor: ["Software & Technology", "Data & AI", "SRE", "Cybersecurity"],
    accentClass: "from-mint/30 via-cobalt/20 to-transparent",
    previewClass: "border-primary/50 bg-primary/10",
  },
  {
    id: "atelier",
    name: "Atelier",
    description: "Editorial layout for designers, writers, photographers, and creatives.",
    bestFor: ["Design", "Writing", "Photography & Video", "Creative Arts"],
    accentClass: "from-rose/30 via-ember/20 to-transparent",
    previewClass: "border-rose/50 bg-rose/10",
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Trust-forward format for business, finance, legal, and consulting work.",
    bestFor: ["Business & Consulting", "Finance", "Legal", "Healthcare"],
    accentClass: "from-cobalt/25 via-mint/20 to-transparent",
    previewClass: "border-cobalt/50 bg-cobalt/10",
  },
  {
    id: "stage",
    name: "Stage",
    description: "Outcome-led presentation for PMs, marketers, sales, events, and founders.",
    bestFor: ["Product", "Marketing", "Sales", "Events & Hospitality", "Entrepreneurs"],
    accentClass: "from-ember/30 via-primary/20 to-transparent",
    previewClass: "border-secondary/60 bg-secondary/10",
  },
];

export function getTemplateById(templateId: string) {
  return (
    portfolioTemplates.find((template) => template.id === templateId) ?? portfolioTemplates[0]
  );
}
