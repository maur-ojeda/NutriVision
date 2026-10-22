import { useState, useMemo, useEffect } from 'react';
import CameraCapture from '@/components/CameraCapture';
import Preview from '@/components/Preview';
import Onboarding from '@/components/Onboarding';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { LogOut, Home, BarChart2, User, Camera, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMeals } from '@/hooks/useMeals';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { MacroProfile } from '@/lib/macros';
import { format, startOfDay, subDays, isSameDay } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

type Tab = 'home' | 'stats' | 'profile';
type DateFilter = '7days' | 'today' | 'all';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { meals, loading, error, refetch } = useMeals(user);
  const { profile, loading: profileLoading, saveProfile } = useUserProfile(user);
  const { subscribed, subscribe, sendCalorieAlert } = usePushNotifications(user);

  const [tab, setTab] = useState<Tab>('home');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');

  const calorieGoal = profile?.targets.calorieGoal ?? 2000;

  // Camera handlers
  const openCamera = () => { setShowCamera(true); setShowPreview(false); setCapturedImage(null); setCameraError(null); };
  const closeCamera = () => { setShowCamera(false); setCameraError(null); };
  const handleCapture = (img: string) => { setCapturedImage(img); setShowCamera(false); setShowPreview(true); };
  const handleClosePreview = () => { setShowPreview(false); setCapturedImage(null); };
  const handleRetake = () => { setShowPreview(false); setShowCamera(true); setCameraError(null); };

  const handleMealSaved = async () => {
    handleClosePreview();
    await refetch();
    // Check calorie alert after refetch
    const todayMeals = (meals || []).filter(m => isSameDay(new Date(m.created_at), new Date()));
    const consumed = todayMeals.reduce((s, m) => s + m.calories, 0);
    await sendCalorieAlert(consumed, calorieGoal);
  };

  // Filtered meals
  const filteredMeals = useMemo(() => {
    if (!meals?.length) return [];
    const now = new Date();
    const today = startOfDay(now);
    if (dateFilter === 'today') return meals.filter(m => isSameDay(new Date(m.created_at), today));
    if (dateFilter === '7days') {
      const ago = subDays(today, 6);
      return meals.filter(m => { const d = new Date(m.created_at); return d >= ago && d <= now; });
    }
    return meals;
  }, [meals, dateFilter]);

  const todayMeals = useMemo(() =>
    (meals || []).filter(m => isSameDay(new Date(m.created_at), new Date())),
    [meals]);

  // Daily chart data
  const dailyData = useMemo(() => {
    const totals = new Map<string, { calories: number }>();
    if (dateFilter !== 'all') {
      const days = dateFilter === 'today' ? 1 : 7;
      for (let i = days - 1; i >= 0; i--) {
        const key = format(subDays(startOfDay(new Date()), i), 'yyyy-MM-dd');
        totals.set(key, { calories: 0 });
      }
    }
    filteredMeals.forEach(m => {
      const key = format(new Date(m.created_at), 'yyyy-MM-dd');
      const cur = totals.get(key) || { calories: 0 };
      totals.set(key, { calories: cur.calories + m.calories });
    });
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date: format(new Date(date), 'dd/MM'), calories: d.calories }));
  }, [filteredMeals, dateFilter]);

  // Today summary
  const todayKcal = todayMeals.reduce((s, m) => s + m.calories, 0);
  const todayPct = Math.min((todayKcal / calorieGoal) * 100, 100);
  const todayProtein = todayMeals.reduce((s, m) => s + m.macros.protein, 0);
  const todayCarbs = todayMeals.reduce((s, m) => s + m.macros.carbs, 0);
  const todayFat = todayMeals.reduce((s, m) => s + m.macros.fat, 0);

  // Onboarding: show if profile not loaded and not loading
  if (!profileLoading && !profile) {
    return <Onboarding onComplete={(p: MacroProfile) => saveProfile(p)} />;
  }

  const fullscreen = showCamera || showPreview;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Camera / Preview overlay */}
      {showCamera && (
        <div className="flex-1 flex flex-col">
          <CameraCapture onCapture={handleCapture} onError={setCameraError} />
          {cameraError && <p className="text-red-400 text-center py-2">{cameraError}</p>}
          <button onClick={closeCamera} className="mx-auto mb-6 px-8 py-3 bg-gray-800 rounded-xl text-gray-300">Cancelar</button>
        </div>
      )}

      {showPreview && capturedImage && (
        <div className="flex-1 flex flex-col">
          <Preview imageUrl={capturedImage} onConfirm={handleMealSaved} onRetake={handleRetake} />
          <button onClick={handleClosePreview} className="mx-auto mb-6 px-8 py-3 bg-gray-800 rounded-xl text-gray-300">Cancelar</button>
        </div>
      )}

      {!fullscreen && (
        <>
          {/* Header */}
          <header className="px-5 pt-10 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">NutriVision</h1>
              <p className="text-gray-500 text-sm">{format(new Date(), "EEEE d MMMM")}</p>
            </div>
            <button onClick={() => signOut()} className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <LogOut size={18} className="text-gray-400" />
            </button>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto px-4 pb-32 space-y-4">

            {/* HOME TAB */}
            {tab === 'home' && (
              <>
                {/* Calorie ring card */}
                <div className="bg-[#1a1a1a] rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-sm">Calorías hoy</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      todayKcal > calorieGoal ? 'bg-red-500/20 text-red-400' :
                      todayPct >= 95 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {Math.round(todayPct)}%
                    </span>
                  </div>
                  <p className="text-5xl font-bold text-white">{todayKcal.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm mt-1">de {calorieGoal.toLocaleString()} kcal objetivo</p>
                  {/* Progress bar */}
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${todayKcal > calorieGoal ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(todayPct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0</span>
                    <span>{calorieGoal.toLocaleString()} kcal</span>
                  </div>
                </div>

                {/* Macro pills */}
                <div className="grid grid-cols-3 gap-3">
                  <MacroPill label="Proteína" value={todayProtein} unit="g" goal={profile?.targets.proteinG} color="blue" />
                  <MacroPill label="Carbos" value={todayCarbs} unit="g" goal={profile?.targets.carbsG} color="yellow" />
                  <MacroPill label="Grasas" value={todayFat} unit="g" goal={profile?.targets.fatG} color="red" />
                </div>

                {/* Recent meals */}
                <div className="bg-[#1a1a1a] rounded-2xl p-5">
                  <h2 className="text-white font-bold mb-4">Comidas de hoy</h2>
                  {loading ? (
                    <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
                  ) : todayMeals.length > 0 ? (
                    <div className="space-y-3">
                      {todayMeals.map(meal => (
                        <div key={meal.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                            {meal.image_url
                              ? <img src={meal.image_url} alt={meal.food_name} className="w-full h-full object-cover" loading="lazy" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">📷</div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{meal.food_name}</p>
                            <p className="text-gray-500 text-xs">{format(new Date(meal.created_at), 'HH:mm')} · {meal.calories} kcal</p>
                          </div>
                          <span className="text-green-400 text-sm font-medium">{meal.calories}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-4xl mb-2">🍽️</p>
                      <p className="text-gray-500 text-sm">Sin comidas hoy</p>
                      <p className="text-gray-600 text-xs">Toca el botón verde para registrar</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* STATS TAB */}
            {tab === 'stats' && (
              <>
                <div className="bg-[#1a1a1a] rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-bold">Progreso calórico</h2>
                    <select
                      value={dateFilter}
                      onChange={e => setDateFilter(e.target.value as DateFilter)}
                      className="bg-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="7days">7 días</option>
                      <option value="today">Hoy</option>
                      <option value="all">Todo</option>
                    </select>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyData}>
                        <defs>
                          <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                          labelStyle={{ color: '#9ca3af' }}
                          formatter={(v: number) => [`${v} kcal`, 'Calorías']}
                        />
                        <ReferenceLine y={calorieGoal} stroke="#22c55e" strokeDasharray="4 4" />
                        <Area type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2}
                          fill="url(#cGrad)" dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Macro summary */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total kcal', val: filteredMeals.reduce((s,m) => s+m.calories,0).toLocaleString(), unit: 'kcal', color: 'text-green-400' },
                    { label: 'Comidas', val: filteredMeals.length, unit: 'registros', color: 'text-blue-400' },
                    { label: 'Proteína total', val: filteredMeals.reduce((s,m) => s+m.macros.protein,0), unit: 'g', color: 'text-purple-400' },
                    { label: 'Carbos total', val: filteredMeals.reduce((s,m) => s+m.macros.carbs,0), unit: 'g', color: 'text-yellow-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-[#1a1a1a] rounded-2xl p-4">
                      <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                      <p className="text-gray-600 text-xs">{s.unit}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* PROFILE TAB */}
            {tab === 'profile' && profile && (
              <>
                <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-4">
                  <h2 className="text-white font-bold">Tu perfil metabólico</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="BMR" value={profile.targets.bmr} unit="kcal/día" />
                    <Stat label="TDEE" value={profile.targets.tdee} unit="kcal/día" />
                    <Stat label="Objetivo" value={profile.targets.calorieGoal} unit="kcal" />
                    <Stat label="Fórmula" value={profile.targets.formula === 'katch' ? 'Katch-McArdle' : 'Mifflin-St Jeor'} unit="" />
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-3">
                  <h2 className="text-white font-bold">Macros objetivo/día</h2>
                  <MacroBar label="Proteína" value={profile.targets.proteinG} max={250} color="bg-blue-500" unit="g" />
                  <MacroBar label="Carbohidratos" value={profile.targets.carbsG} max={400} color="bg-yellow-500" unit="g" />
                  <MacroBar label="Grasas" value={profile.targets.fatG} max={150} color="bg-red-500" unit="g" />
                </div>

                <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-3">
                  <h2 className="text-white font-bold">Datos personales</h2>
                  {[
                    ['Peso', `${profile.weightKg} kg`],
                    ['Altura', `${profile.heightCm} cm`],
                    ['Edad', `${profile.age} años`],
                    ['Objetivo', { bulk: 'Volumen', maintain: 'Mantenimiento', cut: 'Definición' }[profile.goal]],
                    profile.bodyFatPct ? ['% Grasa', `${profile.bodyFatPct}%`] : null,
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k as string} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k as string}</span>
                      <span className="text-white font-medium">{v as string}</span>
                    </div>
                  ))}
                </div>

                {/* Push notification toggle */}
                <div className="bg-[#1a1a1a] rounded-2xl p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">Alertas de calorías</p>
                      <p className="text-gray-500 text-xs">Notificación al 95% y 100% del objetivo</p>
                    </div>
                    <button
                      onClick={subscribe}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        subscribed ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {subscribed ? '✓ Activas' : 'Activar'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-2xl text-red-400 font-medium"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            )}
          </main>

          {/* Bottom nav */}
          <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-gray-800 flex items-center justify-around px-4 pb-safe pt-2">
            <NavBtn icon={<Home size={22} />} label="Inicio" active={tab === 'home'} onClick={() => setTab('home')} />
            <NavBtn icon={<BarChart2 size={22} />} label="Stats" active={tab === 'stats'} onClick={() => setTab('stats')} />
            {/* Center camera button */}
            <button
              onClick={openCamera}
              className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 -mt-4"
            >
              <Camera size={26} className="text-black" />
            </button>
            <NavBtn icon={<Bell size={22} />} label="Alertas" active={false} onClick={subscribe} />
            <NavBtn icon={<User size={22} />} label="Perfil" active={tab === 'profile'} onClick={() => setTab('profile')} />
          </nav>
        </>
      )}

      <PWAInstallPrompt />
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-2 py-1">
      <span className={active ? 'text-green-400' : 'text-gray-600'}>{icon}</span>
      <span className={`text-[10px] ${active ? 'text-green-400' : 'text-gray-600'}`}>{label}</span>
    </button>
  );
}

function MacroPill({ label, value, unit, goal, color }: { label: string; value: number; unit: string; goal?: number; color: string }) {
  const colorMap: Record<string, string> = { blue: 'text-blue-400', yellow: 'text-yellow-400', red: 'text-red-400' };
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}<span className="text-sm font-normal">{unit}</span></p>
      {goal && <p className="text-gray-600 text-xs">/{goal}{unit}</p>}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number | string; unit: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-3">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-white font-bold text-lg">{value}</p>
      {unit && <p className="text-gray-600 text-xs">{unit}</p>}
    </div>
  );
}

function MacroBar({ label, value, max, color, unit }: { label: string; value: number; max: number; color: string; unit: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}{unit}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full">
        <div className={`h-2 ${color} rounded-full`} style={{ width: `${Math.min((value/max)*100, 100)}%` }} />
      </div>
    </div>
  );
}
