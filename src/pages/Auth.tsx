import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Loader2, AlertCircle, Clock, Shield } from 'lucide-react';
import { isExpiredLinkError, formatTimeRemaining } from '@/lib/auth';

export default function AuthPage() {
  const { signIn, loading, error, isRateLimited, rateLimitCooldown } = useAuth();
  const [email, setEmail] = useState('');
  const [linkSentTime, setLinkSentTime] = useState<Date | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [localIsRateLimit, setLocalIsRateLimit] = useState(false);

  useEffect(() => {
    // Sincronizar estado de rate limit del hook
    setLocalIsRateLimit(isRateLimited);
    
    // Detectar si hay un error en la URL (del magic link)
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      console.log('AuthPage: Error en URL:', decodedError);
      
      // Detectar específicamente error de rate limit
      if (decodedError.includes('rate limit') || decodedError.includes('rate_limit')) {
        console.log('AuthPage: Error de rate limit detectado');
        setUrlError(decodedError);
        setLocalIsRateLimit(true);
      } else {
        setUrlError(decodedError);
        setLocalIsRateLimit(false);
      }
      
      // Limpiar los parámetros de error de la URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isRateLimited]);

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
    
    // Resetear estado de rate limit cuando el usuario empieza a escribir un email diferente
    if (isRateLimited && e.target.value) {
      console.log('AuthPage: Reseteando estado de rate limit');
      setLocalIsRateLimit(false);
      setUrlError(null);
    }
    
    if (urlError) {
      setUrlError(null);
    }
    if (error) {
      // No limpiar error si es de enlace expirado, ya que es informativo
      if (!isExpiredLinkError(error)) {
        // Podríamos limpiar el error aquí si queremos, pero mejor dejarlo para que el usuario vea
      }
    }
  };

  return (
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
            onChange={handleEmailChange}
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

        {/* Rate Limit Warning (si el usuario ha excedido el límite) */}
        {isRateLimited && !loading && !error && !urlError && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-orange-800 font-medium">
                Límite de seguridad activado
              </p>
            </div>
            <div className="space-y-1 text-xs text-orange-700 mt-2">
              <p>
                Has excedido el límite de magic links permitido. Por seguridad, debes esperar antes de solicitar uno nuevo.
              </p>
              <p className="font-medium">
                🕐 Tiempo de espera: aprox. 5-10 minutos
              </p>
              <p>
                💡 Si ya solicitaste un magic link recientemente, revisa tu email. Los enlaces son válidos por 1 hora.
              </p>
            </div>
          </div>
        )}

        {/* URL Error Messages (from failed magic link) */}
        {!loading && urlError && (
          <div className={`${localIsRateLimit ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border border-red-200'} rounded-lg p-4 space-y-2`}>
            <div className="flex items-center space-x-2">
              {localIsRateLimit ? (
                <Shield className="h-4 w-4 text-orange-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <p className={`text-sm font-medium ${localIsRateLimit ? 'text-orange-800' : 'text-red-800'}`}>
                {localIsRateLimit ? '¡Has excedido el límite de solicitudes!' : urlError}
              </p>
            </div>
            {localIsRateLimit ? (
              <div className="space-y-2 text-xs text-orange-700 mt-3">
                <p>
                  Has solicitado demasiados magic links recientemente. Por razones de seguridad, Supabase limita el número de solicitudes.
                </p>
                {rateLimitCooldown > 0 && (
                  <p className="font-medium">
                    🕐 Tiempo de espera: aprox. {rateLimitCooldown} minuto{rateLimitCooldown !== 1 ? 's' : ''}
                  </p>
                )}
                <p>
                  💡 Si ya solicitaste un magic link recientemente, revisa tu email. Los enlaces son válidos por 1 hora.
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-red-600 mt-2">
                <Clock className="h-3 w-3" />
                <p>
                  El magic link pudo expirar o estar roto. Por favor, solicita un nuevo enlace.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success/Error Messages */}
        {!loading && error && !urlError && (
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
        {!loading && !error && !urlError && linkSentTime && (
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
        {!loading && !error && !urlError && (
          <button
            type="submit"
            disabled={!email || loading || localIsRateLimit}
            className={`w-full flex justify-center items-center px-4 py-3 border border-transparent text-white rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              localIsRateLimit 
                ? 'bg-orange-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-300 disabled:text-gray-400'
            }`}
          >
            {localIsRateLimit ? 'Espera unos minutos...' : 'Enviar Magic Link'}
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
  );
}