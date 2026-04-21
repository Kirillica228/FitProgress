import {
  articles,
  dashboardPayload,
  goals,
  measurements,
  nutritionDiary,
  workouts,
} from "@/lib/mock-data";

function delay<T>(payload: T, timeout = 400): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(payload), timeout);
  });
}

export const api = {
  getDashboard: () => delay(dashboardPayload),
  getWorkouts: () => delay(workouts),
  getNutrition: () => delay(nutritionDiary),
  getProgress: () => delay(measurements),
  getGoals: () => delay(goals),
  getArticles: () => delay(articles),
  getArticleBySlug: async (slug: string) => {
    const article = articles.find((item) => item.slug === slug) ?? null;
    return delay(article);
  },
};
