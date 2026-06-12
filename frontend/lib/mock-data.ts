export type WorkoutCard = {
  id: string;
  title: string;
  date: string;
  exercises: number;
  volume: string;
  type: string;
};

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type MealGroup = {
  title: string;
  items: Meal[];
};

export type Measurement = {
  date: string;
  weight: number;
  waist: number;
  chest: number;
};

export type DashboardPayload = {
  calories: { current: number; goal: number };
  workoutStatus: { completed: number; total: number };
  weight: { current: number; delta: number };
  weightChart: Array<{ label: string; value: number }>;
  workoutActivity: Array<{ label: string; value: number }>;
  recentWorkouts: WorkoutCard[];
  recentMeals: Meal[];
};

export const dashboardPayload: DashboardPayload = {
  calories: { current: 1840, goal: 2200 },
  workoutStatus: { completed: 4, total: 6 },
  weight: { current: 78.4, delta: -1.2 },
  weightChart: [
    { label: "Mon", value: 80.1 },
    { label: "Tue", value: 79.6 },
    { label: "Wed", value: 79.2 },
    { label: "Thu", value: 78.8 },
    { label: "Fri", value: 78.6 },
    { label: "Sat", value: 78.5 },
    { label: "Sun", value: 78.4 },
  ],
  workoutActivity: [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 0 },
    { label: "Wed", value: 1 },
    { label: "Thu", value: 1 },
    { label: "Fri", value: 0 },
    { label: "Sat", value: 1 },
    { label: "Sun", value: 1 },
  ],
  recentWorkouts: [
    { id: "w1", title: "Upper Strength", date: "Apr 21", exercises: 6, volume: "4,200 kg", type: "Strength" },
    { id: "w2", title: "Tempo Run", date: "Apr 20", exercises: 4, volume: "32 min", type: "Cardio" },
    { id: "w3", title: "Mobility Reset", date: "Apr 18", exercises: 8, volume: "24 min", type: "Stretching" },
  ],
  recentMeals: [
    { id: "m1", name: "Chicken Bowl", calories: 620, protein: 42, fat: 18, carbs: 56 },
    { id: "m2", name: "Greek Yogurt", calories: 230, protein: 18, fat: 5, carbs: 21 },
    { id: "m3", name: "Salmon & Rice", calories: 710, protein: 48, fat: 22, carbs: 61 },
  ],
};

export const workouts: WorkoutCard[] = [
  { id: "w1", title: "Upper Strength", date: "2026-04-21", exercises: 6, volume: "4,200 kg", type: "Strength" },
  { id: "w2", title: "Lower Focus", date: "2026-04-19", exercises: 7, volume: "5,100 kg", type: "Strength" },
  { id: "w3", title: "Tempo Run", date: "2026-04-18", exercises: 4, volume: "32 min", type: "Cardio" },
  { id: "w4", title: "Mobility Reset", date: "2026-04-16", exercises: 8, volume: "24 min", type: "Stretching" },
];

export const nutritionDiary: MealGroup[] = [
  {
    title: "Breakfast",
    items: [
      { id: "b1", name: "Oats with berries", calories: 390, protein: 18, fat: 9, carbs: 58 },
      { id: "b2", name: "Egg white omelette", calories: 220, protein: 26, fat: 7, carbs: 8 },
    ],
  },
  {
    title: "Lunch",
    items: [
      { id: "l1", name: "Chicken rice bowl", calories: 640, protein: 43, fat: 16, carbs: 71 },
    ],
  },
  {
    title: "Dinner",
    items: [
      { id: "d1", name: "Salmon, potatoes, greens", calories: 710, protein: 47, fat: 22, carbs: 58 },
    ],
  },
];

export const measurements: Measurement[] = [
  { date: "2026-03-21", weight: 82.1, waist: 89, chest: 102 },
  { date: "2026-03-28", weight: 81.2, waist: 88, chest: 101 },
  { date: "2026-04-04", weight: 80.4, waist: 87, chest: 101 },
  { date: "2026-04-11", weight: 79.3, waist: 86, chest: 100 },
  { date: "2026-04-18", weight: 78.7, waist: 85, chest: 100 },
  { date: "2026-04-21", weight: 78.4, waist: 84, chest: 99 },
];

