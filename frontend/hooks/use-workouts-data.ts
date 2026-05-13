"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useWorkoutsData() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: api.getWorkouts,
    staleTime: 30_000,
  });
}
