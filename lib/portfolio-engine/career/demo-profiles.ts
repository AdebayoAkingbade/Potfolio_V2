import type { PortfolioDraft } from "@/types/portfolio-engine";
import { createDraft, createProject } from "../schema";

export type DemoProfileKey = "software-engineer" | "nurse" | "sales-executive" | "student-graduate";

export interface DemoProfileMeta {
  key: DemoProfileKey;
  label: string;
  profession: string;
  roleTitle: string;
  summary: string;
  avatar: string;
  badge: string;
}

export const DEMO_PROFILES_META: DemoProfileMeta[] = [
  {
    key: "software-engineer",
    label: "Software Engineer",
    profession: "software-technology",
    roleTitle: "Staff Platform & Systems Engineer",
    summary: "Senior systems builder with deep expertise in distributed architectures, API latency reduction, and confidential AI product engineering.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    badge: "Distributed Systems & AI",
  },
  {
    key: "nurse",
    label: "Critical Care Nurse",
    profession: "healthcare",
    roleTitle: "Critical Care / ICU Clinical Specialist (BSN, RN)",
    summary: "Intensive care clinician leading life-critical resuscitation, ventilator weaning protocols, and clinical safety quality governance.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    badge: "Clinical Care & Patient Safety",
  },
  {
    key: "sales-executive",
    label: "Sales Executive",
    profession: "sales",
    roleTitle: "Enterprise Account Executive / Strategic Sales Director",
    summary: "High-velocity B2B sales leader with $4.2M annual quota attainment, MEDDPICC enterprise closing, and Fortune 500 contract negotiation.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    badge: "Revenue & Enterprise Deals",
  },
  {
    key: "student-graduate",
    label: "CS Graduate / Student",
    profession: "students-graduates",
    roleTitle: "B.S. Computer Science Graduate (Human-AI Interaction)",
    summary: "Recent computer science graduate with honors, research in accessible navigation systems, and production full-stack engineering internships.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    badge: "Honors Graduate & Capstone",
  },
];

