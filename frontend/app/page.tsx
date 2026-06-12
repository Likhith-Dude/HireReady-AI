"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { jobsApi, applicationsApi, DEFAULT_RESUME } from "@/lib/api";
import { Search, MapPin, Building2, ExternalLink, Plus, Loader2, Zap } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  posted: string;
  tags: string[];
  source: string;
}

export default function JobSearchPage() {
  const [title, setTitle] = useState("MLOps Engineer");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    try {
      const res = await jobsApi.search(title, location, 20);
      setJobs(res.data.jobs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function trackJob(job: Job) {
    setTrackingId(job.id);
    try {
      await applicationsApi.create({
        job_title: job.title,
        company: job.company,
        location: job.location,
        job_url: job.url,
        job_description: job.description,
        status: "Applied",
      });
      alert(`"${job.title}" at ${job.company} added to tracker!`);
    } catch {
      alert("Error adding to tracker");
    } finally {
      setTrackingId(null);
    }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
          <p className="text-gray-500 mt-1">Find the latest opportunities matching your skills</p>
        </div>

        {/* Search Bar */}
        <div className="card p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Job title, role, or keywords"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
            </div>
            <div className="w-48 relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={search} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        {/* Suggested Roles */}
        {jobs.length === 0 && !loading && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Suggested for you:</p>
            <div className="flex flex-wrap gap-2">
              {["MLOps Engineer", "Cloud Engineer", "AI/ML Engineer", "DevOps Engineer", "Platform Engineer"].map((role) => (
                <button
                  key={role}
                  onClick={() => { setTitle(role); }}
                  className="badge bg-indigo-50 text-indigo-700 cursor-pointer hover:bg-indigo-100 px-3 py-1 text-sm rounded-full border border-indigo-200"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="ml-3 text-gray-500">Searching jobs...</span>
          </div>
        )}

        {jobs.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">{jobs.length} jobs found</p>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        <span className="badge bg-gray-100 text-gray-600">{job.source}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                      {job.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.tags.slice(0, 6).map((tag) => (
                            <span key={tag} className="badge bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4 shrink-0">
                      <a href={job.url} target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-1 text-sm px-3 py-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                      <button
                        onClick={() => trackJob(job)}
                        disabled={trackingId === job.id}
                        className="btn-primary flex items-center gap-1 text-sm px-3 py-1.5"
                      >
                        {trackingId === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
