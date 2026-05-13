"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useHeatmapData(year?: number) {
  return useQuery({
    queryKey: ["heatmap", year ?? new Date().getFullYear()],
    queryFn: () => api.getWorkoutHeatmap(year),
    staleTime: 60_000,
  });
}
