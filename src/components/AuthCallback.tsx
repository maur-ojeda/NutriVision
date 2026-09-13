import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { handleMagicLinkCallback } from '@/lib/supabase';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AuthCallback() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'rate-limit'>('loading');
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const processingRef = useRef(false);
  const isProcessingRateLimit = useRef(false);

  useEffect(() => {
    console.log('AuthCallback: Iniciando procesamiento...');
    
    // Si ya hay un usuario autenticado, redirigir al dashboard
    if (user) {
      console.log('AuthCallback: Usuario ya autenticado, redirigiendo al dashboard');
      setStatus('success');
      setMessage('¡Sesión activa! Redirigiendo al dashboard...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      return;
    }

    // Prevenir múltiples procesamientos simultáneos
    if (processingRef.current) {
      console.log('AuthCallback: Ya procesando callback, ignorando...');
      return;
    }

    processingRef.current = true;

    // Detectar si hay error de rate limit en la URL
    const urlParams = new URLSearchParams(window.location.hash);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      console.log('AuthCallback: Error detectado en URL:', errorParam);
      
      if (errorParam.includes('rate limit') || errorParam.includes('rate_limit')) {
        console.log('AuthCallback: Error de rate limit detectado en URL');
        setStatus('rate-limit');
        isProcessingRateLimit.current = true;
        processingRef.current = false;
        
        // Redirigir a login con mensaje de rate limit
        setTimeout(() => {
          window.location.href = '/?error=rate_limit';
        }, 3000);
        return;
      }
    }

    // Procesar el callback del magic link
    console.log('AuthCallback: Procesando magic link callback...', retryCount);
    
    const processCallback = async () => {
      try {
        console.log('AuthCallback: Ejecutando handleMagicLinkCallback...');
        const result = await handleMagicLinkCallback();
        console.log('AuthCallback: Resultado del callback:', result);
        
        if (result.success) {
          setStatus('success');
          setMessage('¡Sesión establecida correctamente! Redirigiendo al dashboard...');
          console.log('AuthCallback: Sesión establecida, esperando redirección...');
          setTimeout(() => {
            console.log('AuthCallback: Redirigiendo al dashboard...');
            window.location.href = '/';
          }, 2000);
        } else if (result.error) {
          console.error('AuthCallback: Error procesando magic link:', result.error);
          
          // Detectar específicamente errores de rate limit
          if (result.error.includes('rate limit') || result.error.includes('rate_limit') || result.error.includes('exceeded')) {
            console.log('AuthCallback: Error de rate limit detectado en resultado');
            setStatus('rate-limit');
            setMessage(result.error || 'Has excedido el límite de solicitudes');
            isProcessingRateLimit.current = true;
            processingRef.current = false;
            
            // No reintentar automáticamente en rate limit
            setTimeout(() => {
              window.location.href = '/?error=rate_limit';
            }, 3000);
            return;
          }
          
          setStatus('error');
          setMessage(result.error || 'Error al procesar el enlace');
          
          // Solo reintentar si NO es rate limit y son menos de 3 intentos
          if (retryCount < 2 && !result.error.includes('rate limit') && !result.error.includes('rate_limit')) {
            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);
            console.log(`AuthCallback: Reintentando (${newRetryCount}/3)...`);
            setTimeout(processCallback, 3000);
          } else {
            console.log('AuthCallback: Máximo de reintentos alcanzado o rate limit');
            // Redirigir a la página de login con el error
            setTimeout(() => {
              window.location.href = `/?error=${encodeURIComponent(result.error || 'Error de autenticación')}`;
            }, 3000);
          }
        }
      } catch (error: any) {
        console.error('AuthCallback: Error inesperado:', error);
        
        // Detectar error de rate limit en excepciones
        if (error?.message?.includes('rate limit') || error?.message?.includes('rate_limit') || error?.message?.includes('exceeded')) {
          console.log('AuthCallback: Error de rate limit en excepción');
          setStatus('rate-limit');
          setMessage(error?.message || 'Has excedido el límite de solicitudes');
          isProcessingRateLimit.current = true;
          processingRef.current = false;
          
          setTimeout(() => {
            window.location.href = '/?error=rate_limit';
          }, 3000);
          return;
        }
        
        setStatus('error');
        setMessage('Error inesperado. Por favor, intenta nuevamente.');
        
        setTimeout(() => {
          window.location.href = '/?error=Error+inesperado+en+autenticación';
        }, 3000);
      }
    };

    processCallback();
  }, [user, retryCount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {status === 'loading' ? (
                <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : status === 'rate-limit' ? (
                <Clock className="h-10 w-10 text-orange-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'loading' ? 'Procesando tu enlace...' : 
               status === 'success' ? '¡Proceso completado!' :
               status === 'rate-limit' ? 'Límite alcanzado' :
               'Error de autenticación'}
            </h1>
            <p className="text-gray-600">
              {message || 'Estamos verificando tu cuenta, espera un momento.'}
            </p>
          </div>

          {/* Status Info */}
          {status === 'loading' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-800">
                  Procesando sesión. Esto puede tomar unos segundos...
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-blue-600">
                <AlertCircle className="h-4 w-4" />
                <p>
                  {retryCount > 0 ? `Reintentando... (${retryCount}/3)` : 'Si no eres redirigido automáticamente, puedes hacer clic abajo.'}
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  ¡Sesión establecida correctamente! Redirigiendo al dashboard...
                </p>
              </div>
            </div>
          )}

          {status === 'rate-limit' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-sm text-orange-800 font-medium">
                  ¡Has excedido el límite de solicitudes!
                </p>
              </div>
              <div className="space-y-2 text-xs text-orange-700 mt-3">
                <p>
                  Has solicitado demasiados magic links recientemente. Por razones de seguridad, Supabase limita el número de solicitudes.
                </p>
                <p className="font-medium">
                  💡 Por favor, espera unos minutos antes de intentar nuevamente.
                </p>
                <p>
                  Los enlaces de magic link son válidos por 1 hora, así que no es necesario solicitar uno nuevo inmediatamente.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">
                  {message}
                </p>
              </div>
              <p className="text-xs text-red-600 mt-2">
                Serás redirigido a la página de inicio en unos segundos.
              </p>
            </div>
          )}

          {/* Manual redirect button */}
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}