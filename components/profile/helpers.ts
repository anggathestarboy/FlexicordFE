import { Role, BadgeTier } from "./types";

const STORAGE_BASE = "https://pegaduanmasyarakat.alwaysdata.net/storage/";

// Helper to construct avatar image source URLs
export function avatarSrc(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STORAGE_BASE}${url}`;
}

// Formats an ISO date string into day short-month year format
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Formats an ISO date string into long-month year format
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

// Formats an ISO date string into full day-of-week long format
export function formatDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Selects the highest priority role from a list of user roles
export function primaryRole(roles: Role[]): string {
  const priority = ["admin", "moderator", "user"];
  for (const p of priority) {
    const found = roles.find((r) => r.name === p);
    if (found) return found.name;
  }
  return roles[0]?.name ?? "member";
}

// Returns appropriate tailwind class style based on user role
export function roleBadgeStyle(role: string): string {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
    case "moderator":
      return "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400";
    default:
      return "bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20";
  }
}

// Returns appropriate color code based on badge tier
export function tierColor(tier: BadgeTier): string {
  switch (tier) {
    case "gold":
      return "#f59e0b";
    case "silver":
      return "#94a3b8";
    case "platinum":
      return "#8b5cf6";
    default:
      return "#b45309";
  }
}
