import { useAuth } from '@/hooks/useAuth';
import AuthPage from './Auth';
import Dashboard from './Dashboard';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, session, loading } = useAuth();

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
    return <Dashboard />;
  }

  // Si no hay sesión, mostrar Auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-900 px-4">
      <div className="w-full max-w-md p-8">
        <AuthPage />
      </div>
    </div>
  );
}
