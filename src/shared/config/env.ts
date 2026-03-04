export const DEFAULT_API_BASE_URL = "/api/v1";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);
