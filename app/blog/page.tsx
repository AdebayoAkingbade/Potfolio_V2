import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { blogPosts } from "@/data/site";
import { formatDate } from "@/lib/utils";
import { createMetadata } from "@/utils/metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = createMetadata({
  title: "Writing",
  description: "Articles about frontend architecture, motion, AI interfaces, and performance.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <main className="container section-pad pt-32">
      <Button asChild variant="outline">
        <Link href="/#blog">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </Button>
      <h1 className="mt-10 max-w-4xl text-balance font-display text-5xl font-semibold tracking-normal md:text-7xl">
        Writing
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        Notes on shipping expressive software without sacrificing reliability, accessibility, or
        performance.
      </p>

      <div className="mt-10 grid gap-5">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="rounded-lg border border-border bg-card p-6 transition hover:border-primary/50"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold">{post.title}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{post.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              Read article
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
