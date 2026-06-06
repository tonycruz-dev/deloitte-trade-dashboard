// src/pages/DashboardPage.tsx

import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboardApi";
import type { DashboardResponse } from "../types/dashboard";
import KpiCard from "../components/KpiCard";

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
  }, [tradeType, period, selectedCountry]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-red-400">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        No dashboard data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl p-6">
        <header className="mb-8">
          <p className="text-sm text-cyan-300">Trade Dashboard</p>
          <h1 className="text-3xl font-bold">Goods Movement Overview</h1>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Country Filter */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Country
              </label>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
              >
                <option value="All">All Countries</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="Turkey">Turkey</option>
                <option value="Germany">Germany</option>
                <option value="England">England</option>
              </select>
            </div>

            {/* Trade Type Filter */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Trade Type
              </label>

              <select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
              >
                <option value="All">All</option>
                <option value="Import">Import</option>
                <option value="Export">Export</option>
                <option value="Transit">Transit</option>
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Period
              </label>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white outline-none focus:border-cyan-400"
              >
                <option value="2024-03">March 2024</option>
                <option value="2024-02">February 2024</option>
                <option value="2024-01">January 2024</option>
              </select>
            </div>
          </div>
        </section>

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
