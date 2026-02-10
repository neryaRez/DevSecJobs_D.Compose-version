import { useNavigate } from "react-router-dom";
import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";

export default function UserHome() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "My Applications",
      subtitle: "Track statuses, match score, and history",
      emoji: "📄",
      onClick: () => navigate("/my-applications"),
    },
    {
      title: "Jobs Feed",
      subtitle: "Explore open roles and apply quickly",
      emoji: "📢",
      onClick: () => navigate("/jobs-feed"),
    },
    {
      title: "Update Profile",
      subtitle: "Boost your match score with better data",
      emoji: "✨",
      onClick: () => navigate("/complete-profile"),
    },
  ];

  return (
    <PageShell
      title="Candidate Area"
      subtitle="Your personal dashboard for jobs, applications, and profile."
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
