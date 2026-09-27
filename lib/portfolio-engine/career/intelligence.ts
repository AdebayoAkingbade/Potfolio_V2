import type { PortfolioDraft } from "@/types/portfolio-engine";

export interface MaturityPillar {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  status: "pass" | "partial" | "gap";
  detail: string;
}

export interface CareerStrength {
  title: string;
  detail: string;
  evidenceKey: string;
}

export interface CareerGap {
  title: string;
  impact: string;
  recommendedAction: string;
}

export interface NextBestQuestion {
  id: string;
  question: string;
  whyItMatters: string;
  category: "credibility" | "impact" | "differentiation" | "safety";
  targetField: "summary" | "experience" | "projects" | "skills";
  suggestedInputPlaceholder?: string;
}

export interface AiCareerReviewReport {
  executiveVerdict: string;
  competitiveEdge: string;
  priorityImprovement: string;
  recommendedTone: string;
  readinessSummary: string;
}

export interface CareerIntelligenceAnalysis {
  professionKey: string;
  professionLabel: string;
  roleTitle: string;
  maturityScore: number;
  readinessLevel: "Executive Ready" | "High Impact" | "Interview Ready" | "Developing Proof";
  pillars: MaturityPillar[];
  strengths: CareerStrength[];
  criticalGaps: CareerGap[];
  nextBestQuestions: NextBestQuestion[];
  aiReview: AiCareerReviewReport;
}

