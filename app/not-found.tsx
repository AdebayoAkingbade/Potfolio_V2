import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="max-w-xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-normal md:text-6xl">
          This page drifted out of orbit.
        </h1>
        <p className="mt-5 text-pretty leading-7 text-muted-foreground">
          The route you opened does not exist, but the portfolio is still very much alive.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return home</Link>
        </Button>
      </section>
    </main>
  );
}
