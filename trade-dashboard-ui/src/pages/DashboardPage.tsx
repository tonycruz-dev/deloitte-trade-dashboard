// src/pages/DashboardPage.tsx

import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi";
import type { DashboardResponse } from "../types/dashboard";
import KpiCard from "../components/KpiCard";

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

        <section className="mb-8 grid gap-6 md:grid-cols-2">
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
