export type SocialKey = "github" | "linkedin" | "email" | "resume" | "calendar";

export type SkillCategory =
  "Frontend" | "Backend" | "Cloud" | "DevOps" | "AI" | "Mobile" | "Databases";

export type Skill = {
  name: string;
  category: SkillCategory;
  experience: string;
  icon: string;
  level: number;
};

export type Experience = {
  company: string;
  role: string;
  duration: string;
  summary: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
};

export type ProjectCategory =
  "Fintech" | "Platform" | "AI" | "Education" | "Commerce" | "Security";

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  image: string;
  stack: string[];
  metrics: string[];
  githubUrl?: string;
  liveUrl?: string;
  year: string;
  role: string;
  problem: string;
  research: string[];
  planning: string[];
  architecture: string[];
  systemDesign: string[];
  challenges: string[];
  solutions: string[];
  performance: string[];
  lessons: string[];
  codeSnippet: string;
  gallery: string[];
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
};

export type Achievement = {
  label: string;
  value: string;
  detail: string;
};
