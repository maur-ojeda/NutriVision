import { useState, useMemo } from 'react';
import CameraCapture from '@/components/CameraCapture';
import Preview from '@/components/Preview';
import FAB from '@/components/FAB';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { LogOut, Calendar, TrendingUp, PieChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMeals } from '@/hooks/useMeals';
import { CALORIE_GOAL } from '@/lib/constants';
import { format, startOfDay, subDays, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type DateFilter = '7days' | 'today' | 'all';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { meals, loading, error } = useMeals(user);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');

  const handleOpenCamera = () => {
    setShowCamera(true);
    setShowPreview(false);
    setCapturedImage(null);
    setCameraError(null);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setCameraError(null);
  };

  const handleCapture = (image: string) => {
    setCapturedImage(image);
    setShowCamera(false);
    setShowPreview(true);
  };

  const handleCameraError = (error: string) => {
    setCameraError(error);
  };

  const handleAnalyze = () => {
    // TODO: Integrate with Edge Function in Phase 5
    console.log('Analyzing image:', capturedImage);
    alert('Análisis con IA se implementará en Phase 5');
    handleClosePreview();
  };

  const handleRetake = () => {
    setShowPreview(false);
    setShowCamera(true);
    setCameraError(null);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setCapturedImage(null);
  };

  // Filter meals based on selected date filter
  const filteredMeals = useMemo(() => {
    if (!meals || meals.length === 0) return [];

    const now = new Date();
    const today = startOfDay(now);

    switch (dateFilter) {
      case 'today':
        return meals.filter(meal => isSameDay(new Date(meal.created_at), today));
      case '7days':
        const sevenDaysAgo = subDays(today, 6);
        return meals.filter(meal => {
          const mealDate = new Date(meal.created_at);
          return mealDate >= sevenDaysAgo && mealDate <= now;
        });
      case 'all':
      default:
        return meals;
    }
  }, [meals, dateFilter]);

  // Calculate daily totals for the chart
  const dailyData = useMemo(() => {
    const totals = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

    // Initialize days based on filter
    if (dateFilter === 'today') {
      const today = startOfDay(new Date());
      const key = format(today, 'yyyy-MM-dd');
      totals.set(key, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } else if (dateFilter === '7days') {
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = subDays(startOfDay(now), i);
        const key = format(date, 'yyyy-MM-dd');
        totals.set(key, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    }

    // Aggregate meals by day
    filteredMeals.forEach(meal => {
      const mealDate = new Date(meal.created_at);
      const key = format(mealDate, 'yyyy-MM-dd');
      const current = totals.get(key) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      totals.set(key, {
        calories: current.calories + meal.calories,
        protein: current.protein + meal.macros.protein,
        carbs: current.carbs + meal.macros.carbs,
        fat: current.fat + meal.macros.fat,
      });
    });

    // Convert to array and sort by date
    return Array.from(totals.entries())
      .map(([date, data]) => ({
        date: format(new Date(date), 'dd/MM'),
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());
  }, [filteredMeals, dateFilter]);

  // Calculate summary totals
  const summary = useMemo(() => {
    if (dailyData.length === 0) {
      return {
        totalCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
      };
    }

    const totalCalories = dailyData.reduce((sum, day) => sum + day.calories, 0);
    const avgProtein = Math.round(dailyData.reduce((sum, day) => sum + day.protein, 0) / dailyData.length);
    const avgCarbs = Math.round(dailyData.reduce((sum, day) => sum + day.carbs, 0) / dailyData.length);
    const avgFat = Math.round(dailyData.reduce((sum, day) => sum + day.fat, 0) / dailyData.length);

    return { totalCalories, avgProtein, avgCarbs, avgFat };
  }, [dailyData]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Home.tsx will handle the redirect based on auth state
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-900">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NutriVision</h1>
              <p className="text-sm text-gray-500">Tu tracking de nutrición con IA</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {showCamera && (
          <>
            <CameraCapture
              onCapture={handleCapture}
              onError={handleCameraError}
            />
            {cameraError && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {cameraError}
              </div>
            )}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleCloseCamera}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {showPreview && capturedImage && (
          <>
            <Preview
              imageUrl={capturedImage}
              onConfirm={handleAnalyze}
              onRetake={handleRetake}
            />
            <div className="flex justify-center mt-4">
              <button
                onClick={handleClosePreview}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {!showCamera && !showPreview && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-500">
                    {dateFilter === 'today' ? 'Calorías hoy' : 'Total calorías'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {summary.totalCalories.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  de {CALORIE_GOAL.toLocaleString()} objetivo
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-500">
                    {dateFilter === 'today' ? 'Proteína hoy' : 'Promedio proteína'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{summary.avgProtein}g</p>
                <p className="text-sm text-gray-500">por día</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <PieChart className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-500">
                    {dateFilter === 'today' ? 'Carbos hoy' : 'Promedio carbos'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{summary.avgCarbs}g</p>
                <p className="text-sm text-gray-500">por día</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <PieChart className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-gray-500">
                    {dateFilter === 'today' ? 'Grasas hoy' : 'Promedio grasas'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{summary.avgFat}g</p>
                <p className="text-sm text-gray-500">por día</p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Progreso</h2>
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                >
                  <option value="7days">Últimos 7 días</option>
                  <option value="today">Hoy</option>
                  <option value="all">Todo el tiempo</option>
                </select>
              </div>
              {dailyData.length > 0 ? (
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => [
                          name === 'Calorías' ? `${value} kcal` : `${value}g`,
                          name,
                        ]}
                      />
                      <ReferenceLine
                        y={CALORIE_GOAL}
                        stroke="#16a34a"
                        strokeDasharray="3 3"
                        label={{
                          value: 'Objetivo',
                          position: 'right',
                          fill: '#16a34a',
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#16a34a' }}
                        name="Calorías"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">
                    {loading ? 'Cargando datos...' : 'No hay datos para mostrar'}
                  </p>
                </div>
              )}
            </div>

            {/* Recent Meals */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Comidas recientes</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : filteredMeals.length > 0 ? (
                <div className="space-y-4">
                  {filteredMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        {meal.image_url ? (
                          <img
                            src={meal.image_url}
                            alt={meal.food_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs sm:text-sm">Sin foto</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{meal.food_name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="text-sm text-green-600 font-medium">
                            {meal.calories} kcal
                          </span>
                          <span className="text-sm text-blue-600">
                            P: {meal.macros.protein}g
                          </span>
                          <span className="text-sm text-yellow-600">
                            C: {meal.macros.carbs}g
                          </span>
                          <span className="text-sm text-red-600">
                            G: {meal.macros.fat}g
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(meal.created_at), "dd MMM yyyy 'a las' HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin comidas registradas
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Comienza a capturar tus comidas con la cámara para ver tu progreso
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      {!showCamera && !showPreview && <FAB onClick={handleOpenCamera} />}
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
