/**
 * Cross-App URL resolver for Main Application -> Landing Page.
 *
 * Automatically detects whether the application is running on port 3000 or 3001,
 * directing cross-app requests to the counterpart port in development, or using
 * NEXT_PUBLIC_LANDING_URL in production.
 */
export function getLandingUrl(): string {
  if (typeof window !== "undefined") {
    // If an explicit override is configured, use it
    if (process.env.NEXT_PUBLIC_LANDING_URL) {
      return process.env.NEXT_PUBLIC_LANDING_URL;
    }
    const port = window.location.port;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // If Main App is on 3001, Landing Page is on 3000
    if (port === "3001") {
      return `${protocol}//${hostname}:3000`;
    }
    // If Main App is on 3000, Landing Page is on 3001
    if (port === "3000") {
      return `${protocol}//${hostname}:3001`;
    }
    // Any other port: default to 3001 in dev
    return `${protocol}//${hostname}:3001`;
  }

  // SSR fallback
  return process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3001";
}
