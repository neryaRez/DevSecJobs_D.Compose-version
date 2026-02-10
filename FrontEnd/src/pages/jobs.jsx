import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";

export default function Jobs() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: "",
    employment_type: "",
    work_location: "",
    description: "",
    required_technologies: "",
    required_experience: "",
    is_open: true,
  });

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Load jobs (GET /jobs/)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/jobs/", { headers: authHeader });
        setJobs(res.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Create job (POST /jobs/) — requires JWT + admin; publisher_id is sent from here
  const createJob = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first");
    if (!form.title.trim()) return alert("Job title is required");

    try {
      const payload = {
        ...form,
        required_experience: form.required_experience
          ? Number(form.required_experience)
          : null,
        publisher_id: user.id, // Backend does not derive this from token in your flow
      };

      await api.post("/jobs/", payload, { headers: authHeader });

      // Refresh list
      const list = await api.get("/jobs/", { headers: authHeader });
      setJobs(list.data || []);

      setCreating(false);
      setForm({
        title: "",
        employment_type: "",
        work_location: "",
        description: "",
        required_technologies: "",
        required_experience: "",
        is_open: true,
      });
    } catch (e) {
      console.error(e);
      alert("Job creation failed (Admin + valid JWT required)");
    }
  };

  // Delete job (DELETE /jobs/:id)
  const deleteJob = async (id) => {
    if (!confirm("Delete this job?")) return;
    try {
      await api.delete(`/jobs/${id}`, { headers: authHeader });
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed (Admin + JWT required)");
    }
  };

  // Toggle is_open (PUT /jobs/:id)
  const toggleOpen = async (job) => {
    try {
      const res = await api.put(
        `/jobs/${job.id}`,
        { is_open: !job.is_open },
        { headers: authHeader }
      );

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_open: res.data.is_open } : j))
      );
    } catch (e) {
      console.error(e);
      alert("Status update failed");
    }
  };

  return (
    <PageShell
      title="My Jobs"
      subtitle="Create, manage, and publish job posts."
    >
      {/* Header row (same style language as User pages) */}
      <div className="w-full flex items-center justify-between gap-4 mb-6 max-w-4xl mx-auto">
        <div className="text-sm text-slate-600">
          Total jobs: <span className="font-semibold text-slate-800">{jobs.length}</span>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-amber-600 text-white shadow-sm
                     hover:bg-amber-700 hover:shadow transition"
          type="button"
        >
          <span className="text-lg leading-none">+</span>
          <span>New Job</span>
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card>
            <CardHeader className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold">Create a job</div>
                <div className="mt-1 text-sm text-slate-600">
                  Fill in the details and click save.
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={createJob}
                className="w-full grid md:grid-cols-2 gap-4"
              >
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder="Job title *"
                  className="border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  required
                />

                <input
                  name="employment_type"
                  value={form.employment_type}
                  onChange={onChange}
                  placeholder="Employment type (Full-time / Part-time)"
                  className="border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />

                <input
                  name="work_location"
                  value={form.work_location}
                  onChange={onChange}
                  placeholder="Work location (Office / Remote / Hybrid)"
                  className="border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />

                <input
                  name="required_technologies"
                  value={form.required_technologies}
                  onChange={onChange}
                  placeholder="Required technologies (CSV: AWS, Docker, K8s)"
                  className="border border-slate-200 rounded-xl px-3 py-2 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />

                <input
                  type="number"
                  min="0"
                  name="required_experience"
                  value={form.required_experience}
                  onChange={onChange}
                  placeholder="Required experience (years)"
                  className="border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />

                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    name="is_open"
                    checked={form.is_open}
                    onChange={onChange}
                    className="accent-amber-600"
                  />
                  Open for applications
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Job description"
                  className="border border-slate-200 rounded-xl px-3 py-2 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  rows={3}
                />

                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white
                               hover:bg-amber-700 transition shadow-sm"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700
                               hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <p className="text-slate-600 text-center">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="text-slate-600 text-center">No jobs yet.</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const open = !!job.is_open;

              return (
                <Card key={job.id}>
                  <CardHeader className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            open
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {open ? "Open" : "Closed"}
                        </span>

                        <div className="text-lg font-semibold truncate">
                          {job.title}
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        {(job.work_location || "Location N/A")} ·{" "}
                        {(job.employment_type || "Type N/A")} ·{" "}
                        {job.required_experience != null
                          ? `${job.required_experience}y exp`
                          : "Experience N/A"}
                      </div>

                      {job.required_technologies && (
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-semibold text-slate-700">
                            Technologies:
                          </span>{" "}
                          {job.required_technologies}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleOpen(job)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold
                                   hover:bg-slate-50 transition"
                        type="button"
                      >
                        {open ? "Close" : "Open"}
                      </button>

                      <button
                        onClick={() => deleteJob(job.id)}
                        className="rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-white
                                   hover:bg-amber-700 transition"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </CardHeader>

                  {job.description ? (
                    <CardContent>
                      <p className="text-slate-700">{job.description}</p>
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
