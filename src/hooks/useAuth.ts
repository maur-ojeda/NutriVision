import { useState, useEffect } from 'react';
import { supabase, handleAuthError } from '@/lib/supabase';
import { isExpiredLinkError } from '@/lib/auth';
import type { User, Session } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
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
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN') {
        setSession(session);
        setUser(session?.user ?? null);
        // Limpiar cualquier error previo al inicio de sesión exitoso
        setError(null);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
      // Para otros eventos, actualizamos la sesión
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        // Usar nuestro manejador de errores para mensajes más amigables
        const errorMessage = handleAuthError(error);
        setError(errorMessage);
        throw error;
      }

      // Success - show message that user should check their email
      setError('Magic Link enviado! Revisa tu email en 1 minuto y haz click en el link.');
    } catch (err) {
      const errorMessage = handleAuthError(err);
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
  };
}
