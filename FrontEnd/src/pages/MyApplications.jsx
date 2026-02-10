import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";


export default function MyApplications() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // טעינת המועמדויות
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get(`/apply/user/${user.id}`, { headers: authHeader });
        setApplications(res.data || []);
      } catch (err) {
        console.error("שגיאה בטעינת מועמדויות:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

return (
  <PageShell
    title="My Applications"
    subtitle={`Track the status of jobs you've applied to. (${applications.length})`}
  >
    {loading ? (
      <p className="text-slate-600">Loading…</p>
    ) : applications.length === 0 ? (
      <p className="text-slate-600">No applications yet.</p>
    ) : (
      <div className="grid gap-4">
        {applications.map((app, idx) => {
          const title =
            app.job_title || app.title || app.jobTitle || "Untitled job";

          const description =
            app.job_description || app.description || "No description provided.";

          const scoreRaw = app.score;
          const score =
            scoreRaw === null || scoreRaw === undefined || scoreRaw === ""
              ? null
              : Number(scoreRaw);

          const scorePct =
            score === null || Number.isNaN(score)
              ? 0
              : Math.max(0, Math.min(100, score));

          return (
            <Card key={app.id ?? app._id ?? `${app.job_id ?? "job"}-${idx}`}>
              <CardHeader className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{title}</div>
                  <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {description}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {score !== null && !Number.isNaN(score) && (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      Score: {scorePct}
                    </span>
                  )}
                  <StatusBadge value={app.status} />
                </div>
              </CardHeader>

              <CardContent>
                {/* פס ציון קטן שנותן “תחושת מוצר” */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Match score</span>
                    <span>{score === null || Number.isNaN(score) ? "N/A" : `${scorePct}/100`}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                   <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${scorePct}%` }}
                  />
                  </div>
                </div>

                {/* שורה תחתונה: פרטים */}
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                  {app.work_location && (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      {app.work_location}
                    </span>
                  )}
                  {app.employment_type && (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      {app.employment_type}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600">
                    View Job
                  </button>

                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
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
