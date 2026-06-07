import axios from "axios";
import type { DashboardResponse } from "../types/dashboard";

export const apiBaseUrl = "https://localhost:7001";

const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
});

function buildDashboardParams(country?: string, tradeType?: string, period?: string) {
  return {
    country: country === "All" ? undefined : country,
    tradeType: tradeType === "All" ? undefined : tradeType,
    period: period === "All" ? undefined : period,
  };
}

export async function getDashboard(
  country?: string,
  tradeType?: string,
  period?: string,
): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>("/dashboard", {
    params: buildDashboardParams(country, tradeType, period),
  });

  return response.data;
}

export async function simulateDashboardUpdate(
  country?: string,
  tradeType?: string,
  period?: string,
): Promise<DashboardResponse> {
  const response = await api.post<DashboardResponse>(
    "/dashboard/simulate-update",
    undefined,
    {
      params: buildDashboardParams(country, tradeType, period),
    },
  );

  return response.data;
}
