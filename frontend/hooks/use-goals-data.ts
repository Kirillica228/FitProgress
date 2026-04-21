"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useGoalsData() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: api.getGoals,
  });
}
