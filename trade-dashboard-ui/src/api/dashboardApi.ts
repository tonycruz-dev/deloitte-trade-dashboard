// src/api/dashboardApi.ts
import axios from "axios";
import type { DashboardResponse } from "../types/dashboard";

const api = axios.create({
  baseURL: "https://localhost:7001/api", // use your Swagger API port
});

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>("/dashboard");
  return response.data;
}
