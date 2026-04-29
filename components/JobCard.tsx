import { Job } from "@/lib/types";
import Link from "next/link";
import { MapPinIcon, BriefcaseIcon, ClockIcon } from "./icons";

function formatSalary(salary: Job["salary"]): string {
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
  return `$${fmt(salary.min)}–$${fmt(salary.max)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div
        className={`bg-white rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
          job.featured
            ? "border-indigo-200 shadow-sm shadow-indigo-100"
            : "border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {job.featured && (
                <span className="inline-flex items-center text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  Featured
                </span>
              )}
              {job.remote && (
                <span className="inline-flex items-center text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                  Remote
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-gray-600 mt-0.5">
              {job.company}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-gray-900">
              {formatSalary(job.salary)}
            </p>
            <p className="text-xs text-gray-400">per year</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 text-gray-400" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <BriefcaseIcon className="w-4 h-4 text-gray-400" />
            {job.type}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            {timeAgo(job.postedAt)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{job.experienceLevel}</span>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
