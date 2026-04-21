import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}
