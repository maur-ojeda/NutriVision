// App Constants
export const CALORIE_GOAL = 2000;

// API Endpoints (remoto Supabase)
export const API_ENDPOINTS = {
  AUTH: 'https://your-project-ref.supabase.co/auth/v1',
  REST: 'https://your-project-ref.supabase.co/rest/v1',
  STORAGE: 'https://your-project-ref.supabase.co/storage/v1',
  FUNCTIONS: 'https://your-project-ref.supabase.co/functions/v1',
};

// Edge Function Names
export const FUNCTIONS = {
  ANALYZE_FOOD_IMAGE: 'analyze-food-image',
};

// Storage Bucket Names
export const STORAGE_BUCKETS = {
  MEALS_IMAGES: 'meals-images',
};

// Error Messages
export const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Por favor ingresa tu correo electrónico',
  MAGIC_LINK_SENT: 'Magic Link enviado! Revisa tu email en 1 minuto.',
  MAGIC_LINK_EXPIRED: 'Este Magic Link ha expirado. Por favor solicita uno nuevo.',
  AUTH_ERROR: 'Error de autenticación. Por favor intenta nuevamente.',
  CAMERA_PERMISSION_DENIED: 'No tenemos acceso a la cámara. Por favor permite el acceso.',
  IMAGE_ANALYSIS_FAILED: 'Error al analizar la imagen. Por favor intenta nuevamente.',
  MEAL_SAVE_FAILED: 'Error al guardar la comida. Por favor intenta nuevamente.',
} as const;
