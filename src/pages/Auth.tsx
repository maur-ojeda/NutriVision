import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch {
      // error ya manejado en el hook
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NutriVision</h1>
        <p className="text-gray-600">Contador de calorías con IA</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-colors placeholder:text-gray-400 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-colors placeholder:text-gray-400 disabled:bg-gray-100"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!email || !password || loading}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-400 text-white rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-green-600 hover:underline font-medium"
        >
          {isSignUp ? 'Inicia sesión' : 'Regístrate'}
        </button>
      </p>
    </div>
  );
}
