export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
export type ExperienceLevel = "Entry Level" | "Mid Level" | "Senior Level" | "Executive";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  type: JobType;
  experienceLevel: ExperienceLevel;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  tags: string[];
  postedAt: string;
  deadline?: string;
  featured?: boolean;
}
