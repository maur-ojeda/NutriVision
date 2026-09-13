import { useState, useEffect } from 'react';
import { supabase, handleAuthError } from '@/lib/supabase';
import { isExpiredLinkError, isRateLimitError } from '@/lib/auth';
import type { User, Session } from '@/lib/types';

// Sistema de prevención de rate limit usando localStorage
const MAGIC_LINK_REQUEST_KEY = 'magic_link_request_time';
const RATE_LIMIT_COOLDOWN = 300000; // 5 minutos en milisegundos

const canRequestMagicLink = (): boolean => {
  const lastRequestTime = localStorage.getItem(MAGIC_LINK_REQUEST_KEY);
  if (!lastRequestTime) return true;
  
  const timeSinceLastRequest = Date.now() - parseInt(lastRequestTime);
  return timeSinceLastRequest > RATE_LIMIT_COOLDOWN;
};

const recordMagicLinkRequest = (): void => {
  localStorage.setItem(MAGIC_LINK_REQUEST_KEY, Date.now().toString());
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

  useEffect(() => {
    // Verificar si hay un periodo de cooldown activo
    const checkRateLimit = () => {
      if (!canRequestMagicLink()) {
        setIsRateLimited(true);
        const lastRequestTime = localStorage.getItem(MAGIC_LINK_REQUEST_KEY);
        if (lastRequestTime) {
          const timeSinceLastRequest = Date.now() - parseInt(lastRequestTime);
          const remainingTime = Math.max(0, RATE_LIMIT_COOLDOWN - timeSinceLastRequest);
          const minutesRemaining = Math.ceil(remainingTime / 60000);
          setRateLimitCooldown(minutesRemaining);
        }
      } else {
        setIsRateLimited(false);
        setRateLimitCooldown(0);
      }
    };

    checkRateLimit();
    
    // Actualizar estado de rate limit cada segundo
    const intervalId = setInterval(checkRateLimit, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    console.log('useAuth: Iniciando detección de sesión...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('useAuth: Sesión inicial:', { session, error });
      
      if (error) {
        console.error('Error getting session:', error);
        
        // No propagar errores de rate limit para prevenir múltiples intentos
        if (isRateLimitError(error)) {
          console.log('useAuth: Error de rate limit detectado, no propagando error');
          return;
        }
        
        // No mostramos errores de enlace expirado aquí, ya que es normal cuando un usuario
        // llega sin haber iniciado sesión correctamente
        if (!isExpiredLinkError(error)) {
          setError(handleAuthError(error));
        }
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('useAuth: Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN') {
        console.log('useAuth: Usuario autenticado:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        // Limpiar cualquier error previo al inicio de sesión exitoso
        setError(null);
        setIsRateLimited(false);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('useAuth: Usuario desconectado');
        setSession(null);
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('useAuth: Token actualizado');
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === 'USER_UPDATED') {
        console.log('useAuth: Usuario actualizado');
        setSession(session);
        setUser(session?.user ?? null);
      }
      // Para otros eventos, actualizamos la sesión
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('useAuth: Limpiando suscripción');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string) => {
    // Verificar si está en cooldown por rate limit
    if (isRateLimited) {
      console.log('useAuth: Intento de magic link bloqueado por rate limit');
      const minutesRemaining = rateLimitCooldown;
      setError(`Has excedido el límite de solicitudes. Por favor, espera ${minutesRemaining} minuto${minutesRemaining !== 1 ? 's' : ''} antes de intentar nuevamente.`);
      throw new Error('Rate limit exceeded');
    }
    
    setLoading(true);
    setError(null);
    
    // Registrar este intento para prevenir múltiples solicitudes
    recordMagicLinkRequest();

    try {
      console.log('useAuth: Enviando magic link a:', email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      
      if (error) {
        console.error('useAuth: Error enviando magic link:', error);
        
        // Usar nuestro manejador de errores para mensajes más amigables
        const errorMessage = handleAuthError(error);
        
        // Si es un error de rate limit, activar el estado de rate limit
        if (errorMessage.includes('rate limit') || errorMessage.includes('solicitudes')) {
          console.log('useAuth: Activando estado de rate limit');
          setIsRateLimited(true);
        }
        
        setError(errorMessage);
        throw error;
      }

      // Success - show message that user should check their email
      setError('Magic Link enviado! Revisa tu email en 1 minuto y haz click en el link.');
    } catch (err) {
      console.error('useAuth: Error inesperado en signIn:', err);
      const errorMessage = handleAuthError(err);
      
      // Si es un error de rate limit, activar el estado de rate limit
      if (errorMessage.includes('rate limit') || errorMessage.includes('solicitudes')) {
        console.log('useAuth: Activando estado de rate limit desde catch');
        setIsRateLimited(true);
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    isRateLimited,
    rateLimitCooldown,
  };
}
