import type {
  Achievement,
  BlogPost,
  Experience,
  Project,
  Skill,
  SkillCategory,
  SocialKey,
  Testimonial,
} from "@/types/site";

export const siteConfig = {
  name: "Akingbade",
  role: "Senior Software Engineer",
  intro:
    "I build secure fintech, education, commerce, and AI-powered platforms that turn complex workflows into dependable product experiences.",
  location: "Lagos, Nigeria",
  url: "https://akingbacrown.dev",
  email: "adejeremih@gmail.com",
  github: "https://github.com/akingbacrown",
  linkedin: "https://www.linkedin.com/in/adebayo-akingbade-0692b5161",
  calendar: "https://cal.com/akingbacrown/intro",
  resume: "/files/akingba-crown-resume.md",
  initials: "AA",
};

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Engine", href: "/portfolio-engine" },
  { label: "Projects", href: "#projects" },
  { label: "Writing", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export const socialLinks: Array<{ key: SocialKey; label: string; href: string }> = [
  { key: "github", label: "GitHub", href: siteConfig.github },
  { key: "linkedin", label: "LinkedIn", href: siteConfig.linkedin },
  { key: "resume", label: "Resume", href: siteConfig.resume },
  { key: "email", label: "Email", href: `mailto:${siteConfig.email}` },
];

export const stats = [
  { value: 6, suffix: "+", label: "Years of experience" },
  { value: 30, suffix: "+", label: "Countries supported" },
  { value: 8, suffix: "+", label: "Major platforms shipped" },
  { value: 1000, suffix: "+", label: "Daily users supported" },
];

export const skillCategories: SkillCategory[] = [
  "Frontend",
  "Backend",
  "Cloud",
  "DevOps",
  "AI",
  "Mobile",
  "Databases",
];

export const skills: Skill[] = [
  { name: "React", category: "Frontend", experience: "7 yrs", icon: "atom", level: 96 },
  { name: "Next.js", category: "Frontend", experience: "5 yrs", icon: "layers", level: 94 },
  { name: "Angular", category: "Frontend", experience: "4 yrs", icon: "blocks", level: 88 },
  { name: "TypeScript", category: "Frontend", experience: "6 yrs", icon: "braces", level: 95 },
  { name: "Java", category: "Backend", experience: "5 yrs", icon: "code", level: 89 },
  { name: "Spring Boot", category: "Backend", experience: "4 yrs", icon: "server", level: 88 },
  { name: "Node.js", category: "Backend", experience: "7 yrs", icon: "server", level: 91 },
  { name: "NestJS", category: "Backend", experience: "4 yrs", icon: "boxes", level: 84 },
  { name: "GraphQL", category: "Backend", experience: "5 yrs", icon: "share", level: 88 },
  { name: "Firebase", category: "Cloud", experience: "4 yrs", icon: "cloud", level: 84 },
  { name: "Vercel", category: "Cloud", experience: "4 yrs", icon: "triangle", level: 90 },
  { name: "Docker", category: "DevOps", experience: "6 yrs", icon: "container", level: 88 },
  { name: "CI/CD", category: "DevOps", experience: "6 yrs", icon: "workflow", level: 90 },
  { name: "Python NLP", category: "AI", experience: "3 yrs", icon: "brain", level: 85 },
  { name: "AI Filters", category: "AI", experience: "2 yrs", icon: "network", level: 82 },
  {
    name: "Mobile Admin",
    category: "Mobile",
    experience: "3 yrs",
    icon: "smartphone",
    level: 80,
  },
  {
    name: "PostgreSQL",
    category: "Databases",
    experience: "6 yrs",
    icon: "database",
    level: 89,
  },
  { name: "Redis", category: "Databases", experience: "5 yrs", icon: "zap", level: 82 },
];

export const experiences: Experience[] = [
  {
    company: "Ecobank Transnational Incorporated",
    role: "Software Engineer (Contract)",
    duration: "Jan 2024 - May 2026",
    summary:
      "Built and scaled fintech onboarding, administration, and automation systems used across 30+ countries and thousands of daily users.",
    responsibilities: [
      "Translated business requirements into maintainable applications across Java Spring Boot, Next.js, React, and Angular using MVC-aligned structures.",
      "Designed and implemented SSO and role-based access control to strengthen security and access management.",
      "Led core admin portal development for Ecobank Business App and Mobile 5 across onboarding, request management, audit trails, campaign management, and document configuration.",
      "Built real-time notification systems and AI-powered automation workflows with Python and NLP.",
    ],
    technologies: [
      "Java",
      "Spring Boot",
      "Next.js",
      "React",
      "Angular",
      "Python",
      "NLP",
      "SSO",
      "RBAC",
    ],
    achievements: [
      "Supported digital banking operations across 30+ affiliates.",
      "Improved governance with configurable feature controls, audit trails, and maker-checker approvals.",
      "Reduced support response time through AI-assisted workflow automation.",
    ],
  },
  {
    company: "Belrald",
    role: "Software Engineer (Contract)",
    duration: "2024",
    summary:
      "Designed backend services for a school management platform, including scalable APIs, authentication, and flexible permission controls.",
    responsibilities: [
      "Designed backend services using NestJS with scalable API boundaries.",
      "Implemented institution and staff onboarding, password creation, password reset, and account recovery workflows.",
      "Built dynamic RBAC systems for role creation and permission mapping across the platform.",
    ],
    technologies: ["NestJS", "Node.js", "TypeScript", "RBAC", "Authentication", "REST APIs"],
    achievements: [
      "Established a reusable access-control model for institutions and staff.",
      "Improved account recovery and onboarding reliability.",
      "Created backend foundations for a multi-role education product.",
    ],
  },
  {
    company: "Conclase",
    role: "Lead Frontend Engineer",
    duration: "2021 - 2023",
    summary:
      "Led enterprise Next.js and React application development while mentoring junior engineers and improving internal workflows.",
    responsibilities: [
      "Led frontend architecture for enterprise dashboards and workflow-heavy applications.",
      "Mentored junior engineers through implementation reviews and reusable UI patterns.",
      "Built dashboards that improved onboarding and internal operational visibility.",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Dashboards", "Frontend Architecture"],
    achievements: [
      "Improved onboarding workflows through clearer dashboard experiences.",
      "Raised frontend maintainability with shared patterns and team guidance.",
      "Helped junior engineers grow through practical delivery mentorship.",
    ],
  },
  {
    company: "Decagon",
    role: "Software Engineer",
    duration: "2020 - 2021",
    summary:
      "Co-developed Web3 finance and commerce products, contributing heavily to admin dashboards, GraphQL integrations, and Dockerized delivery environments.",
    responsibilities: [
      "Co-developed a Web3 finance platform and delivered over 50% of the admin dashboard features.",
      "Worked with GraphQL APIs to connect product workflows to backend services.",
      "Built full-stack commerce workflows with React, Spring Boot, Firebase, payments, bookings, and user management.",
    ],
    technologies: ["React", "TypeScript", "Spring Boot", "GraphQL", "Docker", "Firebase"],
    achievements: [
      "Delivered a major share of admin dashboard functionality for a finance platform.",
      "Contributed in Dockerized environments across frontend and backend services.",
      "Built production-ready commerce flows spanning payments, bookings, and users.",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "ecobank-business-mobile-admin",
    title: "Ecobank Business App and Mobile 5 Admin",
    category: "Fintech",
    description:
      "Admin and configuration systems for onboarding, requests, audit trails, campaigns, documents, feature controls, and maker-checker approvals across Ecobank digital banking channels.",
    image: "/images/projects/atlas-observability.png",
    stack: ["Angular", "React", "Next.js", "Java", "Spring Boot", "SSO", "RBAC"],
    metrics: ["30+ affiliates", "Maker-checker approvals", "Audit-backed controls"],
    year: "2024 - 2026",
    role: "Software Engineer",
    problem:
      "Regional banking teams needed centralized control over onboarding, configuration, approvals, and operational changes without weakening security or auditability.",
    research: [
      "Mapped onboarding, request, campaign, and document configuration flows with product and operations stakeholders.",
      "Reviewed approval paths for sensitive banking operations that required maker-checker enforcement.",
      "Identified the feature controls that needed dynamic enable and disable behavior across regions.",
    ],
    planning: [
      "Grouped workflows into role-aware modules for onboarding, request management, audit trails, campaigns, and document configuration.",
      "Defined configurable service controls for onboarding, transfers, payments, cards, and settings.",
      "Planned approval states so sensitive updates could be submitted, reviewed, approved, rejected, and audited.",
    ],
    architecture: [
      "Frontend modules used Angular, React, and Next.js surfaces depending on the platform context.",
      "Spring Boot services exposed structured workflow APIs aligned with business domains.",
      "SSO and RBAC guarded routes, actions, and data visibility across operational roles.",
    ],
    systemDesign: [
      "Maker-checker records preserve submitter, reviewer, decision, justification, and timestamps.",
      "Feature-control changes require audit-backed justification before taking effect.",
      "Role permissions separate configuration, review, approval, and reporting responsibilities.",
    ],
    challenges: [
      "The same platform needed to support many affiliates with different operational needs.",
      "Sensitive actions required strong controls without making daily admin work slow.",
      "Audit data had to stay clear enough for governance and compliance reviews.",
    ],
    solutions: [
      "Built reusable workflow patterns for requests, approvals, comments, and audit trails.",
      "Added dynamic feature toggles with required justification for risky service changes.",
      "Structured admin pages around clear task states and permission-aware actions.",
    ],
    performance: [
      "Kept data-heavy admin views organized with modular screens and scoped fetching.",
      "Reduced repeated implementation work by reusing approval and audit UI patterns.",
      "Improved operational response with real-time notification flows.",
    ],
    lessons: [
      "Banking admin tools work best when governance is built into the workflow, not added after launch.",
      "Configurable controls need visible reasoning so teams can trust each change.",
      "Role design is part of product design when every action carries operational risk.",
    ],
    codeSnippet: `const request = await submitForApproval({\n  service: "transfers",\n  action: "disable",\n  reason,\n  makerId: user.id,\n});`,
    gallery: ["/images/projects/atlas-observability.png"],
  },
  {
    slug: "aguard-ai-filter",
    title: "AGuard AI Filter",
    category: "AI",
    description:
      "An AI filter project for detecting, moderating, and routing unsafe or unwanted content before it reaches product workflows.",
    image: "/images/projects/orbit-commerce.png",
    stack: ["Python", "AI Safety", "Content Filtering", "NLP", "GitHub"],
    metrics: ["AI filter", "Safety-first routing", "Policy-aware checks"],
    githubUrl: "https://github.com/AdebayoAkingbade/AGuard",
    year: "2026",
    role: "Builder",
    problem:
      "AI products need a practical filtering layer that can inspect user input and model output before risky content moves deeper into an application.",
    research: [
      "Reviewed common content-risk patterns that can appear in user prompts and generated responses.",
      "Mapped which filter decisions should block, warn, redact, or route content for another review step.",
      "Studied how lightweight safety checks can fit into existing AI product workflows.",
    ],
    planning: [
      "Defined filter stages for input inspection, output inspection, and decision logging.",
      "Planned policy-aware checks so rules can evolve without rewriting the entire pipeline.",
      "Kept the project focused on being easy to integrate while the core filter logic matures.",
    ],
    architecture: [
      "Filtering logic evaluates content before it is passed to downstream AI workflows.",
      "Policy checks produce structured decisions that calling applications can act on.",
      "The project is organized as a reusable safety layer rather than a single-purpose assistant.",
    ],
    systemDesign: [
      "Filter results separate allow, block, warn, and review outcomes.",
      "Decision metadata gives applications enough context to explain or audit safety behavior.",
      "The pipeline can be extended with additional policies as the project grows.",
    ],
    challenges: [
      "Safety tooling needs clear decisions without becoming too rigid for real products.",
      "Filtering has to balance useful AI interactions with responsible boundaries.",
      "The project needs to stay simple enough to adopt while still leaving room for stronger checks.",
    ],
    solutions: [
      "Designed the filter around explicit outcomes instead of vague pass or fail behavior.",
      "Kept policy checks modular so new risk categories can be added cleanly.",
      "Focused on reusable integration points that can sit in front of different AI features.",
    ],
    performance: [
      "Established a foundation for safer AI request and response handling.",
      "Kept the filtering layer lightweight enough for product-facing workflows.",
      "Made safety decisions easier to inspect while the system continues evolving.",
    ],
    lessons: [
      "AI filters need transparent behavior because teams must understand why content was handled a certain way.",
      "Safety systems are easier to improve when policies are separate from product-specific code.",
      "A useful guard layer should reduce risk without making every interaction feel blocked.",
    ],
    codeSnippet: `const decision = await filterContent({\n  input,\n  policies: activePolicies,\n  context: productSurface,\n});`,
    gallery: ["/images/projects/orbit-commerce.png"],
  },
  {
    slug: "ecobank-document-management-system",
    title: "Document Management System",
    category: "Platform",
    description:
      "An end-to-end document management platform for Ecobank digital channels, built to support RPC workflows and centralized document control.",
    image: "/images/projects/kinetic-planner.png",
    stack: ["Angular", "Java", "Spring Boot", "RBAC", "Audit Trails"],
    metrics: ["Digital channel support", "RPC enablement", "End-to-end document flow"],
    year: "2025",
    role: "Software Engineer",
    problem:
      "Document processes across digital channels needed a reliable platform for creating, configuring, reviewing, and controlling operational documents.",
    research: [
      "Studied how documents moved through digital banking operations and RPC-related workflows.",
      "Identified roles responsible for document setup, review, approval, and maintenance.",
      "Mapped audit requirements for document changes and configuration updates.",
    ],
    planning: [
      "Modeled document records around ownership, status, channel, and approval state.",
      "Planned permission boundaries for document creators, reviewers, and administrators.",
      "Defined searchable views so teams could find and manage documents efficiently.",
    ],
    architecture: [
      "Spring Boot APIs handled document lifecycle operations and audit persistence.",
      "Frontend modules surfaced channel-specific document configuration flows.",
      "RBAC limited document actions based on role and operational responsibility.",
    ],
    systemDesign: [
      "Document updates move through explicit states from draft to reviewed configuration.",
      "Audit records capture who changed what, when, and why.",
      "Permission checks protect sensitive document operations throughout the workflow.",
    ],
    challenges: [
      "Different channels needed shared governance without losing their own configuration needs.",
      "Teams needed confidence that document updates were traceable.",
      "The platform had to support operational users who manage documents repeatedly.",
    ],
    solutions: [
      "Created role-aware document actions and status-driven screens.",
      "Added audit-friendly metadata to document changes and configuration updates.",
      "Kept common document tasks visible while moving advanced controls into focused flows.",
    ],
    performance: [
      "Improved document lookup with structured lists, filtering, and scoped views.",
      "Reduced ambiguity in repeated document administration tasks.",
      "Supported end-to-end document work across multiple digital channels.",
    ],
    lessons: [
      "Document systems succeed when status, ownership, and audit history are obvious.",
      "Operational platforms need fewer surprises and more visible control.",
      "Good RBAC design makes complex workflows feel simpler to the people using them.",
    ],
    codeSnippet: `await documents.updateStatus({\n  documentId,\n  nextStatus: "reviewed",\n  actorId: user.id,\n});`,
    gallery: ["/images/projects/kinetic-planner.png"],
  },
  {
    slug: "ecobank-referral-rewards",
    title: "Referral and Rewards System",
    category: "Fintech",
    description:
      "A rewards administration system for managing referrers who bring new users to Ecobank mobile platforms.",
    image: "/images/projects/atlas-observability.png",
    stack: ["React", "Java", "Spring Boot", "RBAC", "Notifications"],
    metrics: ["Referral tracking", "Rewards administration", "Mobile platform growth"],
    year: "2025",
    role: "Software Engineer",
    problem:
      "Business teams needed a reliable way to manage referral activity and administer rewards for users joining Ecobank mobile platforms.",
    research: [
      "Mapped referral flows from new-user acquisition through reward administration.",
      "Identified the roles needed to review, manage, and approve reward actions.",
      "Reviewed operational edge cases around duplicate referrals, eligibility, and status changes.",
    ],
    planning: [
      "Designed referral records around referrer, referred user, status, reward state, and audit metadata.",
      "Planned admin screens for search, review, reward management, and operational reporting.",
      "Defined notification touchpoints for key referral and reward state changes.",
    ],
    architecture: [
      "React admin views connected to Spring Boot APIs for referral and rewards operations.",
      "RBAC restricted sensitive reward actions to approved roles.",
      "Notification flows surfaced operational changes to the right teams.",
    ],
    systemDesign: [
      "Referral state transitions prevent rewards from being administered before eligibility is confirmed.",
      "Audit trails capture reward decisions and administrative changes.",
      "Search and filtering help teams manage referral records at operational scale.",
    ],
    challenges: [
      "Referral and reward states had to remain clear across business and support teams.",
      "Reward administration required control without slowing down legitimate approvals.",
      "Operational users needed fast lookup for referrer and referred-user records.",
    ],
    solutions: [
      "Modeled the workflow around explicit states and permission-aware actions.",
      "Added admin controls for reviewing and updating reward status.",
      "Built searchable views that made referral history easier to manage.",
    ],
    performance: [
      "Improved operational handling of referral records and reward actions.",
      "Reduced manual ambiguity by exposing status and eligibility clearly.",
      "Supported mobile growth operations with a repeatable administration flow.",
    ],
    lessons: [
      "Incentive systems need transparent states because small ambiguities become support work.",
      "RBAC is just as important for growth tools as it is for core banking workflows.",
      "Operational products improve when they make edge cases visible early.",
    ],
    codeSnippet: `await rewards.approve({\n  referralId,\n  reviewerId: user.id,\n  note: approvalNote,\n});`,
    gallery: ["/images/projects/atlas-observability.png"],
  },
  {
    slug: "belrald-school-management",
    title: "Belrald School Management",
    category: "Education",
    description:
      "Authentication, authorization, onboarding, password recovery, and dynamic RBAC modules for Belrald's school management platform.",
    image: "/images/projects/kinetic-planner.png",
    stack: ["NestJS", "Node.js", "TypeScript", "Authentication", "RBAC"],
    metrics: ["Institution onboarding", "Dynamic permissions", "Account recovery"],
    liveUrl: "https://belrald.com/",
    year: "2024",
    role: "Backend Engineer",
    problem:
      "Schools and platform staff needed secure onboarding, account access, and permission management across multiple institution roles.",
    research: [
      "Reviewed institution and staff onboarding requirements across the school management flow.",
      "Mapped user roles, permissions, and account recovery scenarios.",
      "Identified authentication paths that needed to be consistent for institutions and staff.",
    ],
    planning: [
      "Designed authentication modules for onboarding, password creation, password reset, and recovery.",
      "Modeled roles and permissions so administrators could create flexible access rules.",
      "Planned API boundaries around user, role, permission, and account recovery concerns.",
    ],
    architecture: [
      "NestJS services handled authentication, user onboarding, and permission APIs.",
      "Role and permission entities supported dynamic mapping across users.",
      "Recovery workflows separated identity verification from password updates.",
    ],
    systemDesign: [
      "RBAC permissions can be assigned to roles and mapped to users across the platform.",
      "Account recovery paths protect users while keeping the process usable.",
      "Institution onboarding creates the foundation for staff-level access control.",
    ],
    challenges: [
      "Access control needed to stay flexible as institutions and staff roles changed.",
      "Password and recovery flows had to be secure without adding friction.",
      "Backend modules needed clear boundaries for future platform growth.",
    ],
    solutions: [
      "Implemented reusable authentication and authorization services in NestJS.",
      "Created dynamic role creation and permission mapping workflows.",
      "Structured account recovery as a controlled, auditable process.",
    ],
    performance: [
      "Reduced duplication across authentication and onboarding flows.",
      "Improved maintainability by separating users, roles, and permissions.",
      "Gave platform administrators more flexible control over access.",
    ],
    lessons: [
      "Education platforms need access control that can grow with real institution structures.",
      "Authentication feels better when recovery flows are designed as primary workflows.",
      "A clean permission model saves product teams from one-off exceptions later.",
    ],
    codeSnippet: `await roles.attachPermissions({\n  roleId,\n  permissionIds,\n  updatedBy: admin.id,\n});`,
    gallery: ["/images/projects/kinetic-planner.png"],
  },
  {
    slug: "awari-autonomous-root-cause-engineering",
    title: "Àwárí - Autonomous Root-Cause Engineering",
    category: "AI",
    description:
      "Àwárí is an AI agent investigating 14 correlated signals across 3 services to surface likely root causes faster.",
    image: "/images/projects/orbit-commerce.png",
    stack: ["AI Agents", "Observability", "Root-Cause Analysis", "Signals", "GitHub"],
    metrics: ["14 correlated signals", "3 services", "Autonomous investigation"],
    githubUrl: "https://github.com/AdebayoAkingbade/Awari",
    year: "2026",
    role: "Builder",
    problem:
      "Engineering teams need faster ways to connect related production signals and move from noisy symptoms to credible root-cause hypotheses.",
    research: [
      "Mapped how incidents produce related traces, service signals, alerts, and operational context.",
      "Identified where manual triage slows teams down when multiple services are involved.",
      "Explored agent workflows that can summarize evidence instead of only listing alerts.",
    ],
    planning: [
      "Defined an investigation loop that gathers signals, correlates service behavior, and explains likely causes.",
      "Planned the experience around evidence-backed findings rather than opaque agent conclusions.",
      "Kept the initial scope centered on 14 correlated signals across 3 services.",
    ],
    architecture: [
      "Agent workflows inspect correlated service signals and turn them into investigation steps.",
      "Signal summaries preserve enough context for engineers to validate each hypothesis.",
      "The project is structured for iterative expansion as more telemetry sources are added.",
    ],
    systemDesign: [
      "Signal correlation groups related evidence before the agent proposes a likely cause.",
      "Investigation state tracks which services, symptoms, and hypotheses are active.",
      "Agent output is framed as engineering evidence that can be accepted, challenged, or refined.",
    ],
    challenges: [
      "Root-cause analysis can become noisy when signals overlap across services.",
      "The agent needs to be helpful without pretending uncertain findings are final answers.",
      "Correlated telemetry has to be presented in a way engineers can trust quickly.",
    ],
    solutions: [
      "Centered the workflow on correlated evidence and ranked hypotheses.",
      "Kept uncertainty visible so investigation output remains reviewable.",
      "Designed the agent loop around service-level context instead of isolated alerts.",
    ],
    performance: [
      "Created a focused AI-agent project for autonomous incident investigation.",
      "Demonstrated analysis across 14 signals and 3 services.",
      "Reduced the mental load of scanning disconnected observability signals.",
    ],
    lessons: [
      "Incident agents are most useful when they show their evidence.",
      "Correlation is only valuable when engineers can trace how a conclusion was reached.",
      "Autonomous engineering tools should accelerate judgment, not replace it.",
    ],
    codeSnippet: `const investigation = await awari.investigate({\n  signals,\n  services,\n  window: incidentWindow,\n});`,
    gallery: ["/images/projects/orbit-commerce.png"],
  },
  {
    slug: "ostec-se-cybersecurity-platform",
    title: "OSTEC-SE Cybersecurity Platform",
    category: "Security",
    description:
      "A cybersecurity platform experience focused on clear service presentation, trust-building flows, and responsive delivery.",
    image: "/images/projects/kinetic-planner.png",
    stack: ["React", "TypeScript", "Responsive UI", "Vercel"],
    metrics: ["Security-focused UX", "Responsive delivery", "Live platform"],
    liveUrl: "https://ostec-se.vercel.app/board-reports",
    year: "2026",
    role: "Frontend Engineer",
    problem:
      "Security services needed a credible digital surface that communicates offerings clearly and helps visitors understand the platform quickly.",
    research: [
      "Reviewed how security audiences scan service offerings and trust signals.",
      "Identified content groups that needed to be visible without overwhelming users.",
      "Tested responsive layout decisions across mobile and desktop expectations.",
    ],
    planning: [
      "Prioritized clear sections for services, value, and contact-oriented actions.",
      "Planned a responsive layout that keeps security information easy to scan.",
      "Defined reusable UI patterns for service cards and platform messaging.",
    ],
    architecture: [
      "Frontend components organize the platform into focused, reusable sections.",
      "Responsive styling keeps content readable across device sizes.",
      "Vercel deployment supports fast iteration and public delivery.",
    ],
    systemDesign: [
      "Information hierarchy moves from core security value to supporting service details.",
      "Calls to action stay reachable without interrupting content scanning.",
      "Reusable sections make updates easier as offerings evolve.",
    ],
    challenges: [
      "Security content needed to feel trustworthy without becoming dense.",
      "The page had to work well on small screens where long content can feel heavy.",
      "Visual polish needed to support credibility rather than distract from it.",
    ],
    solutions: [
      "Used concise section structure and clear visual grouping.",
      "Balanced responsive spacing with readable content density.",
      "Kept interactions lightweight so the page remains focused and quick.",
    ],
    performance: [
      "Delivered a live, responsive cybersecurity platform experience.",
      "Improved service comprehension through clearer hierarchy.",
      "Kept the interface lightweight for fast browsing.",
    ],
    lessons: [
      "Security websites need calm confidence more than visual noise.",
      "Trust signals work best when they are part of the content hierarchy.",
      "Responsive service pages should reduce cognitive load on mobile.",
    ],
    codeSnippet: `const service = services.find((item) =>\n  item.slug === selectedService,\n);`,
    gallery: ["/images/projects/kinetic-planner.png"],
  },
  {
    slug: "kudipal",
    title: "Kudipal",
    category: "AI",
    description:
      "Kudipal is Nigeria's first WhatsApp SME platform, built to help small businesses manage everyday operations where they already work.",
    image: "/images/projects/atlas-observability.png",
    stack: ["Next.js", "React", "TypeScript", "WhatsApp", "Vercel"],
    metrics: ["WhatsApp-first SME tools", "Nigeria-focused platform", "Live product"],
    liveUrl: "https://nigeria-first-ai-ops-copilot.vercel.app/",
    year: "2025",
    role: "Full-stack Engineer",
    problem:
      "Nigerian SMEs need practical digital tools that meet them inside WhatsApp instead of forcing daily business operations into unfamiliar software.",
    research: [
      "Studied how SME owners coordinate sales, customers, payments, and records through WhatsApp.",
      "Identified where lightweight automation could reduce repeated operational work.",
      "Shaped the platform around Nigerian business habits rather than generic SME assumptions.",
    ],
    planning: [
      "Defined WhatsApp-first workflows for common SME operations and customer touchpoints.",
      "Planned the product around quick adoption, clear actions, and familiar interaction patterns.",
      "Built the public product surface so the concept could be tested and shared quickly.",
    ],
    architecture: [
      "Next.js and React power the product interface and workflow shell.",
      "WhatsApp-centered flows keep operations close to how SMEs already communicate.",
      "Vercel deployment supports fast iteration and public demos.",
    ],
    systemDesign: [
      "SME workflows are organized around familiar WhatsApp-style actions.",
      "Operational records stay connected to customer and business activity.",
      "The platform keeps core actions lightweight so business owners can move quickly.",
    ],
    challenges: [
      "The platform needed to feel local and practical, not like generic business software.",
      "SME tools have to be useful without adding admin overhead.",
      "The experience needed to communicate value quickly for busy business owners.",
    ],
    solutions: [
      "Centered the product story on WhatsApp-first SME operations.",
      "Kept the interface focused on the actions users need to take next.",
      "Built the product around Nigerian SME context as a core requirement.",
    ],
    performance: [
      "Delivered a public product for a WhatsApp-first Nigerian SME platform.",
      "Made the value proposition visible through focused product flows.",
      "Kept the product lightweight enough for fast iteration.",
    ],
    lessons: [
      "SME products land better when they match the user's real operating environment.",
      "Local context is a product requirement, not a marketing detail.",
      "A familiar channel can make business software feel much easier to adopt.",
    ],
    codeSnippet: `const workflow = await kudipal.createWorkflow({\n  channel: "whatsapp",\n  businessId,\n  action,\n});`,
    gallery: ["/images/projects/atlas-observability.png"],
  },
];

export const achievements: Achievement[] = [
  {
    label: "Performance",
    value: "100",
    detail:
      "Built fast, maintainable interfaces across React, Next.js, Angular, and TypeScript.",
  },
  {
    label: "Security",
    value: "AA+",
    detail:
      "Delivered SSO, RBAC, maker-checker, and audit-backed workflows for sensitive systems.",
  },
  {
    label: "Scale",
    value: "30+",
    detail: "Supported Ecobank digital banking operations across 30+ affiliates.",
  },
  {
    label: "Mentorship",
    value: "Team",
    detail: "Mentored junior engineers and led frontend delivery patterns at Conclase.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Crown brings rare range: product taste, systems thinking, and the discipline to make ambitious interfaces feel calm.",
    name: "Damilola.",
    role: "Project Manager",
    company: "Conclase",
  },
  {
    quote:
      "He turned a messy operational workflow into a fast, trustworthy product surface our engineers actually enjoy using.",
    name: "Chuks",
    role: "Senior Frontend Engineer",
    company: "Lead Way",
  },
  {
    quote:
      "The work landed with polish, but what stood out was the architecture underneath. It was built to keep evolving.",
    name: "Foluso",
    role: "Line Manager",
    company: "Axa Mansard",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "engineering-for-motion",
    title: "Engineering for Motion Without Burning the Main Thread",
    description:
      "A practical framework for adding expressive interaction while preserving responsiveness and accessibility.",
    date: "2026-05-18",
    readTime: "6 min",
    tags: ["Motion", "Performance", "Frontend"],
  },
  {
    slug: "reliable-ai-interfaces",
    title: "Reliable AI Interfaces Start With Boring Product Constraints",
    description:
      "Why good AI UX is mostly boundaries, auditability, latency budgets, and honest fallback states.",
    date: "2026-04-11",
    readTime: "7 min",
    tags: ["AI", "Product", "Architecture"],
  },
  {
    slug: "designing-systems-that-feel-fast",
    title: "Designing Systems That Feel Fast",
    description:
      "Perceived speed is a collaboration between data loading, hierarchy, animation, and microcopy.",
    date: "2026-03-02",
    readTime: "5 min",
    tags: ["Design Systems", "UX", "React"],
  },
];
