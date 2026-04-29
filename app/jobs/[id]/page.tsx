import { getJobById, jobs } from "@/lib/jobs";
import { notFound } from "next/navigation";
import Link from "next/link";
import ApplyModal from "@/components/ApplyModal";
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckIcon,
  ArrowLeftIcon,
} from "@/components/icons";

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

function formatSalary(salary: { min: number; max: number; currency: string }) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return `$${fmt(salary.min)} – $${fmt(salary.max)} / year`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default async function JobDetailPage({ params }: Params) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to all jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: job details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                {job.featured && (
                  <span className="inline-flex text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 mb-2">
                    Featured
                  </span>
                )}
                <h1 className="text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <p className="text-base font-medium text-gray-600 mt-1">
                  {job.company}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                {job.location}
                {job.remote && (
                  <span className="ml-1 text-xs font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full border border-green-100">
                    Remote
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                {job.type} · {job.experienceLevel}
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                Posted {timeAgo(job.postedAt)}
                {job.deadline && (
                  <span className="text-orange-500">
                    &nbsp;· Deadline{" "}
                    {new Date(job.deadline).toLocaleDateString()}
                  </span>
                )}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              About the role
            </h2>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Responsibilities
            </h2>
            <ul className="space-y-2.5">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <CheckIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Requirements
            </h2>
            <ul className="space-y-2.5">
              {job.requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Benefits
            </h2>
            <ul className="space-y-2.5">
              {job.benefits.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <CheckIcon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: sticky apply card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-20">
            <p className="text-sm text-gray-500 mb-1">Compensation</p>
            <p className="text-xl font-bold text-gray-900">
              {formatSalary(job.salary)}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Job type</span>
                <span className="font-medium">{job.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Experience</span>
                <span className="font-medium">{job.experienceLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location</span>
                <span className="font-medium text-right">
                  {job.remote ? "Remote / " : ""}
                  {job.location}
                </span>
              </div>
            </div>

            <ApplyModal jobTitle={job.title} company={job.company} />

            <p className="mt-3 text-xs text-center text-gray-400">
              Applications are reviewed within 5 business days
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
