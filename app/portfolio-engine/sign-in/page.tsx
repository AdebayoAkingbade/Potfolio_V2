import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PortfolioEngineSignInForm } from "@/components/portfolio-engine/auth/sign-in-form";
import { Button } from "@/components/ui/button";
import { getPortfolioEngineAuth } from "@/lib/portfolio-engine/server/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Sign In | Portfolio Engine",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortfolioEngineSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/portfolio-engine/create";
  const auth = await getPortfolioEngineAuth();

  if (auth.configured && auth.user) redirect(nextPath);

  return (
    <main className="min-h-screen pt-24">
      <section className="px-4 py-12">
        <div className="container grid gap-8 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-start">
          <div>
            <Button asChild variant="outline">
              <Link href="/portfolio-engine">
                <ArrowLeft className="h-4 w-4" />
                Portfolio Engine
              </Link>
            </Button>
            <div className="mt-8">
              <PortfolioEngineSignInForm nextPath={nextPath} />
            </div>
          </div>
          <aside className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-semibold">Why sign in?</h2>
            <div className="mt-5 grid gap-4 text-sm leading-6 text-muted-foreground">
              <p>Your drafts become tied to your account, not just one browser.</p>
              <p>Publishing happens server-side so other people can open the public URL.</p>
              <p>AI requests run through protected API routes, so provider keys stay private.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
