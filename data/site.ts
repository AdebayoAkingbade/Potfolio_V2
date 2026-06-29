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
  { name: "AI Chatbots", category: "AI", experience: "2 yrs", icon: "network", level: 82 },
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
      "Built real-time notification systems and AI-powered chatbot workflows with Python and NLP.",
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
      "Reduced support response time through chatbot automation.",
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
    slug: "ecobank-ai-chatbot",
    title: "AI Chatbot",
    category: "AI",
    description:
      "An AI-powered chatbot for account queries, transaction assistance, and customer support automation integrated with backend banking APIs.",
    image: "/images/projects/orbit-commerce.png",
    stack: ["Python", "NLP", "Banking APIs", "Spring Boot", "React"],
    metrics: ["Automated support flows", "Reduced response time", "API-backed answers"],
    year: "2025",
    role: "Software Engineer",
    problem:
      "Customer support teams needed faster, more consistent handling for common banking questions and transaction-related requests.",
    research: [
      "Reviewed recurring account, transaction, and support questions to define the first automation scope.",
      "Mapped which answers could be automated and which needed handoff to support teams.",
      "Validated backend API touchpoints required for accurate account and transaction responses.",
    ],
    planning: [
      "Designed conversation paths for account questions, transaction lookups, and support escalation.",
      "Planned fallback behavior for ambiguous, sensitive, or unsupported requests.",
      "Separated NLP intent handling from banking API integration to keep the system maintainable.",
    ],
    architecture: [
      "Python services handled NLP intent classification and response orchestration.",
      "Backend integrations connected approved intents to banking APIs.",
      "Frontend surfaces presented guided responses and escalation states.",
    ],
    systemDesign: [
      "Intent routing keeps account, transaction, and support workflows isolated.",
      "Fallback rules prevent the chatbot from answering when confidence or permissions are insufficient.",
      "Support handoff preserves conversation context for human follow-up.",
    ],
    challenges: [
      "Responses needed to be fast while relying on secure backend banking data.",
      "The assistant had to handle common requests without overstepping sensitive banking boundaries.",
      "Conversation flows needed to stay understandable for customers and support teams.",
    ],
    solutions: [
      "Used bounded intents, confidence checks, and explicit fallbacks for safer automation.",
      "Connected supported intents to backend APIs for reliable, current answers.",
      "Kept support escalation visible when automation was not the right path.",
    ],
    performance: [
      "Reduced repetitive support handling by automating common customer workflows.",
      "Improved perceived response time through guided, intent-based interactions.",
      "Kept the AI layer modular so intents could evolve without rewriting integrations.",
    ],
    lessons: [
      "AI support tools need clear boundaries before they need clever language.",
      "Useful automation depends on clean integrations as much as model behavior.",
      "Fallback states are a product feature in regulated support workflows.",
    ],
    codeSnippet: `const response = await resolveIntent({\n  message,\n  customerId,\n  allowedScopes: user.permissions,\n});`,
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
    liveUrl: "https://belrald.com",
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
    slug: "fitness-ecommerce-app",
    title: "Fitness E-commerce App",
    category: "Commerce",
    description:
      "A full-stack fitness commerce app with payments, bookings, and user workflows built with React, Spring Boot, and Firebase.",
    image: "/images/projects/orbit-commerce.png",
    stack: ["React", "TypeScript", "Spring Boot", "Firebase", "Payments", "Booking"],
    metrics: ["Full-stack delivery", "Payment workflows", "Booking management"],
    liveUrl: "https://fitnessoapp1.web.app",
    year: "2021",
    role: "Software Engineer",
    problem:
      "Fitness customers needed a single product experience for browsing services, booking sessions, making payments, and managing user flows.",
    research: [
      "Mapped the customer journey from product discovery to booking and payment.",
      "Identified user account flows needed for sign-up, booking history, and access.",
      "Reviewed payment and booking states that needed clear feedback.",
    ],
    planning: [
      "Split the product into storefront, booking, payment, and user account modules.",
      "Defined backend endpoints for catalog, booking, and user workflow operations.",
      "Used Firebase for hosting and supporting product infrastructure needs.",
    ],
    architecture: [
      "React and TypeScript powered the customer-facing frontend.",
      "Spring Boot handled backend workflows and service boundaries.",
      "Firebase supported deployment and product infrastructure.",
    ],
    systemDesign: [
      "Booking states guide users from selection through confirmation.",
      "Payment flows are separated from booking logic so each can be maintained independently.",
      "User workflows connect account state with bookings and commerce actions.",
    ],
    challenges: [
      "Payments, bookings, and user state had to stay synchronized.",
      "The product needed to feel straightforward across several related workflows.",
      "Full-stack delivery required clear contracts between frontend and backend pieces.",
    ],
    solutions: [
      "Built clear task flows for booking and payment completion.",
      "Kept backend responsibilities organized around commerce and user workflow domains.",
      "Used TypeScript to tighten frontend state and integration assumptions.",
    ],
    performance: [
      "Delivered a working full-stack product across frontend, backend, and hosting.",
      "Supported customer workflows from browsing through payment and booking.",
      "Improved maintainability by separating commerce, booking, and account concerns.",
    ],
    lessons: [
      "Commerce UX depends on state clarity more than visual density.",
      "Booking systems need explicit confirmation and recovery states.",
      "Full-stack product work benefits from simple, well-named boundaries.",
    ],
    codeSnippet: `await booking.create({\n  userId,\n  packageId,\n  paymentReference,\n});`,
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
    liveUrl: "https://ostec-se.vercel.app/",
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
    slug: "nigeria-first-ai-ops-copilot",
    title: "Nigeria-First AI Ops Copilot",
    category: "AI",
    description:
      "An AI operations copilot for SMBs that reads receipts, categorizes expenses, and supports payment reconciliation in the background.",
    image: "/images/projects/atlas-observability.png",
    stack: ["Next.js", "React", "TypeScript", "AI Workflows", "Vercel"],
    metrics: ["Receipt intelligence", "Expense categorization", "Payment reconciliation"],
    githubUrl: "https://github.com/AdebayoAkingbade/Nigeria-First-AI-Ops-Copilot",
    liveUrl: "https://nigeria-first-ai-ops-copilot.vercel.app/",
    year: "2025",
    role: "Full-stack Engineer",
    problem:
      "Small businesses needed an operations assistant that fits local finance habits and reduces manual bookkeeping around receipts, expenses, and payments.",
    research: [
      "Studied how SMB owners track expenses through receipts, transfers, and informal records.",
      "Identified where categorization and reconciliation could remove repetitive admin work.",
      "Shaped the product around practical operations rather than generic enterprise assumptions.",
    ],
    planning: [
      "Defined receipt capture, expense categorization, and reconciliation as core workflows.",
      "Planned AI assistance around reviewable suggestions instead of opaque automation.",
      "Built the product as a focused web app that could be tested quickly with users.",
    ],
    architecture: [
      "Next.js and React power the product interface and workflow shell.",
      "AI workflow logic turns receipt and payment inputs into structured suggestions.",
      "Vercel deployment supports fast iteration and public demos.",
    ],
    systemDesign: [
      "Receipt records move from capture to categorization to review.",
      "Reconciliation flows compare payments and expense records before confirmation.",
      "User-facing explanations keep suggested categories understandable.",
    ],
    challenges: [
      "The assistant needed to feel local and practical, not like a generic finance demo.",
      "AI suggestions had to be useful without hiding uncertainty from users.",
      "Expense workflows needed to stay quick for busy business owners.",
    ],
    solutions: [
      "Centered the UX on receipts, categories, and reconciliation tasks SMBs already recognize.",
      "Kept AI output reviewable so users can correct or confirm suggestions.",
      "Reduced the interface to the decisions users need to make next.",
    ],
    performance: [
      "Delivered a public AI copilot prototype for SMB operations.",
      "Improved bookkeeping flow by connecting receipt intelligence to reconciliation tasks.",
      "Kept the product lightweight enough for fast iteration.",
    ],
    lessons: [
      "AI products land better when they match the user's real operating environment.",
      "Automation should make financial work easier to verify, not harder to understand.",
      "Local context is a product requirement, not a marketing detail.",
    ],
    codeSnippet: `const insight = await categorizeReceipt({\n  receiptText,\n  merchant,\n  paymentReference,\n});`,
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
