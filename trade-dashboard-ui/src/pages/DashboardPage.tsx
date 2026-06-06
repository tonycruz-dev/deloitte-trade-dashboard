import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi";
import KpiCard from "../components/KpiCard";
import TradeMap from "../components/TradeMap";
import type { DashboardResponse } from "../types/dashboard";

function getPeriodLabel(period: string) {
  if (period === "2024-03") return "March 2024";
  if (period === "2024-02") return "February 2024";
  if (period === "2024-01") return "January 2024";
  return period;
}

function FilterPill({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="glass-pill flex min-w-[170px] items-center gap-3 pr-3 text-left">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-200/75">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm font-medium text-white outline-none"
      >
        {children}
      </select>
    </label>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [tradeType, setTradeType] = useState("All");
  const [period, setPeriod] = useState("2024-03");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboard(selectedCountry, tradeType, period);

        if (isMounted) {
          setData(result);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [period, selectedCountry, tradeType]);

  const shellClasses =
    "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(13,148,136,0.12),_transparent_24%),linear-gradient(140deg,_#020817_0%,_#071525_38%,_#03111b_72%,_#02060f_100%)] text-white";

  if (loading) {
    return (
      <div className={shellClasses}>
        <div className="absolute inset-0 opacity-70">
          <TradeMap />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="glass-panel w-full max-w-md px-8 py-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              Customs Control
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Loading dashboard intelligence
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Retrieving trade declarations, goods value, and market movement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={shellClasses}>
        <div className="absolute inset-0 opacity-60">
          <TradeMap />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="glass-panel w-full max-w-lg border-red-400/30 px-8 py-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-red-300/80">
              Data Connection Error
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={shellClasses}>
        <div className="absolute inset-0 opacity-60">
          <TradeMap />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="glass-panel w-full max-w-lg px-8 py-10 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              No Data
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              No dashboard data found.
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClasses}>
      <div className="absolute inset-0 z-0">
        <TradeMap />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.12),_transparent_30%),linear-gradient(180deg,_rgba(2,6,23,0.18)_0%,_rgba(2,6,23,0.2)_26%,_rgba(2,6,23,0.52)_70%,_rgba(2,6,23,0.9)_100%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-1/3 bg-gradient-to-r from-slate-950/55 via-slate-950/20 to-transparent" />

      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        <header className="glass-panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-cyan-200/80">
                Deloitte Trade Intelligence
              </p>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white lg:text-[2.6rem]">
              Goods Movement Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Executive customs monitoring across strategic trade corridors,
              declaration volumes, and goods value performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <div className="rounded-full border border-cyan-400/20 bg-slate-950/40 px-4 py-2 backdrop-blur-md">
              <span className="text-slate-400">Mode </span>
              <span className="font-medium text-cyan-200">Live Dashboard</span>
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-slate-950/40 px-4 py-2 backdrop-blur-md">
              <span className="text-slate-400">Period </span>
              <span className="font-medium text-white">
                {getPeriodLabel(period)}
              </span>
            </div>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <section className="flex flex-wrap gap-3">
            <FilterPill
              label="Country"
              value={selectedCountry}
              onChange={setSelectedCountry}
            >
              <option value="All">All Countries</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Turkey">Turkey</option>
              <option value="Germany">Germany</option>
              <option value="England">England</option>
            </FilterPill>

            <FilterPill
              label="Trade Type"
              value={tradeType}
              onChange={setTradeType}
            >
              <option value="All">All</option>
              <option value="Import">Import</option>
              <option value="Export">Export</option>
              <option value="Transit">Transit</option>
            </FilterPill>

            <FilterPill label="Period" value={period} onChange={setPeriod}>
              <option value="2024-03">March 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-01">January 2024</option>
            </FilterPill>
          </section>

          <section className="grid w-full gap-4 md:grid-cols-2 xl:max-w-3xl">
            <KpiCard
              title="Total Customs Declarations"
              value={data.totalDeclarations.toLocaleString()}
              changePercentage={15}
            />
            <KpiCard
              title="Total Goods Value"
              value={`£${data.totalGoodsValue.toLocaleString()}`}
              changePercentage={15}
            />
          </section>
        </div>

        <div className="flex-1" />

        <section className="glass-panel mt-8 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-cyan-200/75">
                Top Markets
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Highest declaration activity
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Bubble flows and market ranking update with the selected
                dashboard filters.
              </p>
            </div>

            <div className="rounded-full border border-cyan-400/20 bg-slate-950/35 px-4 py-2 text-sm text-slate-300 backdrop-blur-md">
              Current period:
              <span className="ml-2 font-medium text-white">
                {getPeriodLabel(period)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-5">
            {data.topCountries.map((country, index) => (
              <div
                key={country.country}
                className="rounded-2xl border border-cyan-400/10 bg-slate-950/35 px-4 py-4 shadow-[0_12px_28px_rgba(2,12,27,0.18)] backdrop-blur-md"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  {(index + 1).toString().padStart(2, "0")}
                </p>
                <p className="mt-5 text-lg font-semibold text-white">
                  {country.country}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Declaration Volume
                </p>
                <p className="mt-1 text-xl font-semibold text-cyan-200">
                  {country.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
