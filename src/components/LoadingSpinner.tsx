interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ size = 'sm' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className="flex items-center justify-center space-y-4" role="status" aria-label="Cargando">
      <div className={currentSize}>
        {/* Ring exterior */}
        <div className="relative">
          {/* Anillos concéntricos girando */}
          <div className="inline-block animate-spin rounded-full h-3 w-3 border-4 border-t-transparent border-gray-200 border-r-transparent border-green-600">
            <div className="border-4 border-t-transparent border-gray-200 border-r-transparent border-green-600 rounded-full h-2 w-2"></div>
          </div>

          {/* Anillo interior girando */}
          <div className="inline-block animate-spin rounded-full h-3 w-3 border-4 border-t-transparent border-gray-200 border-l-transparent border-green-600 mt-[-0.375rem]">
            <div className="border-4 border-t-transparent border-gray-200 border-l-transparent border-green-600 rounded-full h-2 w-2"></div>
          </div>
        </div>
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
