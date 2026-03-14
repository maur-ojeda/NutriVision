import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, RefreshCw, Upload } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';

interface CameraCaptureProps {
  onCapture: (image: string) => void;
  onError?: (error: string) => void;
}

export default function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleFileUpload, loading } = useCamera();
  const [useFileInput, setUseFileInput] = useState(false);

  const videoConstraints = {
    facingMode: 'environment', // Cámara trasera
    width: 1280,
    height: 720,
  };

  const handleCapture = useCallback(() => {
    if (!webcamRef.current) {
      const errorMsg = 'La cámara no está iniciada';
      if (onError) onError(errorMsg);
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    } else {
      const errorMsg = 'Error al capturar la imagen';
      if (onError) onError(errorMsg);
    }
  }, [onCapture, onError]);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    let errorMsg: string;

    if (typeof error === 'string') {
      errorMsg = error;
    } else if (error instanceof DOMException) {
      errorMsg =
        error.name === 'NotAllowedError'
          ? 'No tenemos acceso a la cámara. Por favor permite el acceso y vuelve a intentar.'
          : error.name === 'NotFoundError'
            ? 'No se encontró ninguna cámara. Por favor intenta con un dispositivo que tenga cámara.'
            : 'Error al acceder a la cámara: ' + error.message;
    } else {
      errorMsg = 'Error desconocido al acceder a la cámara';
    }

    if (onError) onError(errorMsg);
  }, [onError]);

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const base64 = await handleFileUpload(file);
    if (base64) {
      onCapture(base64);
    } else if (onError) {
      onError('Error al procesar la imagen seleccionada');
    }
  }, [handleFileUpload, onCapture, onError]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Capturar Foto de Comida
        </h2>
        <div className="flex gap-2 mt-2" role="tablist">
          <button
            type="button"
            onClick={() => setUseFileInput(false)}
            role="tab"
            aria-selected={!useFileInput}
            aria-controls="camera-panel"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !useFileInput
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cámara
          </button>
          <button
            type="button"
            onClick={() => setUseFileInput(true)}
            role="tab"
            aria-selected={useFileInput}
            aria-controls="file-panel"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              useFileInput
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Subir Archivo
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-2xl shadow-2xl p-8 space-y-4">
        {!useFileInput ? (
          <div id="camera-panel" role="tabpanel" aria-labelledby="camera-tab">
            <div className="flex justify-center">
              <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-md">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={handleUserMediaError}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button
                type="button"
                onClick={handleCapture}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Capturar foto con la cámara"
              >
                <CameraIcon className="h-5 w-5" />
                Capturar Foto
              </button>
            </div>
          </div>
        ) : (
          <div id="file-panel" role="tabpanel" aria-labelledby="file-tab">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Seleccionar archivo de imagen"
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-green-500 hover:bg-green-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Subir imagen de comida desde tu dispositivo"
              >
                <Upload className="h-16 w-16 text-gray-400" />
                <p className="text-gray-600 text-center px-4">
                  Haz click para seleccionar una imagen de tu comida
                </p>
                <p className="text-sm text-gray-400">JPG, PNG hasta 10MB</p>
              </button>
            </div>

            {loading && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-green-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <p>Procesando imagen...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500 border-t border-gray-100 pt-4">
          {!useFileInput ? (
            <>
              <p>Asegúrate de que la comida esté bien iluminada y visible</p>
              <p>Usa la cámara trasera para mejor calidad</p>
            </>
          ) : (
            <>
              <p>Sube una foto de tu comida existente</p>
              <p>La imagen debe mostrar claramente los alimentos</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
