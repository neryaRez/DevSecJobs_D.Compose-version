import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";


export default function JobsFeed() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // טעינת כל המשרות
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/jobs/", { headers: authHeader });
        setJobs(res.data || []);
      } catch (err) {
        console.error("שגיאה בטעינת משרות:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // טעינת המועמדויות של המשתמש
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get(`/apply/user/${user.id}`, { headers: authHeader });
        setApplications(res.data || []);
      } catch (err) {
        console.error("שגיאה בטעינת מועמדויות:", err);
      }
    })();
  }, [user]);

  // בדיקה אם כבר הוגשה מועמדות
  const hasApplied = (jobId) => {
    return applications.some((app) => app.job_id === jobId);
  };

  // הגשת מועמדות למשרה
  const applyToJob = async (jobId) => {
    if (!user) return alert("יש להתחבר קודם");
    try {
      await api.post(
        `/apply/${jobId}`,
        { applicant_id: user.id },
        { headers: authHeader }
      );
      alert("המועמדות נשלחה בהצלחה ✅");
      setApplications((prev) => [...prev, { job_id: jobId, applicant_id: user.id }]);
    } catch (err) {
      console.error("שגיאה בהגשת מועמדות:", err);
      alert("שגיאה בהגשת מועמדות ❌");
    }
  };

return (
  <PageShell
    title="Jobs Feed"
    subtitle="Explore open roles and apply in one click."
  >
    {loading ? (
      <p className="text-slate-600 text-center">Loading jobs…</p>
    ) : jobs.length === 0 ? (
      <p className="text-slate-600 text-center">No jobs available right now.</p>
    ) : (
      <div className="grid gap-4 max-w-4xl mx-auto">
        {jobs.map((job) => {
          const applied = hasApplied(job.id);

          return (
            <Card key={job.id}>
              <CardHeader className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{job.title}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {(job.work_location || "Location N/A")} ·{" "}
                    {(job.employment_type || "Type N/A")}
                  </div>
                </div>

                {/* Badge קטן */}
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    applied
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {applied ? "Applied" : "Open"}
                </span>
              </CardHeader>

              <CardContent>
                <p className="text-slate-700">{job.description}</p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => applyToJob(job.id)}
                    disabled={applied}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                      applied
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-amber-600 hover:bg-amber-700 shadow-sm"
                    }`}
                  >
                    {applied ? "Already applied" : "Apply"}
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold
                               hover:bg-slate-50 transition"
                  >
                    Details
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}
  </PageShell>
);

}
