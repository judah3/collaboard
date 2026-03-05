export const DEFAULT_API_BASE_PATH = "/api/v1";

const normalizeSegment = (value: string) => value.replace(/\/+$/, "");
const normalizeOrigin = (value: string) => normalizeSegment(value.trim());
const normalizePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return normalizeSegment(withLeadingSlash);
};

const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiOrigin = import.meta.env.VITE_API_ORIGIN?.trim();
const apiBasePath = import.meta.env.VITE_API_BASE_PATH?.trim() ?? DEFAULT_API_BASE_PATH;

export const API_BASE_URL = apiOrigin
  ? `${normalizeOrigin(apiOrigin)}${normalizePath(apiBasePath)}`
  : explicitBaseUrl
    ? normalizeSegment(explicitBaseUrl)
    : normalizePath(DEFAULT_API_BASE_PATH);
