import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const isPositive = (changePercentage ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-[1.35rem] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(8,47,73,0.12),rgba(2,6,23,0.18))] p-5 shadow-[0_18px_44px_rgba(2,12,27,0.16)] backdrop-blur-md transition-all duration-300 hover:border-cyan-300/22 hover:bg-[linear-gradient(180deg,rgba(8,47,73,0.16),rgba(2,6,23,0.22))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_36%),linear-gradient(180deg,_rgba(34,211,238,0.025),_transparent_58%)]" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-200/75">
            {title}
          </p>

          {icon && (
            <div className="rounded-full border border-cyan-300/12 bg-cyan-500/8 p-2 text-cyan-300/90">
              {icon}
            </div>
          )}
        </div>

        <div className="mb-3">
          <h2 className="text-3xl font-semibold tracking-tight text-white/95 xl:text-[2.35rem]">
            {value}
          </h2>
        </div>

        {changePercentage !== undefined && (
          <div
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.16em] uppercase backdrop-blur-sm ${
              isPositive
                ? "border-emerald-400/12 bg-emerald-500/8 text-emerald-200"
                : "border-red-400/12 bg-red-500/8 text-red-200"
            }`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(changePercentage)}%{" "}
            {t("common.versusLastYear")}
          </div>
        )}
      </div>
    </div>
  );
}
