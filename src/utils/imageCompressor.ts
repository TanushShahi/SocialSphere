/**
 * Downscales and compresses images to prevent exceeding memory or storage quotas.
 * Converts multi-megabyte camera photos into crisp, lightweight (~60-90KB) JPEGs.
 * Uses zero-RAM URL.createObjectURL instead of loading full raw files into base64.
 */
export async function compressImage(
  imageSource: File | Blob | string,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    let objectUrl = '';
    const img = new Image();

    // Only set crossOrigin for remote http/https URLs to avoid CORS taint on local blobs
    if (typeof imageSource === 'string' && (imageSource.startsWith('http://') || imageSource.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }

    const cleanup = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
      }
    };

    // Safety timeout in case image loading hangs on mobile
    const timeout = setTimeout(() => {
      cleanup();
      resolve(typeof imageSource === 'string' ? imageSource : '');
    }, 4000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        let { width, height } = img;
        if (!width || !height) {
          cleanup();
          return resolve(typeof imageSource === 'string' ? imageSource : '');
        }

        // Calculate constrained dimensions (max 1080x1080 for crisp mobile display)
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return resolve(typeof imageSource === 'string' ? imageSource : '');
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        cleanup();
        resolve(compressedDataUrl);
      } catch (e) {
        console.warn('Canvas compression fallback:', e);
        cleanup();
        resolve(typeof imageSource === 'string' ? imageSource : '');
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(typeof imageSource === 'string' ? imageSource : '');
    };

    if (imageSource instanceof File || imageSource instanceof Blob) {
      try {
        objectUrl = URL.createObjectURL(imageSource);
        img.src = objectUrl;
      } catch {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = (e.target?.result as string) || '';
        };
        reader.onerror = () => {
          clearTimeout(timeout);
          resolve('');
        };
        reader.readAsDataURL(imageSource);
      }
    } else if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      clearTimeout(timeout);
      resolve('');
    }
  });
}
