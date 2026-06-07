function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeApiBaseUrl(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const normalizedValue = trimTrailingSlashes(value.trim()).replace(/\/api$/i, "");

  return normalizedValue === "/" ? "" : normalizedValue;
}

function normalizeAppPath(value: string, fallbackValue: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return fallbackValue;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimTrailingSlashes(trimmedValue);
  }

  const normalizedPath = `/${trimmedValue.replace(/^\/+/, "").replace(/\/+$/, "")}`;

  return normalizedPath || fallbackValue;
}

function getRequiredEnvVar(name: string, value: string | undefined): string {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return trimmedValue;
}

function joinUrl(baseUrl: string, path: string): string {
  if (!path) {
    return baseUrl;
  }

  if (!baseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalizedBaseUrl = trimTrailingSlashes(baseUrl);
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const rawSignalRHubUrl = import.meta.env.VITE_SIGNALR_HUB_URL;
const rawMapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

const apiBaseUrl = normalizeApiBaseUrl(rawApiBaseUrl);
const signalRHubPath = normalizeAppPath(rawSignalRHubUrl, "/hubs/dashboard");

export const appConfig = {
  apiBaseUrl,
  signalRHubUrl: joinUrl(apiBaseUrl, signalRHubPath),
  mapboxToken: getRequiredEnvVar("VITE_MAPBOX_TOKEN", rawMapboxToken),
} as const;
