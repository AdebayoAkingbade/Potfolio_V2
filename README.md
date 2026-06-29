# Akingbade Portfolio

A premium, interactive developer portfolio built with Next.js 15, React 19, TypeScript, Tailwind
CSS, Framer Motion, React Three Fiber, Drei, Lenis, shadcn-style primitives, and MDX.

## Features

- Full-screen interactive Three.js particle hero with cursor-reactive parallax.
- Floating glass navigation with active section state, scroll progress, and hide-on-scroll behavior.
- Dark/light/system theme switching.
- Smooth scrolling via Lenis.
- About section with generated editorial portrait, terminal-style intro, timeline, and animated stats.
- Skill filters, animated cards, and an interactive radar chart.
- Expandable experience timeline.
- Searchable, filterable project showcase with image-led tilt cards.
- Dynamic case-study pages covering problem, research, planning, architecture, system design,
  challenges, solutions, stack, performance, lessons, screenshots, animations, snippets, and metrics.
- MDX-powered blog routes.
- Command palette with Ctrl+K / Cmd+K.
- Resume preview modal and downloadable sample resume.
- Accessible focus states, reduced-motion support, semantic landmarks, sitemap, robots, Open Graph,
  Twitter cards, and Schema.org Person JSON-LD.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run build
npm run lint
npm run typecheck
npm run format
```

## Folder Structure

```text
app/              App Router pages, metadata, robots, sitemap, MDX posts
components/       Reusable UI, shell, motion, sections, Three.js canvas
constants/        Command palette configuration
data/             Editable portfolio content
hooks/            Lenis, active section, scroll direction, magnetic hover
lib/              Utility helpers
public/           Generated images and downloadable resume sample
types/            Shared TypeScript types
utils/            Metadata helpers
```

## Customization

Update `data/site.ts` for name, links, stats, skills, experience, projects, testimonials, and blog
metadata. Replace `public/files/akingba-crown-resume.md` with a production resume PDF and update
`siteConfig.resume`.

Generated project-bound assets live at:

- `public/images/portrait.png`
- `public/images/projects/atlas-observability.png`
- `public/images/projects/orbit-commerce.png`
- `public/images/projects/kinetic-planner.png`

## Deployment

The app is ready for Vercel. Set `NEXT_PUBLIC_SITE_URL` to your production domain so canonical
URLs and social image links resolve correctly.