export function getSoftwareEngineerDemo(): PortfolioDraft {
  const draft = createDraft();
  draft.id = "demo-software-engineer";
  draft.profession = "software-technology";
  draft.template = "signal";
  draft.theme = "charcoal";
  draft.basics = {
    ...draft.basics,
    name: "Alex Chen",
    title: "Staff Platform & Systems Engineer",
    summary:
      "Distributed systems engineer with 8+ years architecting high-throughput microservices, sub-10ms latency API meshes, and confidential AI infrastructure. Proven delivery scaling core banking and operational platforms across 10M+ daily active sessions.",
    location: "San Francisco, CA & Remote",
    email: "alex.chen.systems@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    socialLinks: [
      { id: "s1", label: "GitHub", url: "https://github.com/example-alexchen" },
      { id: "s2", label: "LinkedIn", url: "https://linkedin.com/in/example-alexchen" },
    ],
  };
  draft.skills = [
    "Distributed Systems",
    "Go",
    "TypeScript",
    "Kubernetes",
    "Kafka",
    "PostgreSQL",
    "System Architecture",
    "AI Systems Engineering",
  ];
  draft.experience = [
    {
      id: "exp-se-1",
      organization: "Apex Cloud Infrastructure",
      role: "Staff Platform Engineer",
      start: "2022",
      end: "Present",
      summary:
        "Architected multi-region event mesh handling 450k events/sec with 99.995% uptime SLA. Reduced p99 latency from 140ms to 8.2ms across global edge gateways.",
      highlights: [
        "Led 8-engineer platform core team through zero-downtime database partition migration",
        "Designed real-time idempotency layer preventing duplicate financial mutations across regional outages",
      ],
    },
    {
      id: "exp-se-2",
      organization: "Veloce Financial Systems",
      role: "Senior Software Engineer",
      start: "2019",
      end: "2022",
      summary:
        "Engineered regulatory compliance ledger and high-concurrency payment disbursement gateway handling $1.2B in annual transaction volume.",
      highlights: [
        "Implemented end-to-end cryptographic audit trails fulfilling PCI-DSS Level 1 compliance",
        "Reduced cold-start compute costs by 38% via custom containerized micro-runtime orchestration",
      ],
    },
  ];

  // Projects: Kudipal (Stealth), AGuard AI (Stealth), and CloudScale Mesh (Public)
  const kudipal = createProject();
  kudipal.id = "proj-se-kudipal";
  kudipal.title = "Kudipal";
  kudipal.role = "Founder / Product Engineer";
  kudipal.visibility = "stealth";
  kudipal.statusText = "Currently in Development";
  kudipal.developmentStatus = "in-development";
  kudipal.safeDescription =
    "An AI-powered product currently under active development. Details are intentionally limited prior to public release.";
  kudipal.capabilitiesDemonstrated = [
    "Product Strategy",
    "AI Product Development",
    "Full-Stack Engineering",
    "AI Integration",
    "System Design",
  ];
  kudipal.safeCtaLabel = "Discuss This Project";
  kudipal.skills = ["Next.js", "React", "TypeScript", "AI Integration", "System Design"];
  kudipal.tags = ["AI Product", "In Development"];

  const aguard = createProject();
  aguard.id = "proj-se-aguard";
  aguard.title = "AGuard AI";
  aguard.role = "Founder / Product Engineer";
  aguard.visibility = "stealth";
  aguard.statusText = "Currently in Development";
  aguard.developmentStatus = "in-development";
  aguard.safeDescription =
    "An AI initiative currently being developed around safer and more intelligent digital experiences. Product details are intentionally limited prior to release.";
  aguard.capabilitiesDemonstrated = [
    "AI Product Development",
    "Product Architecture",
    "Full-Stack Engineering",
  ];
  aguard.safeCtaLabel = "Discuss This Project";
  aguard.skills = ["Python", "AI Safety", "Content Filtering", "NLP", "Product Architecture"];
  aguard.tags = ["AI Safety", "Stealth"];

  const mesh = createProject();
  mesh.id = "proj-se-mesh";
  mesh.title = "CloudScale Distributed Event Mesh";
  mesh.role = "Principal Architect";
  mesh.visibility = "public";
  mesh.summary =
    "High-throughput event streaming fabric engineered for zero data-loss financial operations, processing 450,000 events per second.";
  mesh.challenge =
    "Cross-region replication lag during network partitions caused inconsistent balance state across downstream microservices.";
  mesh.outcome =
    "Implemented conflict-free replicated data types (CRDTs) and consensus-backed verification, eliminating drift and reducing failover time from 120s to <400ms.";
  mesh.skills = ["Go", "Kafka", "Raft Consensus", "Kubernetes", "Prometheus"];
  mesh.tags = ["Infrastructure", "Distributed Systems"];
  mesh.links = [
    { id: "l1", label: "Architecture Whitepaper", url: "https://example.com/whitepapers/cloudscale-mesh" },
  ];

  draft.projects = [kudipal, aguard, mesh];
  return draft;
}

