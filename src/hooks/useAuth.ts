import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useAuth: Iniciando detección de sesión...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Error getting session:', error);
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
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
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

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (err) {
      if (!error) setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        throw error;
      }
    } catch (err) {
      if (!error) setError(err instanceof Error ? err.message : 'Error al registrarse');
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
    signUp,
    signOut,
  };
}
