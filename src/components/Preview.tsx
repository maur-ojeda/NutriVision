import { Loader2 } from 'lucide-react';

export interface PreviewProps {
  imageUrl?: string;
  onConfirm?: () => void;
  onRetake?: () => void;
}

const PreviewComponent = ({ imageUrl, onConfirm, onRetake }: PreviewProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleRetake = () => {
    if (onRetake) {
      onRetake();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Previsualizar Foto
        </h2>
      </div>

      <div className="bg-gray-100 rounded-2xl shadow-2xl p-8 space-y-4">
        <div className="flex justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Previsualización de la comida"
              className="w-full h-64 object-cover rounded-xl shadow-md"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64 bg-gray-200 rounded-xl">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          )}
        </div>

        {!imageUrl && <p className="text-center text-gray-500">Cargando imagen...</p>}

        <div className="flex gap-4 justify-center pt-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!imageUrl}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
            aria-label="Analizar imagen de comida"
          >
            Analizar
          </button>
          <button
            type="button"
            onClick={handleRetake}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Tomar otra foto"
          >
            Reintentar
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500 border-t border-gray-100 pt-4">
          <p>Verifica que la comida sea visible en la imagen</p>
          <p>Click en "Analizar" para procesar con IA</p>
        </div>
      </div>
    </div>
  );
};

export default PreviewComponent;
