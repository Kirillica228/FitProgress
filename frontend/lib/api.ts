/**
 * Client-side API layer.
 *
 * Все запросы идут напрямую на DRF бэкенд с credentials: "include".
 * Бэкенд сам читает httpOnly cookie fp_access через CookieJWTAuthentication.
 * Никакого прокси и Bearer-заголовков на фронте не нужно.
 */

import type {
  Article,
  AuthUser,
  BodyMeasurement,
  DashboardPayload,
  FoodEntry,
  NutritionHeatmapDay,
  HeatmapDay,
  Profile,
  WorkoutSession,
} from "@/lib/types";

// ─── Config ──────────────────────────────────────────────────────────────────

const BACKEND =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL ?? "http://localhost:8000")
    : (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000");

// ─── Base request ────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" && body !== null
        ? Object.values(body).flat().join(" ") || `Ошибка ${res.status}`
        : `Ошибка ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    request<{ ok: boolean }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, email: string, password: string) =>
    request<{ ok: boolean }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  logout: () =>
    request<{ ok: boolean }>("/auth/logout/", { method: "POST" }),

  me: () => request<AuthUser>("/auth/me/"),

  refresh: () =>
    request<{ ok: boolean }>("/auth/refresh/", { method: "POST" }),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

async function buildDashboard(): Promise<DashboardPayload> {
  const [sessions, meals, measurements] = await Promise.all([
    request<WorkoutSession[]>("/api/workout-sessions/"),
    request<FoodEntry[]>("/api/food-entries/"),
    request<BodyMeasurement[]>("/api/measurements/"),
  ]);

  // Бэкенд возвращает замеры отсортированными по убыванию (-created_at),
  // поэтому measurements[0] — самый новый, measurements[1] — предыдущий.
  // Дополнительно сортируем по id desc как тай-брейкер (два замера в один день).
  const sorted = [...measurements].sort(
    (a, b) => b.id - a.id,
  );
  const latestWeight = sorted[0]?.weight ?? 0;
  const prevWeight = sorted[1]?.weight ?? latestWeight;

  const today = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.logged_at.startsWith(today));
  const totalCalories = todayMeals.reduce((s, m) => s + m.calories, 0);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = sessions.filter((s) => new Date(s.started_at) >= weekAgo);

  // Для графика берём последние 7 замеров в хронологическом порядке (старые → новые)
  const weightChart = sorted.slice(0, 7).reverse().map((m) => ({
    label: m.date.slice(5),
    value: m.weight,
  }));

  const workoutActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const label = d.toLocaleDateString("ru", { weekday: "short" });
    const dateStr = d.toISOString().slice(0, 10);
    const value = sessions.filter((s) => s.started_at.startsWith(dateStr)).length;
    return { label, value };
  });

  const latest = sorted[0];
  const latestMeasurement = latest
    ? {
        chest: latest.chest ?? null,
        waist: latest.waist ?? null,
        hips: latest.hips ?? null,
      }
    : null;

  return {
    calories: { current: totalCalories, goal: 2200 },
    workoutStatus: { completed: weekSessions.length, total: 6 },
    weight: { current: latestWeight, delta: latestWeight - prevWeight },
    latestMeasurement,
    weightChart,
    workoutActivity,
    recentWorkouts: sessions.slice(0, 5),
    recentMeals: meals.slice(0, 5),
  };
}

// ─── API object ──────────────────────────────────────────────────────────────

export const api = {
  // Dashboard
  getDashboard: () => buildDashboard(),

  // Тренировки
  getWorkouts: () => request<WorkoutSession[]>("/api/workout-sessions/"),
  getWorkoutHeatmap: (year?: number) =>
    request<HeatmapDay[]>(
      `/api/workout-heatmap/${year ? `?year=${year}` : ""}`,
    ),

  // Питание
  getNutrition: () => request<FoodEntry[]>("/api/food-entries/"),
  createFoodEntry: (data: Pick<FoodEntry, "food_name" | "calories" | "meal_type">) =>
    request<FoodEntry>("/api/food-entries/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteFoodEntry: (id: number) =>
    request<void>(`/api/food-entries/${id}/`, { method: "DELETE" }),
  getNutritionHeatmap: (year?: number) =>
    request<NutritionHeatmapDay[]>(
      `/api/nutrition-heatmap/${year ? `?year=${year}` : ""}`,
    ),

  // Замеры
  getProgress: () => request<BodyMeasurement[]>("/api/measurements/"),
  createMeasurement: (data: Omit<BodyMeasurement, "id">) =>
    request<BodyMeasurement>("/api/measurements/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Профиль
  getProfile: () => request<Profile>("/api/profile/"),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>("/api/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  createProfile: (data: Partial<Profile>) =>
    request<Profile>("/api/profile/create/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Статьи (бэкенд)
  getArticles: () => request<Article[]>("/api/articles/"),
  getArticleBySlug: (slug: string) =>
    request<Article>(`/api/articles/${slug}/`).catch(() => null),
};