export function getNurseDemo(): PortfolioDraft {
  const draft = createDraft();
  draft.id = "demo-nurse";
  draft.profession = "healthcare";
  draft.template = "ledger";
  draft.theme = "nordic";
  draft.basics = {
    ...draft.basics,
    name: "Sarah Jenkins, BSN, RN",
    title: "Critical Care / ICU Clinical Specialist",
    summary:
      "Board-certified Intensive Care Registered Nurse (BSN, RN, CCRN) with 7 years of high-acuity bedside experience in Level 1 Trauma ICUs. Champion of clinical patient advocacy, rapid code response, zero-harm medication safety protocols, and evidence-based clinical pathway leadership.",
    location: "Boston, MA & Licensed across MA, NY",
    email: "sarah.jenkins.rn@example.com",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80",
    socialLinks: [
      { id: "sn1", label: "AACN Verified RN", url: "https://aacn.org/certified/sarahjenkins" },
      { id: "sn2", label: "LinkedIn Clinical", url: "https://linkedin.com/in/example-sarahjenkins-rn" },
    ],
  };
  draft.skills = [
    "Critical Care Hemodynamics",
    "Mechanical Ventilation & Weaning",
    "Sepsis Early Intervention",
    "Advanced Cardiac Life Support (ACLS)",
    "Pediatric Advanced Life Support (PALS)",
    "Epic EHR Clinical Documentation",
    "Clinical Preceptorship & Mentorship",
    "Patient & Family Advocacy",
  ];
  draft.experience = [
    {
      id: "exp-nurse-1",
      organization: "Massachusetts General Medical Center — Medical ICU",
      role: "Lead Critical Care Nurse & Charge Nurse",
      start: "2020",
      end: "Present",
      summary:
        "Manage 1:1 and 1:2 high-acuity patient assignments with continuous hemodynamic monitoring, CRRT continuous renal replacement, and ECMO cannulation support. Serve as unit Charge Nurse directing triage for a 24-bed ICU.",
      highlights: [
        "Achieved 100% medication administration safety score across 2,400+ consecutive patient shifts",
        "Headed unit clinical quality committee that reduced central-line associated bloodstream infections (CLABSI) by 42%",
      ],
    },
    {
      id: "exp-nurse-2",
      organization: "St. Luke's Regional Trauma Center",
      role: "Staff RN — Surgical Intensive Care Unit (SICU)",
      start: "2017",
      end: "2020",
      summary:
        "Delivered critical post-operative nursing care for complex cardiothoracic, neurosurgical, and severe polytrauma patient recoveries.",
      highlights: [
        "Certified Super-User for Epic EHR clinical migration, training 45 incoming nursing staff",
        "Authored standardized family-centered palliative briefing guide adopted across ICU division",
      ],
    },
  ];

  const sepsisProj = createProject();
  sepsisProj.id = "proj-nurse-sepsis";
  sepsisProj.title = "ICU Sepsis Rapid Recognition & Bundle Adherence Pathway";
  sepsisProj.role = "Clinical Project Lead";
  sepsisProj.visibility = "public";
  sepsisProj.summary =
    "Led multidisciplinary initiative to accelerate 1-hour sepsis protocol execution across medical and surgical ICU beds.";
  sepsisProj.challenge =
    "Delayed recognition of early septic shock symptoms led to extended ICU stays and elevated mortality risks.";
  sepsisProj.outcome =
    "Instituted automated lactate alerts, standardized vasopressor titrations, and nurse-driven order sets, reducing median door-to-antibiotic delivery time from 84 to 28 minutes.";
  sepsisProj.skills = ["Sepsis Protocols", "Clinical Quality Improvement", "Hemodynamics", "Interdisciplinary Care"];
  sepsisProj.tags = ["Clinical Quality", "Patient Safety"];

  const weaningProj = createProject();
  weaningProj.id = "proj-nurse-weaning";
  weaningProj.title = "Spontaneous Breathing Trial (SBT) Protocol Overhaul";
  weaningProj.role = "Unit Practice Council Chair";
  weaningProj.visibility = "public";
  weaningProj.summary =
    "Designed and validated nurse-led daily ventilator sedation interruption and extubation assessment checklist.";
  weaningProj.challenge =
    "Variability in sedation cessation timings caused prolonged ventilator dependency and avoidable reintubations.";
  weaningProj.outcome =
    "Decreased average ICU ventilator days by 1.6 days per patient with 0% unanticipated reintubation rate over 6-month trial.";
  weaningProj.skills = ["Ventilator Weaning", "Respiratory Care", "Evidence-Based Nursing", "Clinical Governance"];
  weaningProj.tags = ["Evidence-Based Practice", "ICU Protocols"];

  draft.projects = [sepsisProj, weaningProj];
  return draft;
}

