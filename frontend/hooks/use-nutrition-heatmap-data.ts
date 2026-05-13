import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useNutritionHeatmapData(year?: number) {
  return useQuery({
    queryKey: ["nutrition-heatmap", year],
    queryFn: () => api.getNutritionHeatmap(year),
  });
}
