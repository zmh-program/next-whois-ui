import { HISTORY_LIMIT } from "@/lib/env";

export function listHistory(): string[] {
  const history = localStorage.getItem("history");
  if (!history || history === "[]") return [];

  const parsed = JSON.parse(history);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item: any) => typeof item === "string")
    .map((item: string) => item.trim())
    .filter((item: string) => item.length > 0);
}

export function addHistory(query: string) {
  if (!query || query.length === 0) return;

  let history = listHistory();
  const domain = query.trim();

  if (history.includes(domain)) {
    // if the domain is already in the history, remove it first
    history = history.filter((item) => item !== domain);
  }

  history = [domain, ...history].slice(0, HISTORY_LIMIT);
  localStorage.setItem("history", JSON.stringify(history));
}

export function removeHistory(query: string) {
  if (!query || query.length === 0) return;

  let history = listHistory();
  const domain = query.trim();

  if (!history.includes(domain)) return;

  history = history.filter((item) => item !== domain);
  localStorage.setItem("history", JSON.stringify(history));
}