export function getSalesExecutiveDemo(): PortfolioDraft {
  const draft = createDraft();
  draft.id = "demo-sales-executive";
  draft.profession = "sales";
  draft.template = "stage";
  draft.theme = "monochrome";
  draft.basics = {
    ...draft.basics,
    name: "Marcus Vance",
    title: "Enterprise Account Executive / Strategic Sales Director",
    summary:
      "Enterprise sales professional with 9 years exceeding revenue quotas in cybersecurity, data infrastructure, and B2B SaaS. Consistently ranked in top 2% of global sales organization with $14.8M in career enterprise contract value closed across Fortune 500 accounts.",
    location: "New York, NY",
    email: "marcus.vance.sales@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    socialLinks: [
      { id: "ss1", label: "LinkedIn", url: "https://linkedin.com/in/example-marcusvance-sales" },
    ],
  };
  draft.skills = [
    "Enterprise Software Sales (SaaS)",
    "MEDDPICC Qualification",
    "C-Suite Stakeholder Alignment",
    "Contract Negotiation & Deal Structuring",
    "Strategic Pipeline Generation",
    "Salesforce & Clari Forecasting",
    "Multi-Year Enterprise Licensing",
    "Cross-Functional Solutions Selling",
  ];
  draft.experience = [
    {
      id: "exp-sales-1",
      organization: "Sentinel AI Security Systems",
      role: "Strategic Enterprise Account Executive",
      start: "2021",
      end: "Present",
      summary:
        "Manage Tier 1 strategic accounts in Financial Services and Healthcare, originating and closing six- and seven-figure ARR enterprise software contracts.",
      highlights: [
        "Achieved 148% of annual quota ($4.2M delivered against $2.85M target) in FY24",
        "Closed the largest single multi-year software expansion in company history ($2.4M ARR over 3 years with Global Top-5 Investment Bank)",
        "Maintained 94% forecast accuracy using disciplined MEDDPICC deal execution",
      ],
    },
    {
      id: "exp-sales-2",
      organization: "CloudNexus Platforms",
      role: "Senior Enterprise Account Executive",
      start: "2018",
      end: "2021",
      summary:
        "Drove greenfield market expansion across Northeast US, expanding enterprise client roster by 28 net-new logos.",
      highlights: [
        "President's Club recipient (2019, 2020) for consistent >125% quota attainment",
        "Partnered with Solution Engineers to reduce average enterprise sales cycle from 180 to 112 days",
      ],
    },
  ];

  const deal1 = createProject();
  deal1.id = "proj-sales-deal1";
  deal1.title = "Global Tier-1 Banking Infrastructure Deal ($2.4M ARR)";
  deal1.role = "Lead Enterprise Account Executive";
  deal1.visibility = "public";
  deal1.summary =
    "Multi-year enterprise cloud security agreement negotiated and closed with Fortune 20 financial institution.";
  deal1.challenge =
    "Incumbent vendor held deep integration; enterprise security committee had 14 disparate stakeholders with strict procurement compliance constraints.";
  deal1.outcome =
    "Constructed value-based ROI business case demonstrating $3.8M in annual tool consolidation savings, securing unanimous executive sponsor sign-off.";
  deal1.skills = ["MEDDPICC", "C-Suite Negotiation", "Financial Services", "Competitive Displacement"];
  deal1.tags = ["Seven-Figure Deal", "Enterprise Expansion"];

  const deal2 = createProject();
  deal2.id = "proj-sales-deal2";
  deal2.title = "Healthcare Systems Modernization Contract ($1.2M ARR)";
  deal2.role = "Strategic Account Executive";
  deal2.visibility = "public";
  deal2.summary =
    "Spearheaded multi-hospital network deployment replacing fragmented legacy monitoring tools with unified enterprise platform.";
  deal2.challenge =
    "Strict HIPAA governance review and aggressive pricing counter-proposals threatened to stall momentum at procurement stage.";
  deal2.outcome =
    "Structured tiered rollout with milestone-based compliance gates, accelerating contract execution 45 days ahead of fiscal year-end.";
  deal2.skills = ["Healthcare B2B", "Deal Structuring", "Procurement Alignment", "Pipeline Acceleration"];
  deal2.tags = ["Net-New Logo", "Healthcare SaaS"];

  draft.projects = [deal1, deal2];
  return draft;
}

