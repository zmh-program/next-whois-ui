export const VERSION = "0.3.0";

export const HISTORY_LIMIT: number = intEnv("NEXT_PUBLIC_HISTORY_LIMIT", 6);
// The maximum number of history items to keep in the local storage

export const MAX_WHOIS_FOLLOW = intEnv("NEXT_PUBLIC_MAX_WHOIS_FOLLOW", 0);
export const MAX_IP_WHOIS_FOLLOW = intEnv("NEXT_PUBLIC_MAX_IP_WHOIS_FOLLOW", 5);

// The maximum number of detailed results to follow
// Set 0: Where possible don't follow the detailed results to improve efficiency
// And follow 0 can solve the problem of `whois.dnspod.com connection refused`

function intEnv(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;

  const parsed = parseInt(value);
  if (isNaN(parsed)) return defaultValue;

  return parsed;
}

export function strEnv(name: string, defaultValue?: string): string {
  return process.env[name] || defaultValue || "";
}
