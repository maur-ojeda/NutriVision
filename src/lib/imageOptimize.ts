const MAX_WIDTH = 640;
const WEBP_QUALITY = 0.75;

/**
 * Downscales an image to at most MAX_WIDTH (never upscales) and re-encodes it
 * as WebP, to cut Gemini token cost and storage size before the image ever
 * leaves the client.
 */
export function optimizeImage(source: string | File, maxWidth = MAX_WIDTH, quality = WEBP_QUALITY): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = source instanceof File ? URL.createObjectURL(source) : null;
    const src = objectUrl ?? (source as string);

    const img = new Image();
    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto 2D del canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', quality));
    };
    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo cargar la imagen para optimizarla'));
    };
    img.src = src;
  });
}
