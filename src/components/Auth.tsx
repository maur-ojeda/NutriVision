import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';

interface AuthCardProps {
  onSignIn?: (email: string) => Promise<void>;
}

export default function AuthCard({ onSignIn }: AuthCardProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string | null }>({
    type: null,
    text: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!onSignIn) {
      console.error('No signIn handler provided');
      return;
    }

    setLoading(true);
    setMessage({ type: null, text: null });

    try {
      await onSignIn(email);
      setMessage({
        type: 'success',
        text: 'Magic Link enviado! Revisa tu email en 1 minuto y haz click en el link.',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al enviar Magic Link',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-gray-600 text-sm">
          Ingresa tu correo electrónico para recibir un Magic Link
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
          <div className="flex justify-center items-center space-y-4 py-4">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <p className="text-sm text-gray-600">Enviando Magic Link...</p>
          </div>
        )}

        {/* Success/Error Messages */}
        {!loading && message && (
          <div
            className={`border rounded-lg p-4 space-y-2 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              {message.type === 'success' ? (
                <Mail className="h-6 w-6 text-green-600" />
              ) : (
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-red-100">
                  <span className="text-red-600 font-bold">!</span>
                </div>
              )}
              <p
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!loading && (
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
      <div className="mt-4 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
        <p>
          <strong className="text-gray-600">¿No tienes acceso?</strong> El Magic Link expira en 1 hora.
        </p>
      </div>
    </div>
  );
}
