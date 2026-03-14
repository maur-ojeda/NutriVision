import type { Meal, Macros } from './types';

/**
 * Formatea una fecha a un formato amigable para usuarios
 * @param date - Fecha ISO string o Date object
 * @returns Fecha formateada en español
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('es-ES', options).format(d);
}

/**
 * Calcula el total de calorías de un array de meals
 * @param meals - Array de meals
 * @returns Total de calorías
 */
export function calculateTotalCalories(meals: Meal[]): number {
  return meals.reduce((total, meal) => total + meal.calories, 0);
}

/**
 * Calcula los promedios de macros por día
 * @param meals - Array de meals
 * @returns Objeto con promedios de protein, carbs, fat
 */
export function calculateDailyAverages(meals: Meal[]): {
  protein: number;
  carbs: number;
  fat: number;
} {
  if (meals.length === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const meal of meals) {
    totalProtein += meal.macros.protein;
    totalCarbs += meal.macros.carbs;
    totalFat += meal.macros.fat;
  }

  const avg = totalProtein / (meals.length || 1);

  return {
    protein: parseFloat(avg.toFixed(1)),
    carbs: parseFloat((totalCarbs / (meals.length || 1)).toFixed(1)),
    fat: parseFloat((totalFat / (meals.length || 1)).toFixed(1)),
  };
}

/**
 * Formatea los macros para mostrar en UI
 * @param macros - Objeto Macros
 * @returns String formateada: "Proteína: 20g, Carbohidratos: 30g, Grasa: 10g"
 */
export function formatMacros(macros: Macros): string {
  return `Proteína: ${macros.protein}g, Carbohidratos: ${macros.carbs}g, Grasa: ${macros.fat}g`;
}

/**
 * Calcula el procentaje de cumplimiento del objetivo calórico
 * @param calories - Calorías consumidas
 * @param goal - Objetivo calórico (default 2000)
 * @returns Porcentaje (0-100)
 */
export function calculateCaloriePercentage(calories: number, goal: number = 2000): number {
  const percentage = Math.round((calories / goal) * 100);
  return Math.min(percentage, 100); // Cap at 100%
}

/**
 * Agrupa meals por fecha para el dashboard
 * @param meals - Array de meals
 * @returns Objeto con meals agrupados por fecha
 */
export function groupMealsByDate(meals: Meal[]): Record<string, Meal[]> {
  return meals.reduce((acc, meal) => {
    const dateKey = new Date(meal.created_at).toLocaleDateString('es-ES');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);
}

/**
 * Valida un correo electrónico con regex simple
 * @param email - Email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formatea un error para mostrar en UI
 * @param error - Error object o string
 * @returns Mensaje de error formateado
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Error desconocido';
}
