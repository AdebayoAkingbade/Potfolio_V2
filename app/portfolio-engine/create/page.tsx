import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PortfolioCreateWizard } from "@/components/portfolio-engine/create-wizard";
import { getPortfolioEngineAuth } from "@/lib/portfolio-engine/server/auth";
import { getActiveDraftForUser } from "@/lib/portfolio-engine/server/repository";

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

export default async function PortfolioCreatePage() {
  const auth = await getPortfolioEngineAuth();

  if (auth.configured && !auth.user) {
    redirect("/portfolio-engine/sign-in?next=/portfolio-engine/create");
  }

  if (!auth.configured || !auth.user) {
    return <PortfolioCreateWizard persistenceMode="local" />;
  }

  try {
    const draft = await getActiveDraftForUser(auth.supabase, auth.user.id);

    return (
      <PortfolioCreateWizard
        initialDraft={draft ?? undefined}
        persistenceMode="server"
        userEmail={auth.user.email ?? undefined}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Portfolio Engine backend is unavailable.";

    return (
      <main className="container min-h-screen pt-28">
        <div className="rounded-lg border border-secondary/50 bg-secondary/10 p-6">
          <h1 className="font-display text-3xl font-semibold">Backend setup needed</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{message}</p>
        </div>
      </main>
    );
  }
}
