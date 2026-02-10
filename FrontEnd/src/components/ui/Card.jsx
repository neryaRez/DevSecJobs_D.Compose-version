export default function Card({ children, className = "" }) {
  return (
<div className={`rounded-2xl bg-white shadow-sm ring-1 ring-amber-100/70
                 hover:shadow-md hover:ring-amber-200 transition ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-5 pt-5 border-t-4 border-amber-200/60 rounded-t-2xl ${className}`}>
      {children}
    </div>
  );
}


export function CardContent({ children, className = "" }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}
