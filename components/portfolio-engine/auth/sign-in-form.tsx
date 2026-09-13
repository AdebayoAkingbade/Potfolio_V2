"use client";

import * as React from "react";
import { ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function PortfolioEngineSignInForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Portfolio Engine backend is not configured yet.");
      return;
    }

    const origin = window.location.origin;
    const redirectTo = `${origin}/portfolio-engine/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the secure sign-in link.");
  };

  return (
    <form onSubmit={signIn} className="rounded-lg border border-border bg-card p-6">
      <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
        <Mail className="h-5 w-5" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold">Sign in to Portfolio Engine</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        Use a magic link to save drafts securely and publish portfolios from your account.
      </p>
      <label className="mt-6 block">
        <span className="text-sm font-medium">Email address</span>
        <Input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2"
          placeholder="you@example.com"
        />
      </label>
      {message ? (
        <p
          className={
            status === "error"
              ? "mt-4 text-sm text-secondary"
              : "mt-4 text-sm text-muted-foreground"
          }
        >
          {message}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending link" : "Send secure link"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
