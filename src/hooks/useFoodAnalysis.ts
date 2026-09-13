import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Meal, User } from '@/lib/types';
import { useAuth } from './useAuth';

interface AnalysisResult {
  food: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

function isValidAnalysisResult(value: unknown): value is AnalysisResult {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.food !== 'string' || typeof v.calories !== 'number' || !Number.isFinite(v.calories)) {
    return false;
  }
  if (typeof v.macros !== 'object' || v.macros === null) return false;
  const m = v.macros as Record<string, unknown>;
  return ['protein', 'carbs', 'fat'].every((key) => typeof m[key] === 'number' && Number.isFinite(m[key]));
}

export function useFoodAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Obtener usuario autenticado desde useAuth (objeto completo para evitar conflictos)
  const authHook = useAuth();

  const analyzeImage = async (imageUrl: string): Promise<AnalysisResult> => {
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('Analizando imagen:', imageUrl);
      
      // Llamar al Edge Function de Supabase
      const { data, error } = await supabase.functions.invoke('analyze-food-image', {
        body: { image_url: imageUrl },
      });

      if (error) {
        throw error;
      }

      console.log('Análisis completado:', data);

      if (!isValidAnalysisResult(data)) {
        console.error('Respuesta de análisis con formato inesperado:', data);
        throw new Error('La IA devolvió una respuesta con formato inesperado. Intenta de nuevo.');
      }

      return data;

    } catch (err: any) {
      console.error('Error analizando imagen:', err);
      let errorMessage = err.message || 'Error al analizar la imagen';
      if (err.context instanceof Response) {
        try {
          const bodyText = await err.context.text();
          if (bodyText) errorMessage = bodyText;
        } catch {
          // Mantener el mensaje genérico si no se puede leer el body
        }
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveAnalyzedMeal = async (
    foodName: string,
    imageUrl: string,
    analysisResult: AnalysisResult
  ): Promise<void> => {
    try {
      console.log('Guardando comida analizada:', { foodName, analysisResult });

      // Verificar que tengamos usuario autenticado (acceso directo al objeto)
      if (!authHook.user) {
        throw new Error('Usuario no autenticado');
      }

      // Insertar en la base de datos de Supabase
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: authHook.user.id,
          food_name: foodName,
          image_url: imageUrl,
          calories: analysisResult.calories,
          macros: analysisResult.macros,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Error al guardar la comida');
      }

      console.log('Comida guardada exitosamente:', data);
    } catch (err) {
      console.error('Error guardando comida:', err);
      const errorMessage = err.message || 'Error al guardar la comida';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    analyzeImage,
    saveAnalyzedMeal,
    analyzing,
    analysis,
    error,
    authUser: authHook.user,
  };
}