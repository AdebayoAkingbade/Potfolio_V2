import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

import { blogPosts } from "@/data/site";
import { formatDate } from "@/lib/utils";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { SectionWrapper } from "@/components/motion/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Blog() {
  return (
    <SectionWrapper id="blog">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <AnimatedHeading
            eyebrow="Blog"
            title="Writing about interface engineering, AI workflows, and performance."
          />
          <Button asChild variant="outline">
            <Link href="/blog">
              All writing
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-lg border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold">{post.title}</h3>
              <p className="mt-3 text-pretty leading-7 text-muted-foreground">{post.description}</p>
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
      </div>
    </SectionWrapper>
  );
}
