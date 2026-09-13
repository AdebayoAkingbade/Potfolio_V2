import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Globe2,
  Mail,
  MapPin,
  Phone,
  PlayCircle,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";

import type { PortfolioDraft, PublishedPortfolio } from "@/types/portfolio-engine";
import { calculatePortfolioScore } from "@/lib/portfolio-engine/scoring";
import { getProfessionConfig } from "@/lib/portfolio-engine/professions";
import { getTemplateById } from "@/lib/portfolio-engine/templates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PreviewPortfolio = PortfolioDraft | PublishedPortfolio;

function hasValue(value: string) {
  return value.trim().length > 0;
}

export function PortfolioPreview({
  portfolio,
  compact = false,
}: {
  portfolio: PreviewPortfolio;
  compact?: boolean;
}) {
  const profession = getProfessionConfig(portfolio.profession);
  const template = getTemplateById(portfolio.templateId);
  const score = "score" in portfolio ? portfolio.score : calculatePortfolioScore(portfolio);
  const basics = portfolio.basics;
  const contactHref = basics.email ? `mailto:${basics.email}` : basics.socialLinks[0]?.url;
  const profilePhotoSrc = basics.profilePhoto?.url ?? basics.profilePhoto?.dataUrl;

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <section
        className={cn("relative p-6 md:p-10", `bg-gradient-to-br ${template.accentClass}`)}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{profession.label}</Badge>
              <Badge variant="secondary">{template.name}</Badge>
              {template.category === "marketplace" ? <Badge variant="outline">Marketplace</Badge> : null}
              {portfolio.plan === "pro" ? <Badge variant="outline">Pro</Badge> : null}
              <Badge variant="outline">{score.score}/100</Badge>
            </div>
            <h1 className="mt-6 text-balance font-display text-4xl font-semibold md:text-6xl">
              {basics.name || "Your Name"}
            </h1>
            <p className="mt-3 text-xl text-primary">{basics.title || "Professional Title"}</p>
            <p className="mt-5 max-w-2xl text-pretty leading-8 text-muted-foreground">
              {basics.summary ||
                "A focused professional summary will appear here as the portfolio takes shape."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {hasValue(basics.location) ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {basics.location}
                </span>
              ) : null}
              {hasValue(basics.email) ? (
                <a
                  className="inline-flex items-center gap-2 hover:text-foreground"
                  href={`mailto:${basics.email}`}
                >
                  <Mail className="h-4 w-4 text-primary" />
                  {basics.email}
                </a>
              ) : null}
              {hasValue(basics.phone) ? (
                <a
                  className="inline-flex items-center gap-2 hover:text-foreground"
                  href={`tel:${basics.phone}`}
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {basics.phone}
                </a>
              ) : null}
              {portfolio.customDomain?.hostname ? (
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" />
                  {portfolio.customDomain.hostname}
                </span>
              ) : null}
            </div>
          </div>

          {profilePhotoSrc ? (
            <Image
              src={profilePhotoSrc}
              alt={`${basics.name || "Portfolio"} profile`}
              width={144}
              height={144}
              unoptimized
              className="h-28 w-28 rounded-lg border border-border object-cover md:h-36 md:w-36"
            />
          ) : (
            <div className="grid h-28 w-28 place-items-center rounded-lg border border-border bg-background/60 font-display text-3xl font-semibold text-muted-foreground md:h-36 md:w-36">
              {(basics.name || "P")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
        </div>
      </section>

      <section
        className={cn(
          "grid border-t border-border",
          compact ? "md:grid-cols-2" : "lg:grid-cols-3",
        )}
      >
        <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(portfolio.skills.length
              ? portfolio.skills
              : profession.suggestedSkills.slice(0, 6)
            ).map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Experience</h2>
          </div>
          <div className="space-y-4">
            {portfolio.experience.slice(0, compact ? 2 : 4).map((item) => (
              <div key={item.id}>
                <p className="font-medium">{item.role || "Role"}</p>
                <p className="text-sm text-muted-foreground">
                  {item.organization || "Organization"}
                  {item.start || item.end ? `, ${item.start} - ${item.end || "Present"}` : ""}
                </p>
                {item.summary ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Score</h2>
          </div>
          <p className="font-display text-4xl font-semibold">{score.score}</p>
          <p className="mt-1 text-sm text-muted-foreground">{score.level}</p>
          {contactHref ? (
            <a
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
              href={contactHref}
            >
              Contact
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
          {portfolio.team.agencyMode ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              {portfolio.team.members.length} collaborators
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-border p-5 md:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <h2 className="font-display text-2xl font-semibold">Selected Work</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {portfolio.projects.slice(0, compact ? 2 : 6).map((project) => (
            <article
              key={project.id}
              className="rounded-md border border-border bg-background/60 p-4"
            >
              <p className="font-semibold">{project.title || "Project title"}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {project.summary || "Project summary and contribution will appear here."}
              </p>
              {project.outcome ? (
                <p className="mt-3 text-sm text-primary">{project.outcome}</p>
              ) : null}
              {project.videos.length ? (
                <div className="mt-4 grid gap-3">
                  {project.videos.slice(0, compact ? 1 : 3).map((video) => {
                    const videoSrc = video.url ?? video.dataUrl;
                    return videoSrc ? (
                      <div key={video.id} className="overflow-hidden rounded-md border border-border">
                        <video
                          controls
                          preload="metadata"
                          src={videoSrc}
                          className="aspect-video w-full bg-muted object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        key={video.id}
                        className="flex items-center gap-2 rounded-md border border-border p-3 text-sm text-muted-foreground"
                      >
                        <PlayCircle className="h-4 w-4 text-primary" />
                        {video.name}
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {link.label || "Link"}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
