// src/api/dashboardApi.ts
import axios from "axios";
import type { DashboardResponse } from "../types/dashboard";

const api = axios.create({
  baseURL: "https://localhost:7001/api", // use your Swagger API port
});

export async function getDashboard(
  country?: string,
  tradeType?: string,
  period?: string,
): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>("/dashboard", {
    params: {
      country: country === "All" ? undefined : country,
      tradeType: tradeType === "All" ? undefined : tradeType,
      period: period === "All" ? undefined : period,
    },
  });

  return response.data;
}
