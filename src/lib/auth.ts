/**
 * Helper para manejar la autenticación y redirecciones de Magic Links
 */

// Obtener la URL base actual (para desarrollo y producción)
export const getAppUrl = (): string => {
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL;
  }
  
  // Fallback a la URL actual en el navegador
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Default para desarrollo
  return 'http://localhost:3000';
};

// Manejar errores de autenticación específicos de Magic Links
export const handleMagicLinkError = (error: any): string => {
  console.error('Magic Link error:', error);
  
  if (!error) {
    return 'Ocurrió un error desconocido.';
  }
  
  // Errores específicos de Supabase Auth
  switch (error.code) {
    case 'otp_expired':
    case 'token_expired':
      return 'El enlace de magik link ha expirado. Los enlaces son válidos por 1 hora. Por favor, solicita un nuevo enlace.';
      
    case 'access_denied':
      return 'Acceso denegado. Por favor, verifica que estás usando el enlace correcto.';
      
    case 'invalid_link':
      return 'El enlace no es válido o ha sido usado previamente.';
      
    case 'user_not_found':
      return 'No existe una cuenta con este email. Por favor, regístrate primero.';
      
    case 'too_many_requests':
      return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.';
      
    default:
      // Mensaje genérico con el error original si no es reconocido
      return error.message || 'Ocurrió un error durante la autenticación. Por favor, intenta de nuevo.';
  }
};

// Validar si un error es de enlace expirado
export const isExpiredLinkError = (error: any): boolean => {
  return error?.code === 'otp_expired' || 
         error?.code === 'token_expired' ||
         error?.message?.includes('expired') ||
         error?.message?.includes('expirado');
};

// Formatear tiempo restante para mostrar al usuario
export const formatTimeRemaining = (expiresAt: Date | string): string => {
  const expirationTime = new Date(expiresAt);
  const now = new Date();
  const diffMs = expirationTime.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'ha expirado';
  }
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffHours > 0) {
    return `quedan ${diffHours} hora${diffHours > 1 ? 's' : ''} y ${diffMins % 60} minutos`;
  }
  
  return `quedan ${diffMins} minutos`;
};