// ─── Auth ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  vk_id: number | null;
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export type Profile = {
  id: number;
  username: string;
  email: string;
  vk_id: number | null;
  first_name: string;
  last_name: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  goal: string;
  extra_goal: string;
};

// ─── Muscle Groups ───────────────────────────────────────────────────────────

export type MuscleGroup = {
  id: number;
  name: string;
  slug: string;
};

// ─── Workouts ────────────────────────────────────────────────────────────────

export type Exercise = {
  id: number;
  name: string;
  part_body: string;
  equipment: string;
  main_muscles: string;
  accessory_muscles: string;
  muscle_groups: MuscleGroup[];
};

export type WorkoutExercise = {
  id: number;
  exercise: Exercise;
  sets: number;
  reps: number;
  order: number;
};

export type Workout = {
  id: number;
  /** Бэкенд отдаёт оба поля: name и title (алиас) */
  name: string;
  title: string;
  type: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  exercises: WorkoutExercise[];
};

export type WorkoutSession = {
  id: number;
  workout: Workout;
  /** Алиас created_at → started_at (задаётся в сериализаторе) */
  started_at: string;
  /** Вычисляется из created_at + duration, null если duration не задан */
  finished_at: string | null;
  duration: number | null;
  comment: string;
};

// ─── Nutrition ───────────────────────────────────────────────────────────────

export type FoodEntry = {
  id: number;
  food_name: string;
  calories: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  /** Алиас created_at → logged_at (задаётся в сериализаторе) */
  logged_at: string;
};

// ─── Measurements ────────────────────────────────────────────────────────────

export type BodyMeasurement = {
  id: number;
  /** Алиас created_at.date() → date (задаётся в сериализаторе) */
  date: string;
  weight: number;
  waist: number | null;
  chest: number | null;
  hips: number | null;
};

// ─── Nutrition Heatmap ───────────────────────────────────────────────────────

export type NutritionHeatmapDay = {
  /** ISO date string: "2025-03-15" */
  date: string;
  /** Количество записей питания за день */
  count: number;
  /** Суммарные калории за день */
  calories: number;
};

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export type HeatmapSession = {
  id: number;
  workout_name: string;
  workout_type: string;
  duration: number | null;
  exercises_count: number;
};

export type HeatmapDay = {
  /** ISO date string: "2025-03-15" */
  date: string;
  /** Количество сессий в этот день */
  count: number;
  /** Объём нагрузки (reps×weight для силовых, duration×10 для кардио) */
  volume: number;
  sessions: HeatmapSession[];
};

// ─── Articles ────────────────────────────────────────────────────────────────

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  /** ISO date string: "2026-04-12" */
  publishedAt: string;
  readTime: string;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type DashboardPayload = {
  calories: { current: number; goal: number };
  workoutStatus: { completed: number; total: number };
  weight: { current: number; delta: number };
  /** Последний замер тела (для отображения метрик на дашборде) */
  latestMeasurement: { chest: number | null; waist: number | null; hips: number | null } | null;
  weightChart: Array<{ label: string; value: number }>;
  workoutActivity: Array<{ label: string; value: number }>;
  recentWorkouts: WorkoutSession[];
  recentMeals: FoodEntry[];
};
