import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email);
    } catch (err) {
      // Error is already handled by useAuth hook
      console.error('Sign in error:', err);
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
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && email && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="h-8 w-8 text-green-600" />
                  <p className="text-sm text-green-800">
                    Magic Link enviado!
                  </p>
                </div>
                <p className="text-sm text-green-700 leading-relaxed">
                  Revisa tu email en 1 minuto y haz click en el link.
                </p>
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
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              <strong className="text-gray-700">¿No tienes acceso?</strong> El Magic Link expira en 1 hora.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
