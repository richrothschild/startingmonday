"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SearchIcon, MapPinIcon } from "./icons";

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const experienceLevels = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Executive",
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(
    searchParams.get("location") ?? ""
  );
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [level, setLevel] = useState(searchParams.get("level") ?? "");
  const [remote, setRemote] = useState(
    searchParams.get("remote") === "true"
  );

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (level) params.set("level", level);
    if (remote) params.set("remote", "true");
    router.push(`/?${params.toString()}`);
  }, [query, location, type, level, remote, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  const clearFilters = () => {
    setQuery("");
    setLocation("");
    setType("");
    setLevel("");
    setRemote(false);
    router.push("/");
  };

  const hasFilters = query || location || type || level || remote;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Search row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Job title, company, or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-48 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={applyFilters}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Filter chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500 mr-1">Filters:</span>

        {jobTypes.map((t) => (
          <button
            key={t}
            onClick={() => setType(type === t ? "" : t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              type === t
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {t}
          </button>
        ))}

        <div className="h-4 border-l border-gray-200 mx-1" />

        {experienceLevels.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(level === l ? "" : l)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              level === l
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {l}
          </button>
        ))}

        <div className="h-4 border-l border-gray-200 mx-1" />

        <button
          onClick={() => setRemote(!remote)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            remote
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600"
          }`}
        >
          Remote only
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-600 underline ml-2 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
