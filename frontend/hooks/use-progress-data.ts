"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useProgressData() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: api.getProgress,
  });
}
