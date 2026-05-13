"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BodyMeasurement } from "@/lib/types";

export function useProgressData() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: api.getProgress,
    staleTime: 0,
  });
}

export function useCreateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<BodyMeasurement, "id">) =>
      api.createMeasurement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
