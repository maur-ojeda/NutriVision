import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${
        isOnline
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-gray-100 border-gray-300 text-gray-600'
      }`}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Conexión estable' : 'Sin conexión a internet'}
    >
      {isOnline ? (
        <>
          <Wifi className="h-5 w-5" />
          <span className="text-sm font-medium">En línea</span>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5" />
          <span className="text-sm font-medium">Sin conexión</span>
        </>
      )}
    </div>
  );
}