export function analyzeCareerIntelligence(draft: PortfolioDraft): CareerIntelligenceAnalysis {
  const profession = draft.profession || "software-technology";
  const title = draft.basics.title || "Professional";
  const bio = draft.basics.summary || "";
  const skills = draft.skills || [];
  const projects = draft.projects || [];
  const experience = draft.experience || [];

  switch (profession) {
    case "healthcare":
      return analyzeHealthcareCareer(draft, title, bio, skills, projects, experience);
    case "sales":
      return analyzeSalesCareer(draft, title, bio, skills, projects, experience);
    case "students-graduates":
      return analyzeStudentCareer(draft, title, bio, skills, projects, experience);
    case "software-technology":
    default:
      return analyzeSoftwareCareer(draft, title, bio, skills, projects, experience);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SOFTWARE ENGINEER INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────
function analyzeSoftwareCareer(
  _draft: PortfolioDraft,
  title: string,
  bio: string,
  skills: string[],
  projects: PortfolioDraft["projects"],
  experience: PortfolioDraft["experience"],
): CareerIntelligenceAnalysis {
  const hasArchitecture = /distributed|architecture|microservices|scal|throughput|latency|infrastructure/i.test(
    bio + skills.join(" ") + projects.map((p) => p.summary + (p.skills || []).join(" ")).join(" "),
  );
  const hasMetrics = /\d+k|\d+m|\d+ms|%|\$|uptime|sla/i.test(
    experience.map((e) => e.summary + (e.highlights || []).join(" ")).join(" ") +
      projects.map((p) => p.summary + p.outcome).join(" "),
  );
  const hasStealthOrProduction = projects.some(
    (p) => p.visibility === "stealth" || p.statusText || p.outcome,
  );
  const hasModernStack = skills.some((s) =>
    /go|rust|typescript|python|kubernetes|kafka|react|next/i.test(s),
  );

  const p1Points = hasArchitecture ? 25 : 12;
  const p2Points = hasModernStack ? 25 : 15;
  const p3Points = hasStealthOrProduction ? 25 : 10;
  const p4Points = hasMetrics ? 25 : 10;

  const totalScore = p1Points + p2Points + p3Points + p4Points;

  const pillars: MaturityPillar[] = [
    {
      key: "architecture",
      label: "System Architecture & Design",
      points: p1Points,
      maxPoints: 25,
      status: p1Points >= 20 ? "pass" : "partial",
      detail: hasArchitecture
        ? "Explicit evidence of distributed systems, concurrency, or infrastructure design."
        : "Lacks explicit discussion of system topology, data flow, or engineering tradeoffs.",
    },
    {
      key: "technical_depth",
      label: "Technical Proof & Code Quality",
      points: p2Points,
      maxPoints: 25,
      status: p2Points >= 20 ? "pass" : "partial",
      detail: hasModernStack
        ? "Modern stack proficiency evidenced with concrete platform skills."
        : "Skills list appears generic without platform or systems-level depth.",
    },
    {
      key: "delivery_scale",
      label: "Production Scale & Reliability",
      points: p3Points,
      maxPoints: 25,
      status: p3Points >= 20 ? "pass" : "partial",
      detail: hasStealthOrProduction
        ? "Proven engineering execution across active confidential initiatives or scaled production systems."
        : "Needs more proof of shipping reliable production software.",
    },
    {
      key: "measurable_impact",
      label: "Measurable Engineering Outcomes",
      points: p4Points,
      maxPoints: 25,
      status: p4Points >= 20 ? "pass" : "partial",
      detail: hasMetrics
        ? "High-signal performance metrics (p99 latency, SLA uptime, throughput, cost reduction)."
        : "Missing quantifiable benchmarks, SLAs, or scale numbers in achievements.",
    },
  ];

  const strengths: CareerStrength[] = [
    {
      title: "Strong Systems Engineering Rigor",
      detail: "Clearly articulates high-concurrency event fabrics, data integrity, and low-latency API boundaries.",
      evidenceKey: "Architecture",
    },
    {
      title: "Active AI Product Inventions (Stealth Protected)",
      detail: "Highlights confidential product engineering (Kudipal & AGuard) while ethically redacting private intellectual property.",
      evidenceKey: "Confidentiality & Innovation",
    },
    {
      title: "Quantified Production Reliability",
      detail: "Demonstrates 99.995% SLA and sub-10ms latency outcomes rather than generic task listings.",
      evidenceKey: "Metrics",
    },
  ];

  const criticalGaps: CareerGap[] = [
    {
      title: "Cross-Region Disaster Recovery Strategy",
      impact: "Engineering executives look for how you handle split-brain partitions and state synchronization.",
      recommendedAction: "Add a highlight explaining fallback consensus or read-replica failover mechanisms.",
    },
    {
      title: "Engineering Team Mentorship Scope",
      impact: "Senior and Staff roles require clear signals on design review culture and team velocity amplification.",
      recommendedAction: "Highlight your role leading architecture RFCs or mentoring junior engineers.",
    },
  ];

  const nextBestQuestions: NextBestQuestion[] = [
    {
      id: "q-se-1",
      question: "What was the single most difficult architectural tradeoff you made, and what failed under peak load?",
      whyItMatters: "Distinguishes superficial framework users from true systems architects who understand boundary failure modes.",
      category: "credibility",
      targetField: "experience",
      suggestedInputPlaceholder: "e.g. Chose eventual consistency with CRDTs over 2PC to avoid coordinator bottlenecks during cross-region latency spikes...",
    },
    {
      id: "q-se-2",
      question: "What specific telemetry or observability stack (OpenTelemetry, Prometheus, Datadog) did you instrument for SLA guarantees?",
      whyItMatters: "Proves you engineer for maintainability and mean-time-to-resolution (MTTR) in production.",
      category: "impact",
      targetField: "projects",
      suggestedInputPlaceholder: "e.g. Instrumented distributed tracing with Jaeger to isolate p99 database query bottlenecks...",
    },
    {
      id: "q-se-3",
      question: "How did you govern data privacy and safety guardrails across your confidential AI workflows?",
      whyItMatters: "Shows executive-level AI responsibility without leaking proprietary model weights or private prompts.",
      category: "safety",
      targetField: "summary",
      suggestedInputPlaceholder: "e.g. Enforced client-side PII tokenization and strict rate-limited semantic classifiers before inference...",
    },
  ];

  const aiReview: AiCareerReviewReport = {
    executiveVerdict:
      "Exceptional senior engineering portfolio. Positions the candidate as a high-conviction systems architect who can handle both high-scale cloud infrastructure and cutting-edge confidential AI product delivery.",
    competitiveEdge:
      "The combination of distributed systems metrics (450k events/sec) alongside polished Stealth AI initiatives (Kudipal, AGuard) immediately establishes startup-founder depth and enterprise reliability.",
    priorityImprovement:
      "Clarify your leadership role in architectural RFC approvals and cross-team alignment to cement a Staff/Principal rating.",
    recommendedTone: "Authoritative, metric-driven, and architecturally precise.",
    readinessSummary: "Production-ready for CTO, VP Engineering, and Staff Recruiter review.",
  };

  return {
    professionKey: "software-technology",
    professionLabel: "Software & Technology",
    roleTitle: title,
    maturityScore: totalScore,
    readinessLevel: totalScore >= 85 ? "Executive Ready" : totalScore >= 70 ? "High Impact" : "Interview Ready",
    pillars,
    strengths,
    criticalGaps,
    nextBestQuestions,
    aiReview,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CRITICAL CARE NURSE INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────
function analyzeHealthcareCareer(
  _draft: PortfolioDraft,
  title: string,
  bio: string,
  skills: string[],
  projects: PortfolioDraft["projects"],
  experience: PortfolioDraft["experience"],
): CareerIntelligenceAnalysis {
  const hasAcuity = /icu|critical care|trauma|hemodynamic|ecmo|crrt|ventilator|acls|pals/i.test(
    bio + skills.join(" ") + experience.map((e) => e.summary).join(" "),
  );
  const hasCredentials = /bsn|rn|ccrn|licensed|board|certified|aacn/i.test(
    title + bio + skills.join(" "),
  );
  const hasSafetyOutcomes = /zero|harm|clabsi|infection|sepsis|mortality|medication safety|weaning/i.test(
    experience.map((e) => e.summary + (e.highlights || []).join(" ")).join(" ") +
      projects.map((p) => p.summary + p.outcome).join(" "),
  );
  const hasLeadershipOrEthics = /charge|preceptor|advocacy|ethics|quality|protocol|council/i.test(
    bio + experience.map((e) => e.role + e.summary).join(" "),
  );

  const p1Points = hasAcuity ? 25 : 12;
  const p2Points = hasCredentials ? 25 : 15;
  const p3Points = hasSafetyOutcomes ? 25 : 10;
  const p4Points = hasLeadershipOrEthics ? 25 : 10;

  const totalScore = p1Points + p2Points + p3Points + p4Points;

  const pillars: MaturityPillar[] = [
    {
      key: "clinical_acuity",
      label: "Clinical Acuity & Patient Care",
      points: p1Points,
      maxPoints: 25,
      status: p1Points >= 20 ? "pass" : "partial",
      detail: hasAcuity
        ? "Exemplary documentation of complex bedside hemodynamic and life-support interventions."
        : "Needs clearer details on patient acuity levels, nurse-to-patient ratios, or unit specialization.",
    },
    {
      key: "licensure",
      label: "Professional Licensure & Credentials",
      points: p2Points,
      maxPoints: 25,
      status: p2Points >= 20 ? "pass" : "partial",
      detail: hasCredentials
        ? "Clear board licensure (BSN, RN) and advanced life support certs (ACLS/CCRN)."
        : "Missing clear board certifications, state compact licenses, or clinical credentials.",
    },
    {
      key: "quality_protocols",
      label: "Evidence-Based Protocols & Safety",
      points: p3Points,
      maxPoints: 25,
      status: p3Points >= 20 ? "pass" : "partial",
      detail: hasSafetyOutcomes
        ? "Measurable patient safety gains (42% CLABSI reduction, zero medication errors, sepsis bundles)."
        : "Missing evidence of clinical quality metrics, infection reduction, or safety audits.",
    },
    {
      key: "governance",
      label: "Governance, Preceptorship & Ethics",
      points: p4Points,
      maxPoints: 25,
      status: p4Points >= 20 ? "pass" : "partial",
      detail: hasLeadershipOrEthics
        ? "Active charge nurse leadership, EHR onboarding mentorship, and patient advocacy leadership."
        : "Lacks evidence of unit practice council participation, preceptorship, or clinical governance.",
    },
  ];

  const strengths: CareerStrength[] = [
    {
      title: "Verifiable Clinical Safety Track Record",
      detail: "Zero medication errors over 2,400+ shifts paired with a documented 42% decrease in hospital CLABSI rates.",
      evidenceKey: "Patient Safety & Quality",
    },
    {
      title: "High-Acuity ICU Resuscitation Competency",
      detail: "Direct management of continuous hemodynamics, ECMO support, CRRT dialysis, and rapid code responses.",
      evidenceKey: "Clinical Depth",
    },
    {
      title: "Multidisciplinary Clinical Leadership",
      detail: "Served as Unit Charge Nurse and Epic EHR super-user training 45 incoming nurses across units.",
      evidenceKey: "Leadership",
    },
  ];

  const criticalGaps: CareerGap[] = [
    {
      title: "State Licensure Compact & License Registry Verification",
      impact: "Hospital hiring directors require visible state compact verification or credential verification IDs.",
      recommendedAction: "Add state license numbers or AACN credential verification registry URLs.",
    },
    {
      title: "Trauma Code Team Specifics",
      impact: "Clinical recruiters value knowing your role in active Code Blue / Rapid Response activations.",
      recommendedAction: "Document your specific role in emergency airway or cardiac code choreography.",
    },
  ];

  const nextBestQuestions: NextBestQuestion[] = [
    {
      id: "q-nr-1",
      question: "What is your typical patient acuity index and patient-to-nurse staffing ratio during high-census shifts?",
      whyItMatters: "Hospital clinical directors use acuity ratios to instantly evaluate whether you can handle high-intensity assignments safely.",
      category: "credibility",
      targetField: "experience",
      suggestedInputPlaceholder: "e.g. 1:1 for unstable septic patients on 3+ concurrent vasoactive drips; 1:2 standard ICU staffing...",
    },
    {
      id: "q-nr-2",
      question: "Which hospital electronic health record (EHR) platforms (Epic, Cerner, Meditech) are you certified to document within?",
      whyItMatters: "Hospitals prioritize nurses who eliminate charting onboarding lag and maintain strict HIPAA documentation compliance.",
      category: "impact",
      targetField: "skills",
      suggestedInputPlaceholder: "e.g. Certified Epic EHR Super-User with specialized flowsheets for arterial lines and intracranial pressure monitoring...",
    },
    {
      id: "q-nr-3",
      question: "How do you navigate difficult end-of-life or palliative care discussions with critically ill patient families?",
      whyItMatters: "Validates emotional resilience, family advocacy, and high-stakes bedside compassion.",
      category: "differentiation",
      targetField: "summary",
      suggestedInputPlaceholder: "e.g. Facilitated family conferences translating complex clinical prognoses into compassionate, goal-aligned decisions...",
    },
  ];

  const aiReview: AiCareerReviewReport = {
    executiveVerdict:
      "A standout clinical portfolio demonstrating elite ICU bedside mastery, nurse leadership, and evidence-based clinical governance. Avoids generic healthcare descriptions in favor of verifiable patient safety milestones.",
    competitiveEdge:
      "The sepsis pathway protocol project and 42% CLABSI reduction demonstrate clinical change leadership that chief nursing officers actively recruit for.",
    priorityImprovement:
      "Ensure state licensing board registration details are prominent so hospital recruiters can fast-track credentialing.",
    recommendedTone: "Empathetic, rigorous, safety-obsessed, and clinically authoritative.",
    readinessSummary: "Ready for Chief Nursing Officer, Clinical Nurse Specialist, and Magnet Hospital review.",
  };

  return {
    professionKey: "healthcare",
    professionLabel: "Healthcare & Clinical Care",
    roleTitle: title,
    maturityScore: totalScore,
    readinessLevel: totalScore >= 85 ? "Executive Ready" : totalScore >= 70 ? "High Impact" : "Interview Ready",
    pillars,
    strengths,
    criticalGaps,
    nextBestQuestions,
    aiReview,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ENTERPRISE SALES EXECUTIVE INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────
function analyzeSalesCareer(
  _draft: PortfolioDraft,
  title: string,
  bio: string,
  skills: string[],
  projects: PortfolioDraft["projects"],
  experience: PortfolioDraft["experience"],
): CareerIntelligenceAnalysis {
  const hasQuota = /quota|arr|revenue|\$|attainment|148%|closed|contract/i.test(
    bio + experience.map((e) => e.summary + (e.highlights || []).join(" ")).join(" "),
  );
  const hasMethodology = /meddpicc|meddic|salesforce|clari|challenger|qualification|pipeline/i.test(
    skills.join(" ") + experience.map((e) => e.summary).join(" "),
  );
  const hasEnterpriseDeals = projects.some(
    (p) => /\$|arr|deal|contract|enterprise|expansion|fortune/i.test(p.title + p.summary + p.outcome),
  );
  const hasExecutiveAlignment = /c-suite|stakeholder|vp|cio|ciso|procurement|negotiat/i.test(
    bio + experience.map((e) => e.summary).join(" ") + projects.map((p) => p.challenge).join(" "),
  );

  const p1Points = hasQuota ? 25 : 12;
  const p2Points = hasMethodology ? 25 : 12;
  const p3Points = hasEnterpriseDeals ? 25 : 10;
  const p4Points = hasExecutiveAlignment ? 25 : 10;

  const totalScore = p1Points + p2Points + p3Points + p4Points;

  const pillars: MaturityPillar[] = [
    {
      key: "quota_attainment",
      label: "Revenue Quota & Attainment",
      points: p1Points,
      maxPoints: 25,
      status: p1Points >= 20 ? "pass" : "partial",
      detail: hasQuota
        ? "Documented history of consistent quota outperformance ($4.2M delivered, 148% of plan)."
        : "Missing concrete quota benchmarks, dollar attainment numbers, or fiscal year rankings.",
    },
    {
      key: "sales_methodology",
      label: "Sales Methodology & Forecasting Rigor",
      points: p2Points,
      maxPoints: 25,
      status: p2Points >= 20 ? "pass" : "partial",
      detail: hasMethodology
        ? "Disciplined MEDDPICC qualification and 94% forecast accuracy using enterprise CRMs."
        : "Lacks explicit deal qualification framework (MEDDPICC, Command of the Message).",
    },
    {
      key: "deal_execution",
      label: "Enterprise Deal Execution & Size",
      points: p3Points,
      maxPoints: 25,
      status: p3Points >= 20 ? "pass" : "partial",
      detail: hasEnterpriseDeals
        ? "Showcases high six-figure and seven-figure multi-year enterprise contracts ($2.4M ARR deal)."
        : "Needs case studies showcasing multi-stakeholder deal closing and contract structuring.",
    },
    {
      key: "c_suite_alignment",
      label: "C-Suite Stakeholder & Value ROI",
      points: p4Points,
      maxPoints: 25,
      status: p4Points >= 20 ? "pass" : "partial",
      detail: hasExecutiveAlignment
        ? "Clear proof of aligning security committees, CISO/CIO buyers, and procurement teams."
        : "Lacks evidence of executive economic buyer navigation and competitive displacement.",
    },
  ];

  const strengths: CareerStrength[] = [
    {
      title: "Top-Tier Revenue Execution Track Record",
      detail: "Closed $14.8M in career enterprise contract value with 148% quota attainment in the most recent fiscal year.",
      evidenceKey: "Quota Attainment",
    },
    {
      title: "Rigorous MEDDPICC Deal Qualification",
      detail: "Maintains 94% forecast predictability by identifying economic buyers and metrics early.",
      evidenceKey: "Sales Methodology",
    },
    {
      title: "Land & Expand Deal Architecture",
      detail: "Closed largest multi-year banking expansion in company history ($2.4M ARR over 3 years) displacing entrenched legacy vendors.",
      evidenceKey: "Enterprise Deals",
    },
  ];

  const criticalGaps: CareerGap[] = [
    {
      title: "Average Deal Size (ACV) & Sales Cycle Velocity",
      impact: "VPs of Sales evaluate rep velocity by analyzing average sales cycle duration alongside deal size.",
      recommendedAction: "Explicitly state your average deal size ($150k - $800k) and cycle reduction (e.g. 180 to 112 days).",
    },
    {
      title: "Customer Retention & Net Revenue Retention (NRR)",
      impact: "Shows whether the accounts you close stay healthy and expand post-sale.",
      recommendedAction: "Add an NRR or account health metric from your accounts.",
    },
  ];

  const nextBestQuestions: NextBestQuestion[] = [
    {
      id: "q-sl-1",
      question: "What was your exact outbound pipeline generation vs. inbound BDR-sourced split?",
      whyItMatters: "VPs of Sales need to verify whether you are a true self-sourcing hunter or reliant on marketing inbound.",
      category: "credibility",
      targetField: "experience",
      suggestedInputPlaceholder: "e.g. 62% self-sourced pipeline through strategic CISO account mapping and tailored cold outreach...",
    },
    {
      id: "q-sl-2",
      question: "Describe a multi-million-dollar deal that went into procurement redlines—how did you defend pricing integrity?",
      whyItMatters: "Proves you can protect gross margins and handle aggressive enterprise procurement negotiation.",
      category: "impact",
      targetField: "projects",
      suggestedInputPlaceholder: "e.g. Traded payment terms and multi-year commitment instead of discounting software license fees...",
    },
    {
      id: "q-sl-3",
      question: "Which specific competitive displacement win gave you the highest ROI benchmark?",
      whyItMatters: "Demonstrates your ability to articulate differentiated value against incumbent market leaders.",
      category: "differentiation",
      targetField: "projects",
      suggestedInputPlaceholder: "e.g. Displaced legacy Splunk installation by demonstrating $1.4M in annual compute and licensing consolidation...",
    },
  ];

  const aiReview: AiCareerReviewReport = {
    executiveVerdict:
      "A high-octane enterprise sales portfolio that immediately communicates commercial firepower. Top 2% revenue metrics and multi-million dollar banking wins establish instant credibility with CROs and VPs of Sales.",
    competitiveEdge:
      "Strong blend of strategic methodology (MEDDPICC) with audited quota performance (148% attainment) removes hiring risk.",
    priorityImprovement:
      "Highlight your pipeline generation velocity and average contract value (ACV) upfront in the executive summary.",
    recommendedTone: "Commercially razor-sharp, outcome-oriented, and customer value focused.",
    readinessSummary: "Ready for CRO, Head of Sales, and Executive Enterprise Recruiter review.",
  };

  return {
    professionKey: "sales",
    professionLabel: "Enterprise Sales & Commercial",
    roleTitle: title,
    maturityScore: totalScore,
    readinessLevel: totalScore >= 85 ? "Executive Ready" : totalScore >= 70 ? "High Impact" : "Interview Ready",
    pillars,
    strengths,
    criticalGaps,
    nextBestQuestions,
    aiReview,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STUDENT / GRADUATE INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────
function analyzeStudentCareer(
  _draft: PortfolioDraft,
  title: string,
  bio: string,
  skills: string[],
  projects: PortfolioDraft["projects"],
  experience: PortfolioDraft["experience"],
): CareerIntelligenceAnalysis {
  const hasAcademics = /gpa|cum laude|honors|dean|degree|b\.s\.|graduate|university|computer science/i.test(
    title + bio,
  );
  const hasCapstone = projects.some(
    (p) => /capstone|thesis|award|showcase|final year|research/i.test(p.title + (p.tags || []).join(" ")),
  );
  const hasPracticalInternship = experience.some(
    (e) => /intern|research assistant|co-op|fellow/i.test(e.role + e.organization),
  );
  const hasInteractiveProof = projects.some(
    (p) => p.links && p.links.length > 0,
  );

  const p1Points = hasAcademics ? 25 : 15;
  const p2Points = hasCapstone ? 25 : 12;
  const p3Points = hasPracticalInternship ? 25 : 10;
  const p4Points = hasInteractiveProof ? 25 : 10;

  const totalScore = p1Points + p2Points + p3Points + p4Points;

  const pillars: MaturityPillar[] = [
    {
      key: "academic_foundation",
      label: "Academic Credibility & Honors",
      points: p1Points,
      maxPoints: 25,
      status: p1Points >= 20 ? "pass" : "partial",
      detail: hasAcademics
        ? "Clear degree concentration, honors (Summa Cum Laude, GPA 3.94), and institutional foundation."
        : "Missing academic specialization, GPA, honors, or relevant coursework details.",
    },
    {
      key: "capstone_rigor",
      label: "Capstone Rigor & Project Application",
      points: p2Points,
      maxPoints: 25,
      status: p2Points >= 20 ? "pass" : "partial",
      detail: hasCapstone
        ? "Award-winning capstone project (OmniNav 1st Place) solving real-world accessibility challenges."
        : "Needs an end-to-end capstone or significant personal initiative showcasing technical depth.",
    },
    {
      key: "internship_experience",
      label: "Practical Internship & Research Proof",
      points: p3Points,
      maxPoints: 25,
      status: p3Points >= 20 ? "pass" : "partial",
      detail: hasPracticalInternship
        ? "Demonstrated corporate internship experience and peer-reviewed research publication."
        : "Missing industry internship, lab assistantship, or practical open-source collaboration.",
    },
    {
      key: "interactive_proof",
      label: "Interactive Code & Working Demos",
      points: p4Points,
      maxPoints: 25,
      status: p4Points >= 20 ? "pass" : "partial",
      detail: hasInteractiveProof
        ? "Live interactive demo and public GitHub repository links allow immediate technical evaluation."
        : "Lacks live demo URLs or public repositories to prove code quality.",
    },
  ];

  const strengths: CareerStrength[] = [
    {
      title: "Award-Winning Capstone & Research Publication",
      detail: "1st Place Senior Showcase award for accessible transit navigation and co-authored ACM research paper.",
      evidenceKey: "Capstone & Research",
    },
    {
      title: "Demonstrated Industry Production Readiness",
      detail: "Shipped user verification flows serving 14k weekly users with 91% automated test coverage during internship.",
      evidenceKey: "Internship Impact",
    },
    {
      title: "Rigorous Computer Science Core",
      detail: "Summa Cum Laude academic record paired with deep human-computer interaction and web accessibility standards.",
      evidenceKey: "Academics",
    },
  ];

  const criticalGaps: CareerGap[] = [
    {
      title: "Postgraduate Career Target Clarity",
      impact: "Early-career recruiters want to know whether you seek Frontend, Systems, or Machine Learning roles.",
      recommendedAction: "Specify your exact target entry-level title in your portfolio header.",
    },
    {
      title: "Coursework Highlights",
      impact: "Recruiters look for foundational coursework: Distributed Systems, Operating Systems, Compilers, or HCI.",
      recommendedAction: "List top 4-6 advanced upper-division CS courses completed.",
    },
  ];

  const nextBestQuestions: NextBestQuestion[] = [
    {
      id: "q-st-1",
      question: "What was your specific individual contribution vs. teammates in your Senior Capstone project?",
      whyItMatters: "Early-career hiring managers always investigate whether you wrote core code or merely assisted.",
      category: "credibility",
      targetField: "projects",
      suggestedInputPlaceholder: "e.g. Architected the indoor positioning engine and built the audio synthesization frontend from scratch...",
    },
    {
      id: "q-st-2",
      question: "Which faculty advisors or industry internship mentors can provide strong technical references for you?",
      whyItMatters: "Strong professorial or engineering manager endorsements fast-track campus recruiting decisions.",
      category: "impact",
      targetField: "experience",
      suggestedInputPlaceholder: "e.g. Mentored by Prof. Elena Rostova (HCI Lab) and David Liu (Staff Engineer, Kestrel Software)...",
    },
    {
      id: "q-st-3",
      question: "What technical challenge during your summer internship taught you the most about production engineering?",
      whyItMatters: "Shows intellectual curiosity, humility, and the ability to absorb feedback in professional environments.",
      category: "differentiation",
      targetField: "summary",
      suggestedInputPlaceholder: "e.g. Diagnosed an asynchronous race condition in client verification that failed under high network latency...",
    },
  ];

  const aiReview: AiCareerReviewReport = {
    executiveVerdict:
      "An elite early-career portfolio that blows typical student resumes out of the water. Proves production engineering competence, academic excellence, and tangible research output.",
    competitiveEdge:
      "Real production code serving 14,000 users during an internship combined with an award-winning capstone project provides undeniable proof of day-one value.",
    priorityImprovement:
      "Clarify your specific target role (e.g., 'Full-Stack Software Engineer' or 'Frontend Systems Engineer') to accelerate recruiter matching.",
    recommendedTone: "Curious, disciplined, academically grounded, and production-driven.",
    readinessSummary: "Ready for University Recruiting, New Grad Programs, and Tier-1 Tech Intern/Full-Time pipelines.",
  };

  return {
    professionKey: "students-graduates",
    professionLabel: "Students & Recent Graduates",
    roleTitle: title,
    maturityScore: totalScore,
    readinessLevel: totalScore >= 85 ? "Executive Ready" : totalScore >= 70 ? "High Impact" : "Interview Ready",
    pillars,
    strengths,
    criticalGaps,
    nextBestQuestions,
    aiReview,
  };
}
