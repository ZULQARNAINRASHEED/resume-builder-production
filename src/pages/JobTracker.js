import React, { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

const JobTracker = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [fullTime, setFullTime] = useState(false);
  const [permanent, setPermanent] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const resultsPerPage = 20;

  // =========================================================
  // FETCH JOBS
  // =========================================================

  const fetchJobs = async (
    title = "software developer",
    city = "",
    selectedPage = 1
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        what: title,
        where: city,
        page: selectedPage.toString(),
        results_per_page: resultsPerPage.toString(),
        country: "gb",
        sort_by: sortBy,
      });

      // Full Time
      if (fullTime) {
        params.append("full_time", "1");
      }

      // Permanent
      if (permanent) {
        params.append("permanent", "1");
      }

      // Minimum Salary
      if (salaryMin) {
        params.append("salary_min", salaryMin);
      }

      const response = await fetch(
        `${apiUrl("jobs")}?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch jobs.");
      }

      setJobs(data.jobs || []);
      setTotalJobs(data.count || 0);
      setPage(selectedPage);

    } catch (err) {
      console.error("Job fetch error:", err);

      setError(
        "Unable to fetch jobs. Please make sure Laravel server is running."
      );

      setJobs([]);
      setTotalJobs(0);

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL RECOMMENDED JOBS
  // =========================================================

  useEffect(() => {
    fetchJobs();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!jobTitle.trim()) {
      setError("Please enter a job title.");
      return;
    }

    setHasSearched(true);

    await fetchJobs(
      jobTitle.trim(),
      location.trim(),
      1
    );
  };

  // =========================================================
  // APPLY FILTERS
  // =========================================================

  const handleApplyFilters = async () => {
    const title = jobTitle.trim() || "software developer";

    if (jobTitle.trim()) {
      setHasSearched(true);
    }

    await fetchJobs(
      title,
      location.trim(),
      1
    );
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalJobs / resultsPerPage);

    if (page < totalPages) {
      fetchJobs(
        jobTitle.trim() || "software developer",
        location.trim(),
        page + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      fetchJobs(
        jobTitle.trim() || "software developer",
        location.trim(),
        page - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =========================================================
  // CLEAR SEARCH / FILTERS
  // =========================================================

  const handleClearSearch = () => {
    setJobTitle("");
    setLocation("");

    setFullTime(false);
    setPermanent(false);
    setSalaryMin("");
    setSortBy("relevance");

    setHasSearched(false);
    setPage(1);
    setError("");

    fetchJobs(
      "software developer",
      "",
      1
    );
  };

  // =========================================================
  // SALARY FORMAT
  // =========================================================

  const formatSalary = (min, max) => {
    if (!min && !max) {
      return "Salary not specified";
    }

    if (min && max) {
      return `£${Number(min).toLocaleString()} - £${Number(
        max
      ).toLocaleString()}`;
    }

    return `£${Number(min || max).toLocaleString()}`;
  };

  // =========================================================
  // CONTRACT FORMAT
  // =========================================================

  const formatContract = (value) => {
    if (!value) return "";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================================================
  // PAGINATION INFO
  // =========================================================

  const totalPages = Math.ceil(
    totalJobs / resultsPerPage
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 py-10">

      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="text-center mb-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-semibold mb-4">
            🔎 Job Search
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            Find Your{" "}
            <span className="text-cyan-600">
              Dream Job
            </span>
          </h1>

          <p className="mt-4 text-slate-500 max-w-2xl mx-auto leading-7">
            Search thousands of job opportunities and find
            the perfect position for your skills and career.
          </p>

        </div>


        {/* =====================================================
            SEARCH
        ===================================================== */}

        <form
          onSubmit={handleSearch}
          className="bg-white border border-slate-200 rounded-2xl shadow-xl p-5 md:p-7 mb-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">

            {/* Job title */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Job title or keyword
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="e.g. Laravel Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />

              </div>

            </div>


            {/* Location */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  📍
                </span>

                <input
                  type="text"
                  placeholder="e.g. London"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />

              </div>

            </div>


            {/* Search */}

            <div className="flex items-end">

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-[160px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg hover:from-cyan-700 hover:to-teal-700 hover:shadow-xl active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Searching..."
                  : "Search Jobs"}
              </button>

            </div>

          </div>

        </form>


        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-10">

          <div className="flex flex-col lg:flex-row lg:items-end gap-5">

            {/* Full Time */}

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={fullTime}
                onChange={(e) =>
                  setFullTime(e.target.checked)
                }
                className="w-4 h-4 accent-cyan-600"
              />

              <span className="text-sm font-medium text-slate-700">
                Full Time
              </span>

            </label>


            {/* Permanent */}

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={permanent}
                onChange={(e) =>
                  setPermanent(e.target.checked)
                }
                className="w-4 h-4 accent-cyan-600"
              />

              <span className="text-sm font-medium text-slate-700">
                Permanent
              </span>

            </label>


            {/* Minimum Salary */}

            <div>

              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Minimum Salary
              </label>

              <input
                type="number"
                placeholder="e.g. 40000"
                value={salaryMin}
                onChange={(e) =>
                  setSalaryMin(e.target.value)
                }
                className="w-full lg:w-40 px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

            </div>


            {/* Sort */}

            <div>

              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="w-full lg:w-40 px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >

                <option value="relevance">
                  Relevance
                </option>

                <option value="date">
                  Latest
                </option>

                <option value="salary">
                  Salary
                </option>

              </select>

            </div>


            {/* Apply */}

            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-cyan-600 transition disabled:opacity-60"
            >
              Apply Filters
            </button>

          </div>

        </div>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-center">
            {error}
          </div>
        )}


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="flex flex-col justify-center items-center py-12">

            <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>

            <p className="mt-4 text-slate-500">
              Finding the best jobs for you...
            </p>

          </div>
        )}


        {/* =====================================================
            RESULTS
        ===================================================== */}

        {!loading && jobs.length > 0 && (

          <div>

            {/* Heading */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">

                  {hasSearched
                    ? `Search Results for "${jobTitle}"`
                    : "Recommended Jobs"}

                </h2>

                <p className="text-slate-500 mt-1">

                  {hasSearched
                    ? `Found ${totalJobs.toLocaleString()} jobs for your search.`
                    : "Explore some recommended opportunities to get started."}

                </p>

              </div>


              <div className="mt-3 md:mt-0">

                <span className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-50 text-cyan-700 text-sm font-semibold">
                  {totalJobs.toLocaleString()} Jobs
                </span>

              </div>

            </div>


            {/* Job Cards */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {jobs.map((job) => (

                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >

                  {/* Header */}

                  <div className="flex items-start justify-between gap-4 mb-4">

                    <div className="min-w-0">

                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
                        {job.title}
                      </h3>

                      <p className="text-cyan-600 font-medium mt-1 truncate">
                        {job.company}
                      </p>

                    </div>

                    <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-cyan-50 flex items-center justify-center text-xl">
                      💼
                    </div>

                  </div>


                  {/* Location */}

                  <p className="text-sm text-slate-500 mb-3">
                    📍 {job.location}
                  </p>


                  {/* Salary */}

                  <div className="mb-4">

                    <span className="inline-block px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold">
                      💰{" "}
                      {formatSalary(
                        job.salary_min,
                        job.salary_max
                      )}
                    </span>

                  </div>


                  {/* Tags */}

                  <div className="flex flex-wrap gap-2 mb-5">

                    {job.contract_type && (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {formatContract(
                          job.contract_type
                        )}
                      </span>
                    )}

                    {job.contract_time && (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {formatContract(
                          job.contract_time
                        )}
                      </span>
                    )}

                    {job.category && (
                      <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">
                        {job.category}
                      </span>
                    )}

                  </div>


                  {/* Description */}

                  <p className="text-sm text-slate-500 leading-6 line-clamp-3 mb-5">
                    {job.description}
                  </p>


                  {/* View Job */}

                  <div className="mt-auto">

                    <a
                      href={job.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-cyan-600 transition"
                    >
                      View Job →
                    </a>

                  </div>

                </div>

              ))}

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalPages > 1 && (

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">

                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1 || loading}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>


                <div className="px-5 py-2.5 rounded-lg bg-cyan-50 text-cyan-700 font-semibold">
                  Page {page} of {totalPages}
                </div>


                <button
                  onClick={handleNextPage}
                  disabled={
                    page >= totalPages || loading
                  }
                  className="px-5 py-2.5 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>

              </div>

            )}

          </div>

        )}


        {/* =====================================================
            NO RESULTS
        ===================================================== */}

        {!loading &&
          !error &&
          hasSearched &&
          jobs.length === 0 && (

            <div className="text-center py-14">

              <div className="text-5xl mb-4">
                🔎
              </div>

              <h3 className="text-xl font-semibold text-slate-700">
                No jobs found
              </h3>

              <p className="text-slate-500 mt-2">
                Try another job title, location or filter.
              </p>

              <button
                onClick={handleClearSearch}
                className="mt-5 px-5 py-2.5 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
              >
                Show Recommended Jobs
              </button>

            </div>

          )}

      </div>

    </div>
  );
};

export default JobTracker;