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
  calorie_goal: number | null;
  protein_goal: number | null;
  fat_goal: number | null;
  carbs_goal: number | null;
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
  equipment: string | null;
  muscle_groups: MuscleGroup[];
};

export type SetData = {
  id: number;
  reps: number;
  weight: number | null;
  duration: number | null;
};

export type WorkoutSessionExercise = {
  id: number;
  exercise: Exercise;
  order: number;
  sets: SetData[];
};

export type WorkoutSession = {
  id: number;
  started_at: string;
  finished_at: string | null;
  duration: number | null;
  comment: string;
  exercises: WorkoutSessionExercise[];
};

// ─── Workout Day Detail ─────────────────────────────────────────────────────

export type WorkoutDayExercise = {
  exercise: { id: number; name: string; muscle_groups: MuscleGroup[] };
  sets: { reps: number; weight: number | null; duration: number | null }[];
  total_sets: number;
  best_set: { reps: number; weight: number | null } | null;
};

export type WorkoutDayProgress = {
  exercise_name: string;
  current_best: { reps: number; weight: number | null };
  previous_best: { reps: number; weight: number | null } | null;
  delta_weight: number;
  delta_reps: number;
};

export type WorkoutDayRecord = {
  exercise_name: string;
  type: "weight" | "reps";
  value: number;
  reps: number;
};

export type WorkoutDayDetail = {
  date: string;
  summary: {
    duration: number;
    exercises_count: number;
    total_sets: number;
    total_reps: number;
    total_tonnage: number;
  };
  exercises: WorkoutDayExercise[];
  progress: WorkoutDayProgress[];
  muscle_load: { muscle: string; sets_count: number }[];
  records: WorkoutDayRecord[];
};

// ─── Nutrition ───────────────────────────────────────────────────────────────

export type FoodEntry = {
  id: number;
  food_name: string;
  grams: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  logged_at: string;
};

// ─── Nutrition Day Detail ───────────────────────────────────────────────────

export type NutritionGoals = {
  calories: number | null;
  protein: number | null;
  fats: number | null;
  carbs: number | null;
};

export type NutritionDayDetail = {
  date: string;
  totals: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
  goals: NutritionGoals | null;
  entries: FoodEntry[];
};

// ─── Measurements ────────────────────────────────────────────────────────────

export type BodyMeasurement = {
  id: number;
  date: string;
  weight: number;
  waist: number | null;
  chest: number | null;
  hips: number | null;
};

// ─── Nutrition Heatmap ───────────────────────────────────────────────────────

export type NutritionHeatmapDay = {
  date: string;
  count: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
};

// ─── Heatmap ─────────────────────────────────────────────────────────────────

export type HeatmapSession = {
  id: number;
  duration: number | null;
  exercises_count: number;
};

export type HeatmapDay = {
  date: string;
  count: number;
  volume: number;
  sessions: HeatmapSession[];
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type DashboardPayload = {
  calories: { current: number; goal: number };
  workoutStatus: { completed: number; total: number };
  weight: { current: number; delta: number };
  latestMeasurement: { chest: number | null; waist: number | null; hips: number | null } | null;
  weightChart: Array<{ label: string; value: number }>;
  workoutActivity: Array<{ label: string; value: number }>;
  recentWorkouts: WorkoutSession[];
  recentMeals: FoodEntry[];
};
