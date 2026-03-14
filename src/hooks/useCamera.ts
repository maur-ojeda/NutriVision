import { useState, useCallback } from 'react';

interface UseCameraReturn {
  stream: MediaStream | null;
  error: string | null;
  loading: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  handleFileUpload: (file: File) => Promise<string | null>;
}

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('No tenemos acceso a la cámara. Por favor permite el acceso y vuelve a intentar.');
        } else if (err.name === 'NotFoundError') {
          setError('No se encontró ninguna cámara. Por favor intenta con un dispositivo que tenga cámara.');
        } else if (err.name === 'NotReadableError') {
          setError('No se pudo acceder a la cámara. Quizás otra app la está usando.');
        } else {
          setError('Error al acceder a la cámara: ' + err.message);
        }
      } else {
        setError('Error desconocido al acceder a la cámara');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleFileUpload = useCallback(async (file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)');
        return null;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('La imagen es muy grande. Por favor selecciona una imagen menor a 10MB.');
        return null;
      }

      // Read file and convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = () => {
          setError('Error al leer el archivo de imagen');
          reject(new Error('Error reading file'));
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      if (err instanceof Error) {
        setError('Error al procesar la imagen: ' + err.message);
      } else {
        setError('Error desconocido al procesar la imagen');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stream,
    error,
    loading,
    startCamera,
    stopCamera,
    handleFileUpload,
  };
}
