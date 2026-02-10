import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";

export default function DashboardApplications() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!user || !user.is_admin) return;

    (async () => {
      try {
        const res = await api.get(`/apply/publisher/${user.id}`, {
          headers: authHeader,
        });
        setApplications(res.data || []);
      } catch (err) {
        console.error("Error loading applications:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <PageShell
      title="Job Applications"
      subtitle={`Applications submitted to your jobs. (${applications.length})`}
    >
      {loading ? (
        <p className="text-slate-600 text-center">Loading applications…</p>
      ) : applications.length === 0 ? (
        <p className="text-slate-600 text-center">
          No applications submitted yet.
        </p>
      ) : (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {applications.map((app, idx) => {
            const title =
              app.job_title || app.title || app.jobTitle || "Untitled job";

            const description =
              app.job_description ||
              app.description ||
              "No description provided.";

            const applicantName = app.applicant_name || "Not provided";

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
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">
                        Applicant:
                      </span>{" "}
                      {applicantName}
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
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Match score</span>
                      <span>
                        {score === null || Number.isNaN(score)
                          ? "N/A"
                          : `${scorePct}/100`}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
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
