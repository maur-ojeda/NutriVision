import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import AuthPage from './Auth';
import Dashboard from './Dashboard';
import AuthCallback from '@/components/AuthCallback';
import { Loader2, TestTube } from 'lucide-react';

export default function HomePage() {
  const { user, session, loading } = useAuth();
  const [showCallback, setShowCallback] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  useEffect(() => {
    console.log('HomePage: Detectando parámetros de URL...');
    
    // Detectar si hay parámetros de autenticación en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash);
    
    // Buscar en ambos: search params y hash params (Supabase usa hash)
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
    const error = urlParams.get('error') || hashParams.get('error');
    const type = urlParams.get('type') || hashParams.get('type'); // 'signup' o 'recovery'
    
    console.log('HomePage: Parámetros detectados:', { accessToken, refreshToken, error, type });
    
    // Si hay parámetros de autenticación o error, mostrar el callback
    if (accessToken || refreshToken || error || type) {
      console.log('HomePage: Mostrando AuthCallback');
      setShowCallback(true);
    } else {
      console.log('HomePage: Sin parámetros de auth, vista normal');
      setShowCallback(false);
    }
  }, []);

  // Mostrar callback si hay parámetros de autenticación
  if (showCallback) {
    return <AuthCallback />;
  }

  // Si bypass está activo, mostrar Dashboard directamente (solo en desarrollo)
  if (import.meta.env.DEV && bypassAuth) {
    console.log('HomePage: Bypass de auth activado, mostrando Dashboard');
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