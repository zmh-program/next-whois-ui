import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEnter(e: React.KeyboardEvent) {
  // compatible with MacOS
  return e.key === "Enter" && e.keyCode !== 229;
}

async function copyClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return await navigator.clipboard.writeText(text);
  }

  const el = document.createElement("textarea");
  el.value = text;
  // android may require editable
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.focus();
  el.select();
  el.setSelectionRange(0, text.length);
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function useClipboard() {
  /**
   * Use clipboard
   * @example
   * const copy = useClipboard();
   * copy("Hello world!");
   */

  return async (text: string) => {
    try {
      await copyClipboard(text);
      toast("Copied!");
    } catch (e) {
      console.error(e);

      const err = e as Error;
      toast(`Failed to copy: ${err.message}`);
    }
  };
}

export function toSearchURI(query: string) {
  const q = query.trim();
  return q ? `/${encodeURIComponent(q)}` : "/";
}

export function toReadableISODate(date: string) {
  return date.replace("T", " ").replace("Z", "").replace(".000", "");
}

export function filterRepeat<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function includeArgs(from: string, ...args: string[]): boolean {
  return args.some((arg) => from.toLowerCase().includes(arg.toLowerCase()));
}
