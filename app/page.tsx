import { Suspense } from "react";
import { searchJobs } from "@/lib/jobs";
import JobCard from "@/components/JobCard";
import SearchFilters from "@/components/SearchFilters";
import { SparklesIcon } from "@/components/icons";
import { JobType, ExperienceLevel } from "@/lib/types";

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    type?: string;
    level?: string;
    remote?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  const filteredJobs = searchJobs({
    query: params.q,
    location: params.location,
    type: params.type as JobType | undefined,
    experienceLevel: params.level as ExperienceLevel | undefined,
    remote: params.remote === "true" ? true : undefined,
  });

  const hasFilters =
    params.q || params.location || params.type || params.level || params.remote;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-indigo-200 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <SparklesIcon className="w-4 h-4" />
            Your next career starts on a Monday
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Find your dream job with{" "}
            <span className="text-indigo-300">StartingMonday</span>
          </h1>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            Browse thousands of hand-picked opportunities from the world&apos;s
            best companies. Land the role that moves your career forward.
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto text-center">
            <div>
              <p className="text-2xl font-bold">8k+</p>
              <p className="text-indigo-300 text-sm">Open roles</p>
            </div>
            <div>
              <p className="text-2xl font-bold">1.2k</p>
              <p className="text-indigo-300 text-sm">Companies</p>
            </div>
            <div>
              <p className="text-2xl font-bold">50k+</p>
              <p className="text-indigo-300 text-sm">Placements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <Suspense fallback={null}>
          <SearchFilters />
        </Suspense>
      </div>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {hasFilters ? "Search results" : "Latest opportunities"}
            <span className="ml-2 text-base font-normal text-gray-400">
              ({filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""})
            </span>
          </h2>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No jobs found matching your criteria.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
