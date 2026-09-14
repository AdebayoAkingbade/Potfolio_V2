import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
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
import { hasPortfolioFeature } from "@/lib/portfolio-engine/entitlements";
import { calculatePortfolioScore } from "@/lib/portfolio-engine/scoring";
import { getProfessionConfig } from "@/lib/portfolio-engine/professions";
import { getTemplateById } from "@/lib/portfolio-engine/templates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PreviewPortfolio = PortfolioDraft | PublishedPortfolio;

function hasValue(value: string) {
  return value.trim().length > 0;
}

function linkEventType(label: string, url: string) {
  const searchable = `${label} ${url}`.toLowerCase();
  if (url.startsWith("mailto:") || url.startsWith("tel:")) return "contact_click";
  if (searchable.includes("linkedin")) return "linkedin_click";
  if (searchable.includes("github")) return "github_click";
  if (searchable.includes("resume") || searchable.includes("cv")) return "cv_download";
  return "click";
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
  const visibleSocialLinks = basics.socialLinks.filter((link) => link.url).slice(0, 6);

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
              {template.category === "marketplace" ? <Badge variant="outline">Premium</Badge> : null}
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
                  data-portfolio-event="contact_click"
                  data-portfolio-section="Email"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  {basics.email}
                </a>
              ) : null}
              {hasValue(basics.phone) ? (
                <a
                  className="inline-flex items-center gap-2 hover:text-foreground"
                  href={`tel:${basics.phone}`}
                  data-portfolio-event="contact_click"
                  data-portfolio-section="Phone"
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
            {visibleSocialLinks.length ? (
              <nav className="mt-5 flex flex-wrap gap-3" aria-label="Profile links">
                {visibleSocialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    data-portfolio-event={linkEventType(link.label, link.url)}
                    data-portfolio-section={link.label || "Profile link"}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-foreground"
                  >
                    {link.label || "Profile"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </nav>
            ) : null}
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
              data-portfolio-event={linkEventType("Contact", contactHref)}
              data-portfolio-section="Contact"
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

      {portfolio.education.length || portfolio.certifications.length ? (
        <section
          className={cn(
            "grid border-t border-border",
            compact ? "md:grid-cols-2" : "lg:grid-cols-2",
          )}
        >
          {portfolio.education.length ? (
            <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Education</h2>
              </div>
              <div className="space-y-4">
                {portfolio.education.slice(0, compact ? 2 : 4).map((item) => (
                  <div key={item.id}>
                    <p className="font-medium">
                      {item.credential || item.field || "Education"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.school || "School"}
                      {item.start || item.end ? `, ${item.start} - ${item.end || "Present"}` : ""}
                    </p>
                    {item.summary ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.summary}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {portfolio.certifications.length ? (
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Certifications</h2>
              </div>
              <div className="space-y-4">
                {portfolio.certifications.slice(0, compact ? 2 : 5).map((item) => (
                  <div key={item.id}>
                    <p className="font-medium">{item.name || "Certification"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.issuer || "Issuer"}
                      {item.issuedAt ? `, ${item.issuedAt}` : ""}
                    </p>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        data-portfolio-event="click"
                        data-portfolio-section={item.name || "Certification"}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary"
                      >
                        Credential
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="border-t border-border p-5 md:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <h2 className="font-display text-2xl font-semibold">Selected Work</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {portfolio.projects.slice(0, compact ? 2 : 6).map((project) => (
            <article
              key={project.id}
              data-portfolio-project={project.title || "Project"}
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
                    data-portfolio-event={linkEventType(link.label, link.url)}
                    data-portfolio-section={project.title || link.label || "Project"}
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
      {!hasPortfolioFeature(portfolio, "removeBranding") ? (
        <footer className="border-t border-border p-5 text-sm text-muted-foreground">
          Made with Portfolio Engine
        </footer>
      ) : null}
    </article>
  );
}
