"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FoodEntry } from "@/lib/types";

export function useNutritionData() {
  return useQuery({
    queryKey: ["nutrition"],
    queryFn: api.getNutrition,
    staleTime: 30_000,
  });
}

export function useCreateFoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<FoodEntry, "id" | "logged_at">) =>
      api.createFoodEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteFoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteFoodEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