export function getStudentGraduateDemo(): PortfolioDraft {
  const draft = createDraft();
  draft.id = "demo-student-graduate";
  draft.profession = "students-graduates";
  draft.template = "atelier";
  draft.theme = "editorial";
  draft.basics = {
    ...draft.basics,
    name: "Maya Patel",
    title: "B.S. Computer Science Graduate (Human-AI Interaction)",
    summary:
      "Recent Computer Science graduate (Summa Cum Laude, GPA 3.94) from University of Washington with a concentration in Human-Centered AI and Full-Stack Systems. Proven track record across two university research assistantships and a competitive software engineering internship.",
    location: "Seattle, WA & Open to Relocation",
    email: "maya.patel.cs@example.com",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    socialLinks: [
      { id: "st1", label: "GitHub", url: "https://github.com/example-mayapatel" },
      { id: "st2", label: "LinkedIn", url: "https://linkedin.com/in/example-mayapatel-cs" },
    ],
  };
  draft.skills = [
    "Python",
    "TypeScript",
    "React",
    "Next.js",
    "PostgreSQL",
    "Data Structures & Algorithms",
    "Human-Computer Interaction (HCI)",
    "Accessible Web Engineering (WCAG)",
    "PyTorch Basics",
  ];
  draft.experience = [
    {
      id: "exp-student-1",
      organization: "Kestrel Software — FinTech Summer Intern",
      role: "Software Engineering Intern",
      start: "Jun 2024",
      end: "Aug 2024",
      summary:
        "Engineered customer onboarding verification flow utilizing React, TypeScript, and FastAPI, serving 14,000 weekly registrations.",
      highlights: [
        "Reduced client validation drop-off by 14% by designing inline real-time error guidance",
        "Wrote 42 unit and integration tests boosting test coverage on core onboarding module to 91%",
      ],
    },
    {
      id: "exp-student-2",
      organization: "UW Human-Centered Robotics & Computing Lab",
      role: "Undergraduate Research Assistant",
      start: "2023",
      end: "2024",
      summary:
        "Investigated accessible multimodal interfaces for visually impaired users in public transit spaces under Prof. Elena Rostova.",
      highlights: [
        "Co-authored research workshop paper accepted at ACM ASSETS 2024",
        "Developed open-source voice-assisted landmark audio prototype tested with 24 study participants",
      ],
    },
  ];

  const capstone = createProject();
  capstone.id = "proj-student-capstone";
  capstone.title = "OmniNav: Accessible Multi-Modal Campus Transit Navigator (Capstone)";
  capstone.role = "Team Lead & Full-Stack Architect";
  capstone.visibility = "public";
  capstone.summary =
    "Senior capstone project engineered with high-contrast accessibility standards and real-time audio guidance for campus navigation.";
  capstone.challenge =
    "Standard GPS tools fail inside complex multi-level university facilities and lack step-free accessibility routing.";
  capstone.outcome =
    "Engineered beacon-assisted indoor positioning web application compliant with WCAG 2.1 AAA standards; awarded 1st Place Senior Design Showcase.";
  capstone.skills = ["TypeScript", "Next.js", "Web Audio API", "WCAG 2.1", "PostgreSQL"];
  capstone.tags = ["Senior Capstone", "1st Place Award"];
  capstone.links = [
    { id: "st-l1", label: "GitHub Repository", url: "https://github.com/example-mayapatel/omninav" },
    { id: "st-l2", label: "Live Interactive Demo", url: "https://omninav-demo.example.org" },
  ];

  const study = createProject();
  study.id = "proj-student-study";
  study.title = "Algorithmic Fairness in Resume Screening Models";
  study.role = "Lead Researcher";
  study.visibility = "public";
  study.summary =
    "Empirical audit testing gender and demographic bias across three open-weights NLP classification models.";
  study.challenge =
    "Identifying subtle synthetic token variance impact on ranking distributions across standardized resume datasets.";
  study.outcome =
    "Published reproducible evaluation benchmark suite demonstrating how semantic prompt guardrails mitigate scoring variance by up to 67%.";
  study.skills = ["Python", "Pandas", "Scikit-Learn", "Hugging Face", "Data Analysis"];
  study.tags = ["Academic Research", "AI Ethics"];

  draft.projects = [capstone, study];
  return draft;
}

export function getDemoProfile(key: DemoProfileKey): PortfolioDraft {
  switch (key) {
    case "software-engineer":
      return getSoftwareEngineerDemo();
    case "nurse":
      return getNurseDemo();
    case "sales-executive":
      return getSalesExecutiveDemo();
    case "student-graduate":
      return getStudentGraduateDemo();
  }
}
