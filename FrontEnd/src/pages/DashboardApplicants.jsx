import PageShell from "../components/ui/PageShell";
import Card, { CardHeader, CardContent } from "../components/ui/Card";

export default function DashboardApplicants() {
  return (
    <PageShell
      title="Applicants Pool"
      subtitle="Browse potential candidates in the system."
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-lg font-semibold">Coming soon</div>
              <div className="mt-1 text-sm text-slate-600">
                This page will include a searchable applicants database.
              </div>
            </div>
            <div className="text-2xl">🧑‍💻</div>
          </CardHeader>

          <CardContent>
            <p className="text-slate-700">
              For now, you can continue managing jobs and reviewing applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
