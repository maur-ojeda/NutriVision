import { useState } from 'react';
import { MacroProfile, Sex, ActivityLevel, Goal } from '@/lib/macros';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: MacroProfile) => void;
}

const STEPS = ['Datos básicos', 'Actividad', 'Objetivo'] as const;

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: 'sedentary',  label: 'Sedentario',    sub: 'Sin ejercicio' },
  { value: 'light',      label: 'Ligero',         sub: '1-3 días/semana' },
  { value: 'moderate',   label: 'Moderado',       sub: '3-5 días/semana' },
  { value: 'active',     label: 'Activo',         sub: '6-7 días/semana' },
  { value: 'very_active',label: 'Muy activo',     sub: 'Doble sesión diaria' },
];

const GOAL_OPTIONS: { value: Goal; label: string; sub: string; emoji: string }[] = [
  { value: 'bulk',     label: 'Volumen',        sub: '+15% calorías, más masa muscular', emoji: '💪' },
  { value: 'maintain', label: 'Mantenimiento',  sub: 'Mantener peso y composición',      emoji: '⚖️' },
  { value: 'cut',      label: 'Definición',     sub: '-20% calorías, perder grasa',      emoji: '🔥' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<MacroProfile>>({ sex: 'male' });

  const set = (k: keyof MacroProfile, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.weightKg && form.heightCm && form.age && form.sex;
    if (step === 1) return form.activityLevel;
    if (step === 2) return form.goal;
    return false;
  };

  const handleFinish = () => {
    onComplete(form as MacroProfile);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Progress */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-xs ${i === step ? 'text-green-400' : i < step ? 'text-gray-400' : 'text-gray-600'}`}>{s}</span>
          ))}
        </div>
        <div className="h-1 bg-gray-800 rounded-full">
          <div
            className="h-1 bg-green-500 rounded-full transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl p-6 space-y-5">

        {/* Step 0 — basic data */}
        {step === 0 && (
          <>
            <h2 className="text-white text-2xl font-bold">Cuéntanos sobre ti</h2>
            <p className="text-gray-400 text-sm">Calculamos tus macros personalizados</p>

            {/* Sex */}
            <div className="flex gap-3">
              {(['male', 'female'] as Sex[]).map(s => (
                <button
                  key={s}
                  onClick={() => set('sex', s)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    form.sex === s ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-300'
                  }`}
                >{s === 'male' ? '♂ Hombre' : '♀ Mujer'}</button>
              ))}
            </div>

            <Field label="Peso (kg)" type="number" placeholder="70" value={form.weightKg}
              onChange={v => set('weightKg', Number(v))} />
            <Field label="Altura (cm)" type="number" placeholder="175" value={form.heightCm}
              onChange={v => set('heightCm', Number(v))} />
            <Field label="Edad" type="number" placeholder="28" value={form.age}
              onChange={v => set('age', Number(v))} />
            <Field label="% Grasa corporal (opcional)" type="number" placeholder="Ej: 18"
              value={form.bodyFatPct} onChange={v => set('bodyFatPct', v ? Number(v) : undefined)} />
            {form.bodyFatPct && (
              <p className="text-green-400 text-xs">✓ Usaremos Katch-McArdle para mayor precisión</p>
            )}
          </>
        )}

        {/* Step 1 — activity */}
        {step === 1 && (
          <>
            <h2 className="text-white text-2xl font-bold">Nivel de actividad</h2>
            <p className="text-gray-400 text-sm">¿Cuánto ejercicio haces por semana?</p>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('activityLevel', opt.value)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-colors ${
                    form.activityLevel === opt.value
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className={`text-xs ${form.activityLevel === opt.value ? 'text-black/70' : 'text-gray-500'}`}>{opt.sub}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — goal */}
        {step === 2 && (
          <>
            <h2 className="text-white text-2xl font-bold">Tu objetivo</h2>
            <p className="text-gray-400 text-sm">Ajustamos calorías y macros a tu meta</p>
            <div className="space-y-3">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('goal', opt.value)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-colors text-left ${
                    form.goal === opt.value
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-bold">{opt.label}</p>
                    <p className={`text-xs ${form.goal === opt.value ? 'text-black/70' : 'text-gray-500'}`}>{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300"
            >
              <ChevronLeft size={18} /> Atrás
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl bg-green-500 text-black font-bold disabled:opacity-40"
            >
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canNext()}
              className="flex-1 py-3 rounded-xl bg-green-500 text-black font-bold disabled:opacity-40"
            >
              Calcular mis macros →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string;
  value: unknown; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value as string ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600"
      />
    </div>
  );
}
