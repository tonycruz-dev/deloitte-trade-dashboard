// src/pages/DashboardPage.tsx

import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi";
import type { DashboardResponse } from "../types/dashboard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  if (!data) {
    return <div className="p-6 text-white">No dashboard data found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl p-6">
        <header className="mb-8">
          <p className="text-sm text-cyan-300">Trade Dashboard</p>
          <h1 className="text-3xl font-bold">Goods Movement Overview</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-lg">
            <p className="text-sm text-slate-400">Total Customs Declarations</p>
            <h2 className="mt-2 text-4xl font-bold">
              {data.totalDeclarations.toLocaleString()}
            </h2>
            <p className="mt-2 text-sm text-emerald-400">
              15% higher than last year
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-lg">
            <p className="text-sm text-slate-400">Total Goods Value</p>
            <h2 className="mt-2 text-4xl font-bold">
              £{data.totalGoodsValue.toLocaleString()}
            </h2>
            <p className="mt-2 text-sm text-emerald-400">
              15% higher than last year
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Top Countries</h3>
            <span className="text-sm text-slate-400">
              Current period: March 2024
            </span>
          </div>

          <div className="space-y-3">
            {data.topCountries.map((country, index) => (
              <div
                key={country.country}
                className="flex items-center justify-between rounded-xl bg-slate-800/80 px-4 py-3"
              >
                <div>
                  <span className="mr-3 text-slate-500">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span>{country.country}</span>
                </div>

                <strong>{country.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
