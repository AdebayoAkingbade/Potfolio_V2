import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Setup | Portfolio Engine",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortfolioEngineSetupPage() {
  return (
    <main className="min-h-screen pt-24">
      <section className="px-4 py-12">
        <div className="container max-w-4xl">
          <Button asChild variant="outline">
            <Link href="/portfolio-engine">
              <ArrowLeft className="h-4 w-4" />
              Portfolio Engine
            </Link>
          </Button>
          <div className="mt-8 rounded-lg border border-border bg-card p-8">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold">
              Portfolio Engine backend setup
            </h1>
            <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
              Add Supabase to this Vercel project, run the migration in
              supabase/migrations, and set the environment variables below.
            </p>
            <div className="mt-6 grid gap-3 rounded-md border border-border bg-background/60 p-4 font-mono text-sm">
              <span>NEXT_PUBLIC_SUPABASE_URL=...</span>
              <span>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</span>
              <span>OPENAI_API_KEY=...</span>
              <span>PORTFOLIO_ENGINE_AI_MODEL=gpt-5-mini</span>
              <span>GITHUB_TOKEN=...</span>
              <span>STRIPE_PRO_CHECKOUT_URL=...</span>
            </div>
            <div className="mt-6 flex gap-3 rounded-md border border-primary/40 bg-primary/10 p-4 text-sm leading-6">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Drafts and publications are protected by Supabase Row Level Security. Public
                visitors can only read live published portfolios.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
