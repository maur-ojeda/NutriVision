import { useState } from 'react';
import { Loader2, Sparkles, AlertCircle, CheckCircle, Camera, Edit } from 'lucide-react';
import { useFoodAnalysis } from '@/hooks/useFoodAnalysis';

export interface PreviewProps {
  imageUrl?: string;
  onConfirm?: (analysis: any) => void;
  onRetake?: () => void;
}

interface FoodAnalysis {
  food: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const PreviewComponent = ({ imageUrl, onConfirm, onRetake }: PreviewProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [savedMealId, setSavedMealId] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const useFoodAnalysisHook = useFoodAnalysis();

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    try {
      setAnalyzing(true);
      setError(null);
      setAnalysis(null);

      const result = await useFoodAnalysisHook.analyzeImage(imageUrl);
      setAnalysis(result);
      
      const foodNameFromAI = result?.food || '';
      setFoodName(foodNameFromAI);

      console.log('Análisis completado:', result);
    } catch (err: any) {
      console.error('Error analizando imagen:', err);
      setError(err.message || 'Error al analizar la imagen');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysis || !foodName) {
      setError('Primero analiza la imagen para obtener información');
      return;
    }

    try {
      const finalFoodName = foodName.trim() || 'Comida del día';

      await useFoodAnalysisHook.saveAnalyzedMeal(finalFoodName, imageUrl, analysis);

      setSavedMealId('temp-id');
      console.log('Comida guardada exitosamente');

      setTimeout(() => {
        if (onConfirm) {
          onConfirm(analysis);
        }
      }, 1500);
    } catch (err) {
      console.error('Error guardando comida:', err);
      setError(err.message || 'Error al guardar la comida');
    }
  };

  const handleConfirm = () => {
    if (onConfirm && analysis) {
      onConfirm(analysis);
      setShowEditDialog(false);
      setSavedMealId(null);
    }
  };

  const handleRetake = () => {
    if (onRetake) {
      onRetake();
      setShowEditDialog(false);
      setSavedMealId(null);
      setError(null);
      setAnalysis(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analizar con IA
        </h2>

        <div className="space-y-4">
          {/* Image Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Previsualización de la comida"
                className="w-full h-64 object-contain rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Botón de análisis */}
          {(!analysis && !analyzing) && (
            <button
              onClick={handleAnalyze}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Analizar con IA
            </button>
          )}

          {/* Loading */}
          {analyzing && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-600 mt-2">Analizando imagen con IA...</p>
              <p className="text-sm text-gray-500">Esto puede tomar unos segundos</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800 font-medium">Error de análisis</p>
              </div>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && (
            <>
              {/* Food Name */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Nombre del alimento"
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => setShowEditDialog(!showEditDialog)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded"
                    aria-label="Editar nombre"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Información Nutricional
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Calorías</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analysis.calories.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Proteínas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analysis.macros.protein.toLocaleString()}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carbohidratos</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {analysis.macros.carbs.toLocaleString()}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grasas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {analysis.macros.fat.toLocaleString()}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Food Identification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Camera className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Identificado como:</p>
                    <p className="text-gray-700">{analysis.food}</p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {savedMealId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">¡Comida guardada exitosamente!</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!savedMealId && (
                  <button
                    onClick={handleSave}
                    disabled={!analysis || !foodName}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-400 rounded-lg text-white font-medium transition-colors"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Guardar Comida
                  </button>
                )}
                <button
                  onClick={handleRetake}
                  disabled={analyzing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                >
                  Tomar Otra Foto
                </button>
              </div>
            </>
          )}
        </div>

        {/* Edit Food Name Dialog */}
        {showEditDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Editar Nombre
              </h3>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Nombre del alimento"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!foodName.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dismiss Button */}
        <div className="flex justify-end pt-4 mt-4 border-t">
          <button
            onClick={handleRetake}
            disabled={analyzing}
            className="text-gray-600 hover:text-gray-900 text-sm underline"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewComponent;