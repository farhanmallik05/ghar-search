/**
 * Authentication & Session Management for Ghar Search.
 * Supports Cross-Origin cookie & query-string synchronization between Landing Page and Main App.
 */

export type UserRole = "homebuyer" | "underwriter" | "broker";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatar: string;
  badge: string;
  bio?: string;
  token: string;
  createdAt: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: "usr_demo_homebuyer",
    name: "Rohit Sharma",
    email: "rohit.sharma@gmail.com",
    role: "homebuyer",
    organization: "Individual Homebuyer • Pune Market",
    avatar: "RS",
    badge: "Homebuyer",
    bio: "Evaluating residential flats against MahaRERA disclosures, possession timelines, and OC certificates.",
    token: "ghar_jwt_demo_token_rohit_2026",
    createdAt: "2026-10-24T00:00:00Z",
  },
  {
    id: "usr_demo_underwriter",
    name: "Priya Nair",
    email: "priya.nair@hdfcbank.com",
    role: "underwriter",
    organization: "HDFC Bank Mortgage Risk & Underwriting",
    avatar: "PN",
    badge: "Senior Underwriter",
    bio: "Reviewing bulk portfolio risks, NCLT insolvency scans, and statutory Section 7 notices for retail housing loans.",
    token: "ghar_jwt_demo_token_priya_2026",
    createdAt: "2026-10-24T00:00:00Z",
  },
  {
    id: "usr_demo_broker",
    name: "Vikram Singhania",
    email: "vikram@singhania-law.in",
    role: "broker",
    organization: "Singhania & Partners • RERA Legal Advisory",
    avatar: "VS",
    badge: "RERA Legal Counsel",
    bio: "Conducting title due diligence, municipal sanction audits, and eCourts encumbrance checks.",
    token: "ghar_jwt_demo_token_vikram_2026",
    createdAt: "2026-10-24T00:00:00Z",
  },
];

const AUTH_STORAGE_KEY = "ghar_auth_user";
const AUTH_COOKIE_NAME = "ghar_auth_user";

/**
 * Retrieves the currently logged-in user profile from localStorage or cookies.
 */
export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try LocalStorage
    const rawLocal = localStorage.getItem(AUTH_STORAGE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && parsed.email && parsed.name) {
        return parsed as UserProfile;
      }
    }

    // 2. Fallback to Cookie
    const match = document.cookie.match(
      new RegExp("(^|;\\s*)" + AUTH_COOKIE_NAME + "=([^;]*)")
    );
    if (match && match[2]) {
      const decoded = decodeURIComponent(match[2]);
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.email && parsed.name) {
        // Hydrate localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        return parsed as UserProfile;
      }
    }
  } catch (err) {
    console.error("Failed to parse stored auth user:", err);
  }

  return null;
}

/**
 * Persists user session across localStorage and root domain cookies.
 */
export function setStoredUser(user: UserProfile): void {
  if (typeof window === "undefined") return;

  try {
    const serialized = JSON.stringify(user);
    localStorage.setItem(AUTH_STORAGE_KEY, serialized);

    // Set cookie across localhost ports (path=/ and 7 days lifetime)
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
      serialized
    )}; path=/; max-age=604800; SameSite=Lax`;

    // Dispatch custom event so listeners update immediately
    window.dispatchEvent(new Event("ghar_auth_change"));
  } catch (err) {
    console.error("Failed to persist user session:", err);
  }
}

/**
 * Removes user session.
 */
export function clearStoredUser(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    window.dispatchEvent(new Event("ghar_auth_change"));
  } catch (err) {
    console.error("Failed to clear user session:", err);
  }
}

/**
 * Builds an cross-app launch URL that seamlessly transmits the user session to the Main App.
 */
export function buildAppLaunchUrl(targetBaseUrl: string, user?: UserProfile | null): string {
  try {
    const url = new URL(targetBaseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    url.searchParams.set("from", "landing");

    const activeUser = user || getStoredUser();
    if (activeUser) {
      url.searchParams.set("auth_user", JSON.stringify(activeUser));
    }

    return url.toString();
  } catch {
    const activeUser = user || getStoredUser();
    const query = activeUser ? `?from=landing&auth_user=${encodeURIComponent(JSON.stringify(activeUser))}` : "?from=landing";
    return `${targetBaseUrl}${query}`;
  }
}
