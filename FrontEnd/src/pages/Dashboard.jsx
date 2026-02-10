import { useNavigate } from "react-router-dom";
import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";

export default function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "My Jobs",
      subtitle: "Create, manage, and publish job posts",
      emoji: "🧩",
      onClick: () => navigate("/dashboard/jobs"),
    },
    {
      title: "Job Applications",
      subtitle: "Review applications submitted to your jobs",
      emoji: "📄",
      onClick: () => navigate("/dashboard/applications"),
    },
    {
      title: "Applicants Pool",
      subtitle: "Browse potential candidates in the system",
      emoji: "🧑‍💻",
      onClick: () => navigate("/dashboard/applicants"),
    },
  ];

  return (
    <PageShell
      title="Manager Area"
      subtitle="Your dashboard for jobs, applications, and applicants."
    >
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={c.onClick}
            className="text-left"
            type="button"
          >
            <Card className="h-full hover:-translate-y-0.5 transition">
              <CardHeader className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {c.subtitle}
                  </div>
                </div>
                <div className="text-2xl">{c.emoji}</div>
              </CardHeader>

              <CardContent>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <span>Open</span>
                  <span>→</span>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
