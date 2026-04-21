"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useArticlesData() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: api.getArticles,
  });
}
