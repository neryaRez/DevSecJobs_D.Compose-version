const MAP = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function StatusBadge({ value }) {
  const key = (value || "").toLowerCase();
  const cls = MAP[key] || "bg-slate-50 text-slate-700 border-slate-200";

return (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ring-1 ring-amber-100 ${cls}`}>
    {value || "unknown"}
  </span>
);

}
