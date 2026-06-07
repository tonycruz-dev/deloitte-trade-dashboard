import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { appConfig } from "../config/appConfig";
import type { DashboardResponse } from "../types/dashboard";

export type DashboardConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

type DashboardHubOptions = {
  onDashboardUpdated: (dashboard: DashboardResponse) => void;
  onStatusChange: (status: DashboardConnectionStatus) => void;
};

const dashboardUpdatedEventName = "DashboardUpdated";

export async function connectDashboardHub({
  onDashboardUpdated,
  onStatusChange,
}: DashboardHubOptions): Promise<HubConnection> {
  const connection = new HubConnectionBuilder()
    .withUrl(appConfig.signalRHubUrl)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on(dashboardUpdatedEventName, onDashboardUpdated);

  connection.onreconnecting(() => {
    onStatusChange("reconnecting");
  });

  connection.onreconnected(() => {
    onStatusChange("connected");
  });

  connection.onclose(() => {
    onStatusChange("offline");
  });

  onStatusChange("connecting");

  try {
    await connection.start();
    onStatusChange(
      connection.state === HubConnectionState.Connected
        ? "connected"
        : "offline",
    );
  } catch {
    onStatusChange("offline");
    throw new Error("Unable to connect to the dashboard hub.");
  }

  return connection;
}
