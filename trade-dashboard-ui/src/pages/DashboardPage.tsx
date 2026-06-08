import { useEffect, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { useTranslation } from "react-i18next";
import { getDashboard, simulateDashboardUpdate } from "../api/dashboardApi";
import BottomCountriesPanel from "../components/BottomCountriesPanel";
import type { FilterDropdownOption } from "../components/FilterDropdown";
import KpiCard from "../components/KpiCard";
import TopNavigation from "../components/TopNavigation";
import {
  connectDashboardHub,
  type DashboardConnectionStatus,
} from "../realtime/dashboardHub";
import { getCountryTranslationKey } from "../i18n/countries";
import TradeMap from "../components/TradeMap";
import type { DashboardResponse } from "../types/dashboard";

function getPeriodLabel(period: string) {
  if (period === "2024-03") return "March 2024";
  if (period === "2024-02") return "February 2024";
  if (period === "2024-01") return "January 2024";
  return period;
}

function getConnectionStatusCopy(status: DashboardConnectionStatus) {
  if (status === "connected") return "Live connected";
  if (status === "reconnecting") return "Reconnecting";
  return "Offline";
}

function getConnectionStatusClasses(status: DashboardConnectionStatus) {
  if (status === "connected") {
    return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  }

  if (status === "reconnecting") {
    return "border-amber-300/35 bg-amber-400/10 text-amber-100";
  }

  return "border-slate-300/20 bg-slate-500/10 text-slate-100";
}

const shellClasses =
  "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(13,148,136,0.12),_transparent_24%),linear-gradient(140deg,_#020817_0%,_#071525_38%,_#03111b_72%,_#02060f_100%)] text-white";

function LoadingState() {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md px-8 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
          {t("dashboard.customsControl")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          {t("dashboard.loadingDashboardIntelligence")}
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          {t("dashboard.loadingDescription")}
        </p>
      </div>
    </div>
  );
}

function MessageState({
  label,
  title,
  accentClassName,
}: {
  label: string;
  title: string;
  accentClassName: string;
}) {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
      <div
        className={`glass-panel w-full max-w-lg px-8 py-10 text-center ${accentClassName}`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
          {label}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulateError, setSimulateError] = useState("");
  const [liveStatus, setLiveStatus] =
    useState<DashboardConnectionStatus>("connecting");
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [tradeType, setTradeType] = useState("All");
  const [period, setPeriod] = useState("2024-03");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        setSimulateError("");

        const result = await getDashboard(selectedCountry, tradeType, period);

        if (isMounted) {
          setData(result);
        }
      } catch {
        if (isMounted) {
          setError(t("dashboard.failedToLoad"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [period, selectedCountry, t, tradeType]);

  useEffect(() => {
    let isMounted = true;
    let hubConnection: HubConnection | null = null;

    async function startHub() {
      try {
        hubConnection = await connectDashboardHub({
          onDashboardUpdated: (nextDashboard) => {
            if (isMounted) {
              setData((previousDashboard) => ({
                totalDeclarations:
                  nextDashboard.totalDeclarations ??
                  previousDashboard?.totalDeclarations ??
                  0,
                totalGoodsValue:
                  nextDashboard.totalGoodsValue ??
                  previousDashboard?.totalGoodsValue ??
                  0,
                topCountries:
                  nextDashboard.topCountries?.length > 0
                    ? nextDashboard.topCountries
                    : (previousDashboard?.topCountries ?? []),
                mapPoints:
                  nextDashboard.mapPoints?.length > 0
                    ? nextDashboard.mapPoints
                    : (previousDashboard?.mapPoints ?? []),
              }));
            }
          },
          onStatusChange: (status) => {
            if (isMounted) {
              setLiveStatus(status);
            }
          },
        });
      } catch {
        if (isMounted) {
          setLiveStatus("offline");
        }
      }
    }

    void startHub();

    return () => {
      isMounted = false;

      if (hubConnection) {
        void hubConnection.stop();
      }
    };
  }, []);

  async function handleSimulateLiveUpdate() {
    try {
      setSimulateLoading(true);
      setSimulateError("");

      const updatedDashboard = await simulateDashboardUpdate(
        selectedCountry,
        tradeType,
        period,
      );

      if (liveStatus !== "connected") {
        setData((previousDashboard) => ({
          totalDeclarations:
            updatedDashboard.totalDeclarations ??
            previousDashboard?.totalDeclarations ??
            0,
          totalGoodsValue:
            updatedDashboard.totalGoodsValue ??
            previousDashboard?.totalGoodsValue ??
            0,
          topCountries:
            updatedDashboard.topCountries?.length > 0
              ? updatedDashboard.topCountries
              : (previousDashboard?.topCountries ?? []),
          mapPoints:
            updatedDashboard.mapPoints?.length > 0
              ? updatedDashboard.mapPoints
              : (previousDashboard?.mapPoints ?? []),
        }));
      }
    } catch {
      setSimulateError("Unable to simulate a live update.");
    } finally {
      setSimulateLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={shellClasses}>
        <div className="absolute inset-0 opacity-70">
          <TradeMap mapPoints={[]} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.1),_transparent_34%),linear-gradient(180deg,_rgba(2,6,23,0.1)_0%,_rgba(2,6,23,0.18)_34%,_rgba(2,6,23,0.42)_100%)]" />
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className={shellClasses}>
        <div className="absolute inset-0 opacity-60">
          <TradeMap mapPoints={[]} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(2,6,23,0.22)_0%,_rgba(2,6,23,0.74)_100%)]" />
        <MessageState
          label={t("dashboard.dataConnectionError")}
          title={error}
          accentClassName="border-red-400/30"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={shellClasses}>
        <div className="absolute inset-0 opacity-60">
          <TradeMap mapPoints={[]} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,_rgba(2,6,23,0.22)_0%,_rgba(2,6,23,0.74)_100%)]" />
        <MessageState
          label={t("dashboard.noData")}
          title={t("dashboard.noData")}
          accentClassName=""
        />
      </div>
    );
  }

  const periodLabel = getPeriodLabel(period);
  const countryOptions: FilterDropdownOption[] = [
    { value: "All", label: t("dashboard.allCountries") },
    { value: "China", label: t(getCountryTranslationKey("China")) },
    { value: "India", label: t(getCountryTranslationKey("India")) },
    { value: "Turkey", label: t(getCountryTranslationKey("Turkey")) },
    { value: "Germany", label: t(getCountryTranslationKey("Germany")) },
    { value: "England", label: "England" },
  ];
  const tradeTypeOptions: FilterDropdownOption[] = [
    { value: "All", label: t("dashboard.all") },
    { value: "Import", label: t("nav.import") },
    { value: "Export", label: t("nav.export") },
    { value: "Transit", label: t("nav.transit") },
  ];
  const periodOptions: FilterDropdownOption[] = [
    { value: "2024-03", label: "March 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-01", label: "January 2024" },
  ];

  return (
    <div className={shellClasses}>
      <div className="pointer-events-auto absolute inset-0 z-0">
        <TradeMap mapPoints={data.mapPoints ?? []} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.07),_transparent_36%),linear-gradient(180deg,_rgba(2,6,23,0.02)_0%,_rgba(2,6,23,0.05)_20%,_rgba(2,6,23,0.12)_52%,_rgba(2,6,23,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[22%] bg-gradient-to-r from-slate-950/10 via-slate-950/3 to-transparent" />

      <div className="pointer-events-none relative z-10 min-h-screen">
        <div className="pointer-events-auto absolute inset-x-0 top-0 px-3 pt-3 sm:px-4 lg:px-6">
          <TopNavigation />
        </div>

        <div className="pointer-events-auto absolute right-3 top-[11.75rem] z-20 w-[min(34rem,calc(100%-1.5rem))] px-0 sm:right-10 sm:w-[min(38rem,calc(100%-5rem))] lg:right-20 lg:top-[12.2rem] xl:right-28">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div
              className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${getConnectionStatusClasses(
                liveStatus,
              )}`}
            >
              {getConnectionStatusCopy(liveStatus)}
            </div>
            <button
              type="button"
              onClick={() => void handleSimulateLiveUpdate()}
              disabled={simulateLoading}
              className="inline-flex items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/12 px-5 py-2.5 text-sm font-semibold text-cyan-50 shadow-[0_12px_30px_rgba(34,211,238,0.12)] transition hover:border-cyan-200/45 hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {simulateLoading ? "Simulating..." : "Simulate Live Update"}
            </button>
          </div>

          {simulateError ? (
            <p className="mb-4 text-right text-sm text-amber-200">
              {simulateError}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <KpiCard
              title={t("dashboard.totalGoodsValue")}
              value={`£${data.totalGoodsValue.toLocaleString()}`}
              changePercentage={15}
            />
            <KpiCard
              title={t("dashboard.totalCustomsDeclarations")}
              value={data.totalDeclarations.toLocaleString()}
              changePercentage={15}
            />
          </div>
        </div>

        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-4 lg:px-6">
          <BottomCountriesPanel
            periodLabel={periodLabel}
            selectedCountry={selectedCountry}
            selectedTradeType={tradeType}
            selectedPeriod={period}
            onCountryChange={setSelectedCountry}
            onTradeTypeChange={setTradeType}
            onPeriodChange={setPeriod}
            countries={data.topCountries}
            countryOptions={countryOptions}
            tradeTypeOptions={tradeTypeOptions}
            periodOptions={periodOptions}
          />
        </div>
      </div>
    </div>
  );
}
