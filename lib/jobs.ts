import { Job } from "./types";

export const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    remote: true,
    type: "Full-time",
    experienceLevel: "Senior Level",
    salary: { min: 130000, max: 180000, currency: "USD" },
    description:
      "We are looking for a Senior Frontend Engineer to join our growing team. You will lead the development of our web applications, mentor junior engineers, and collaborate closely with product and design teams to deliver exceptional user experiences.",
    responsibilities: [
      "Lead frontend architecture decisions and establish best practices",
      "Build and maintain high-performance React applications",
      "Mentor junior and mid-level engineers",
      "Collaborate with design and product to define and implement new features",
      "Conduct code reviews and ensure code quality",
    ],
    requirements: [
      "5+ years of experience with React and TypeScript",
      "Strong understanding of web performance optimization",
      "Experience with state management (Redux, Zustand, or similar)",
      "Excellent communication and collaboration skills",
      "Bachelor's degree in Computer Science or equivalent experience",
    ],
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "Flexible remote work policy",
      "Home office stipend",
      "Annual learning and development budget",
    ],
    tags: ["React", "TypeScript", "Next.js", "GraphQL"],
    postedAt: "2026-04-25",
    deadline: "2026-05-25",
    featured: true,
  },
  {
    id: "2",
    title: "Backend Engineer (Node.js)",
    company: "FinanceHub",
    location: "New York, NY",
    remote: false,
    type: "Full-time",
    experienceLevel: "Mid Level",
    salary: { min: 110000, max: 150000, currency: "USD" },
    description:
      "FinanceHub is seeking a Backend Engineer to help build and scale our financial data infrastructure. You will work on high-throughput services processing millions of transactions daily.",
    responsibilities: [
      "Design and implement RESTful APIs and microservices",
      "Optimize database queries and data pipelines",
      "Ensure high availability and reliability of backend services",
      "Participate in on-call rotations and incident response",
    ],
    requirements: [
      "3+ years of backend engineering experience",
      "Proficiency in Node.js and TypeScript",
      "Experience with PostgreSQL or similar relational databases",
      "Familiarity with AWS or GCP services",
      "Understanding of financial systems is a plus",
    ],
    benefits: [
      "401(k) with company matching",
      "Generous PTO and sick leave",
      "Daily catered lunches",
      "Transportation reimbursement",
    ],
    tags: ["Node.js", "TypeScript", "PostgreSQL", "AWS"],
    postedAt: "2026-04-22",
    featured: true,
  },
  {
    id: "3",
    title: "Product Designer",
    company: "DesignStudio",
    location: "Austin, TX",
    remote: true,
    type: "Full-time",
    experienceLevel: "Mid Level",
    salary: { min: 90000, max: 130000, currency: "USD" },
    description:
      "Join our design team to craft beautiful and intuitive product experiences. You will own the design process from research and ideation through implementation and iteration.",
    responsibilities: [
      "Conduct user research and usability testing",
      "Create wireframes, prototypes, and high-fidelity designs",
      "Maintain and evolve the design system",
      "Work closely with engineers to ensure pixel-perfect implementation",
    ],
    requirements: [
      "3+ years of product design experience",
      "Expertise in Figma or similar design tools",
      "Strong portfolio showcasing end-to-end product work",
      "Experience with design systems",
    ],
    benefits: [
      "Creative work environment",
      "Flexible working hours",
      "Professional development budget",
      "Annual team retreats",
    ],
    tags: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    postedAt: "2026-04-20",
  },
  {
    id: "4",
    title: "Data Scientist",
    company: "AI Ventures",
    location: "Seattle, WA",
    remote: true,
    type: "Full-time",
    experienceLevel: "Senior Level",
    salary: { min: 140000, max: 195000, currency: "USD" },
    description:
      "AI Ventures is looking for a Data Scientist to drive insights and build machine learning models that power our recommendation and personalization engines.",
    responsibilities: [
      "Develop and deploy machine learning models at scale",
      "Analyze large datasets to extract actionable insights",
      "Collaborate with engineering teams on model deployment",
      "Present findings to stakeholders",
    ],
    requirements: [
      "4+ years of data science or ML engineering experience",
      "Proficiency in Python, TensorFlow or PyTorch",
      "Strong statistics and probability background",
      "Experience with cloud ML platforms (SageMaker, Vertex AI)",
    ],
    benefits: [
      "Industry-leading compensation",
      "Stock options",
      "Unlimited PTO",
      "Top-of-the-line equipment",
    ],
    tags: ["Python", "Machine Learning", "TensorFlow", "AWS"],
    postedAt: "2026-04-18",
    featured: true,
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudSystems",
    location: "Remote",
    remote: true,
    type: "Contract",
    experienceLevel: "Mid Level",
    salary: { min: 100000, max: 140000, currency: "USD" },
    description:
      "CloudSystems needs a DevOps Engineer to improve our CI/CD pipelines, manage infrastructure as code, and support our engineering teams.",
    responsibilities: [
      "Build and maintain CI/CD pipelines",
      "Manage Kubernetes clusters and containerized workloads",
      "Implement infrastructure as code using Terraform",
      "Monitor system health and respond to incidents",
    ],
    requirements: [
      "3+ years of DevOps or SRE experience",
      "Strong Kubernetes and Docker experience",
      "Proficiency with Terraform",
      "Experience with monitoring tools (Datadog, Prometheus)",
    ],
    benefits: [
      "Flexible contract terms",
      "Fully remote",
      "Competitive hourly rate",
    ],
    tags: ["Kubernetes", "Terraform", "Docker", "CI/CD"],
    postedAt: "2026-04-15",
  },
  {
    id: "6",
    title: "Junior Software Developer",
    company: "StartupXYZ",
    location: "Chicago, IL",
    remote: false,
    type: "Full-time",
    experienceLevel: "Entry Level",
    salary: { min: 65000, max: 85000, currency: "USD" },
    description:
      "Great opportunity for a junior developer to grow fast in a dynamic startup environment. You will work across the full stack and have a real impact from day one.",
    responsibilities: [
      "Build features across frontend and backend",
      "Write unit and integration tests",
      "Participate in code reviews",
      "Collaborate in agile sprints",
    ],
    requirements: [
      "0-2 years of professional software development experience",
      "Knowledge of JavaScript/TypeScript",
      "Familiarity with React and Node.js",
      "Eagerness to learn and grow",
    ],
    benefits: [
      "Mentorship from experienced engineers",
      "Health insurance",
      "Stock options",
      "Regular team events",
    ],
    tags: ["JavaScript", "React", "Node.js", "SQL"],
    postedAt: "2026-04-12",
  },
  {
    id: "7",
    title: "Marketing Manager",
    company: "GrowthCo",
    location: "Los Angeles, CA",
    remote: true,
    type: "Full-time",
    experienceLevel: "Mid Level",
    salary: { min: 80000, max: 110000, currency: "USD" },
    description:
      "GrowthCo is hiring a Marketing Manager to lead our demand generation and brand campaigns. You will own the marketing funnel from awareness to conversion.",
    responsibilities: [
      "Plan and execute multi-channel marketing campaigns",
      "Manage the marketing budget and track ROI",
      "Collaborate with sales and product teams",
      "Analyze campaign performance and optimize continuously",
    ],
    requirements: [
      "3+ years of B2B marketing experience",
      "Proficiency with HubSpot or similar CRM/marketing tools",
      "Strong analytical and writing skills",
      "Experience with paid and organic acquisition channels",
    ],
    benefits: [
      "Performance bonuses",
      "Flexible work schedule",
      "Health and wellness benefits",
    ],
    tags: ["Marketing", "HubSpot", "SEO", "Paid Ads"],
    postedAt: "2026-04-10",
  },
  {
    id: "8",
    title: "iOS Developer",
    company: "MobileFirst",
    location: "Boston, MA",
    remote: false,
    type: "Full-time",
    experienceLevel: "Mid Level",
    salary: { min: 105000, max: 145000, currency: "USD" },
    description:
      "MobileFirst is building the next generation of consumer mobile apps and needs a talented iOS Developer to join our product team.",
    responsibilities: [
      "Develop and maintain iOS applications in Swift",
      "Collaborate with design and backend teams",
      "Optimize app performance and ensure quality",
      "Stay current with iOS platform developments",
    ],
    requirements: [
      "3+ years of iOS development experience",
      "Proficiency in Swift and UIKit/SwiftUI",
      "Experience with RESTful APIs and JSON",
      "Published apps on the App Store preferred",
    ],
    benefits: [
      "Competitive salary",
      "Annual Apple device refresh",
      "Health benefits",
      "Flexible hours",
    ],
    tags: ["Swift", "iOS", "SwiftUI", "Xcode"],
    postedAt: "2026-04-08",
  },
];

export function getJobById(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}

export function searchJobs(params: {
  query?: string;
  location?: string;
  type?: string;
  experienceLevel?: string;
  remote?: boolean;
}): Job[] {
  return jobs.filter((job) => {
    if (
      params.query &&
      !job.title.toLowerCase().includes(params.query.toLowerCase()) &&
      !job.company.toLowerCase().includes(params.query.toLowerCase()) &&
      !job.tags.some((tag) =>
        tag.toLowerCase().includes(params.query!.toLowerCase())
      )
    ) {
      return false;
    }
    if (
      params.location &&
      !job.location.toLowerCase().includes(params.location.toLowerCase())
    ) {
      return false;
    }
    if (params.type && job.type !== params.type) {
      return false;
    }
    if (
      params.experienceLevel &&
      job.experienceLevel !== params.experienceLevel
    ) {
      return false;
    }
    if (params.remote !== undefined && job.remote !== params.remote) {
      return false;
    }
    return true;
  });
}
