import { createClient } from '@supabase/supabase-js';
import { getAppUrl, handleMagicLinkError } from './auth';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Helper function para manejar errores de autenticación
export function handleAuthError(error: any): string {
  return handleMagicLinkError(error);
}

// Helper para procesar el token de la URL cuando llega desde el magic link
export async function handleMagicLinkCallback(): Promise<{ success: boolean; error?: string }> {
  try {
    // Dar tiempo a Supabase para procesar los tokens de la URL
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Obtener la sesión (Supabase debería haberla procesado desde la URL)
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Estado de sesión después de procesar:', { data, error });
    
    if (error) {
      console.error('Error obteniendo sesión:', error);
      return { success: false, error: handleMagicLinkError(error) };
    }
    
    if (data.session) {
      console.log('Sesión establecida correctamente:', data.session.user?.email);
      return { success: true };
    }
    
    // Si no hay sesión, intentar verificar si hay tokens en la URL
    const urlParams = new URLSearchParams(window.location.hash);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken || refreshToken) {
      console.log('Tokens encontrados en URL, pero sesión no establecida aún');
      return { success: false, error: 'Procesando sesión... por favor espera' };
    }
    
    return { success: false, error: 'No se encontró una sesión válida. Por favor, intenta nuevamente.' };
  } catch (error) {
    console.error('Error inesperado en callback:', error);
    return { success: false, error: handleMagicLinkError(error) };
  }
}
