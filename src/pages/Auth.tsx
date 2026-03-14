import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Loader2, AlertCircle, Clock } from 'lucide-react';
import { isExpiredLinkError, formatTimeRemaining } from '@/lib/auth';

export default function AuthPage() {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [linkSentTime, setLinkSentTime] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email);
      setLinkSentTime(new Date());
    } catch (err) {
      // Error is already handled by useAuth hook
      console.error('Sign in error:', err);
    }
  };

  // Limpiar el estado de error cuando el usuario empieza a escribir
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      // No limpiar error si es de enlace expirado, ya que es informativo
      if (!isExpiredLinkError(error)) {
        // Podríamos limpiar el error aquí si queremos, pero mejor dejarlo para que el usuario vea
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-900 px-4">
      <div className="w-full max-w-md p-8">
        {/* Card de Autenticación */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NutriVision
            </h1>
            <p className="text-gray-600">
              Contador de calorías con IA
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent block text-sm transition-colors placeholder:text-gray-400 disabled:bg-gray-100"
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center space-y-4">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                <p className="text-sm text-gray-600">Enviando Magic Link...</p>
              </div>
            )}

            {/* Success/Error Messages */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
                {/* Mensaje específico para enlaces expirados */}
                {isExpiredLinkError(error) && (
                  <div className="flex items-center space-x-2 text-xs text-red-600 mt-2">
                    <Clock className="h-3 w-3" />
                    <span>Los Magic Links expiran después de 1 hora. Por favor, solicita un nuevo enlace.</span>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje de éxito con información adicional */}
            {!loading && !error && linkSentTime && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="h-8 w-8 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    Magic Link enviado!
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    Revisa tu email en 1 minuto y haz click en el link.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-100 rounded px-2 py-1">
                    <Clock className="h-3 w-3" />
                    <span>⏰ Los enlaces expiran después de 1 hora.</span>
                  </div>
                  <div className="text-xs text-green-600 bg-green-50 rounded px-2 py-1">
                    💡 Revisa también tu carpeta de spam si no ves el email.
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!loading && !error && (
              <button
                type="submit"
                disabled={!email || loading}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-white bg-green-600 hover:bg-green-700 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:text-gray-400"
              >
                Enviar Magic Link
              </button>
            )}
          </form>

          {/* Instructions */}
          <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
            <p>
              <strong className="text-gray-700">¿No tienes acceso?</strong> El Magic Link expira en 1 hora.
            </p>
            <div className="space-y-1">
              <p>• Revisa tu carpeta de spam si no ves el email</p>
              <p>• Asegúrate de usar el email correcto</p>
              <p>• Solo necesitas hacer clic en el enlace una vez</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
