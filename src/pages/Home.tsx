import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import AuthPage from './Auth';
import Dashboard from './Dashboard';
import { Loader2, TestTube } from 'lucide-react';

export default function HomePage() {
  const { user, session, loading } = useAuth();
  const [bypassAuth, setBypassAuth] = useState(false);

  // Si bypass está activo, mostrar Dashboard directamente (solo en desarrollo)
  if (import.meta.env.DEV && bypassAuth) {
    return <Dashboard />;
  }

  // Estado inicial: muestra spinner mientras carga la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-900 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
          <div className="flex justify-center items-center space-y-4">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay sesión, mostrar Dashboard
  if (user && session) {
    console.log('HomePage: Usuario autenticado, mostrando Dashboard');
    return <Dashboard />;
  }

  // Si no hay sesión, mostrar Auth
  console.log('HomePage: Usuario no autenticado, mostrando Auth');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-900 px-4">
      <div className="w-full max-w-md p-8">
        <AuthPage />

        {/* Botón de Bypass Temporal para Desarrollo — nunca presente en build de producción */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Modo Desarrollo</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Acceso directo para probar PWA sin auth
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBypassAuth(true)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Ir al Dashboard
              </button>
            </div>
            <div className="text-xs text-gray-700 space-y-1">
              <p>⚠️ <strong>Uso temporal:</strong> Solo para desarrollo y testing</p>
              <p>• Probar funcionalidades de la PWA instalada</p>
              <p>• Verificar UI y componentes sin esperar cooldown de auth</p>
              <p>• Bypass temporal de Supabase rate limiting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}