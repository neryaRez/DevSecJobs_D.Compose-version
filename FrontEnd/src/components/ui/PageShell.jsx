export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-slate-50 to-white text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="mb-8 rounded-2xl border border-amber-200/60 
                          bg-gradient-to-r from-amber-50 via-stone-50 to-white
                          px-6 py-5 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}
