interface KpiCardProps {
  title: string;
  value: string | number;
  changePercentage?: number;
  icon?: React.ReactNode;
}

export default function KpiCard({
  title,
  value,
  changePercentage,
  icon,
}: KpiCardProps) {
  const isPositive = (changePercentage ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/40 hover:shadow-cyan-500/10">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400">{title}</p>

          {icon && (
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300">
              {icon}
            </div>
          )}
        </div>

        <div className="mb-3">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            {value}
          </h2>
        </div>

        {changePercentage !== undefined && (
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(changePercentage)}% vs last year
          </div>
        )}
      </div>
    </div>
  );
}
