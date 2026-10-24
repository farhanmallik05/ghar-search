/**
 * Cross-App URL resolver for Landing Page -> Main Application.
 *
 * Automatically detects whether the landing page is running on port 3000 or 3001,
 * directing cross-app requests to the counterpart port in development, or using
 * NEXT_PUBLIC_APP_URL in production.
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    // If an explicit override is configured, use it
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    const port = window.location.port;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // If Landing Page is on 3000, Main App is on 3001
    if (port === "3000") {
      return `${protocol}//${hostname}:3001`;
    }
    // If Landing Page is on 3001, Main App is on 3000
    if (port === "3001") {
      return `${protocol}//${hostname}:3000`;
    }
    // Any other port: default to 3000 in dev
    return `${protocol}//${hostname}:3000`;
  }

  // SSR fallback
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
