import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Meal, User } from '@/lib/types';

interface MealsState {
  meals: Meal[];
  loading: boolean;
  error: string | null;
  addMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useMeals(user?: User | null): MealsState {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial meals on mount
  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  // Real-time subscription to meals changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to INSERT events on the meals table
    const subscription = supabase
      .channel('meals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time meal change:', payload);
          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                setMeals((prev) => {
                  // Check if the meal already exists to avoid duplicates
                  const exists = prev.some(m => m.id === payload.new.id);
                  if (exists) return prev;
                  return [payload.new as Meal, ...prev];
                });
              }
              break;
            case 'UPDATE':
              if (payload.new) {
                setMeals((prev) =>
                  prev.map((meal) =>
                    meal.id === payload.new.id ? (payload.new as Meal) : meal
                  )
                );
              }
              break;
            case 'DELETE':
              if (payload.old) {
                setMeals((prev) => prev.filter((meal) => meal.id !== payload.old.id));
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to meals changes');
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Fetch meals function
  const fetchMeals = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Últimos 7 días por ahora

      if (error) {
        throw error;
      }

      if (data) {
        setMeals(data);
      } else {
        setMeals([]);
        setError('No se encontraron comidas');
      }
    } catch (err) {
      console.error('Error al cargar comidas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar comidas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add meal function
  const addMeal = async (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      // Insertar en Supabase con user_id del usuario autenticado
      const { data, error } = await supabase
        .from('meals')
        .insert([{
          user_id: user.id,
          ...meal,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        setError('Error al guardar comida: ' + error.message);
        throw error;
      }

      if (data) {
        setMeals((prev) => [data, ...prev]);
      }
    } catch (err) {
      console.error('Error al guardar comida:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar comida');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refetch function (reload de datos)
  const refetch = async () => {
    await fetchMeals();
  };

  return {
    meals,
    loading,
    error,
    addMeal,
    refetch,
  };
}
