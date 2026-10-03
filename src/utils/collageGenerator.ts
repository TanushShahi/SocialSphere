/**
 * Combines multiple images into a single vertical 9:16 layout collage frame (Instagram Story format)
 */
export async function generateStoryCollage(imageUrls: string[]): Promise<string> {
  if (!imageUrls || imageUrls.length === 0) return '';
  if (imageUrls.length === 1) return imageUrls[0];

  return new Promise((resolve, reject) => {
    // Canvas dimensions: 1080 x 1920 (9:16 vertical story)
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return resolve(imageUrls[0]);
    }

    // Fill celestial background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const count = Math.min(imageUrls.length, 4);
    const urlsToLoad = imageUrls.slice(0, count);

    urlsToLoad.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImages[index] = img;
        loadedCount++;
        if (loadedCount === count) {
          drawLayout();
        }
      };
      img.onerror = () => {
        // Fallback placeholder
        loadedCount++;
        if (loadedCount === count) {
          drawLayout();
        }
      };
      img.src = url;
    });

    function drawCoverImage(
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number,
      radius = 16
    ) {
      if (!img || !img.width) return;
      ctx!.save();
      
      // Rounded rect clip
      ctx!.beginPath();
      ctx!.moveTo(x + radius, y);
      ctx!.arcTo(x + w, y, x + w, y + h, radius);
      ctx!.arcTo(x + w, y + h, x, y + h, radius);
      ctx!.arcTo(x, y + h, x, y, radius);
      ctx!.arcTo(x, y, x + w, y, radius);
      ctx!.closePath();
      ctx!.clip();

      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let renderW = w;
      let renderH = h;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > targetRatio) {
        renderH = h;
        renderW = h * imgRatio;
        offsetX = -(renderW - w) / 2;
      } else {
        renderW = w;
        renderH = w / imgRatio;
        offsetY = -(renderH - h) / 2;
      }

      ctx!.drawImage(img, x + offsetX, y + offsetY, renderW, renderH);
      ctx!.restore();
    }

    function drawLayout() {
      const pad = 24;
      const gap = 16;
      const totalW = canvas.width - pad * 2;
      const totalH = canvas.height - pad * 2;

      if (count === 2) {
        // 2 vertical split rows
        const slotH = (totalH - gap) / 2;
        drawCoverImage(loadedImages[0], pad, pad, totalW, slotH, 24);
        drawCoverImage(loadedImages[1], pad, pad + slotH + gap, totalW, slotH, 24);
      } else if (count === 3) {
        // 1 large top (55%), 2 bottom split side-by-side (45%)
        const topH = totalH * 0.54;
        const botH = totalH - topH - gap;
        const halfW = (totalW - gap) / 2;

        drawCoverImage(loadedImages[0], pad, pad, totalW, topH, 24);
        drawCoverImage(loadedImages[1], pad, pad + topH + gap, halfW, botH, 24);
        drawCoverImage(loadedImages[2], pad + halfW + gap, pad + topH + gap, halfW, botH, 24);
      } else {
        // 4 grid (2x2)
        const halfW = (totalW - gap) / 2;
        const halfH = (totalH - gap) / 2;

        drawCoverImage(loadedImages[0], pad, pad, halfW, halfH, 24);
        drawCoverImage(loadedImages[1], pad + halfW + gap, pad, halfW, halfH, 24);
        drawCoverImage(loadedImages[2], pad, pad + halfH + gap, halfW, halfH, 24);
        drawCoverImage(loadedImages[3], pad + halfW + gap, pad + halfH + gap, halfW, halfH, 24);
      }

      // Add small watermarked signature in bottom right
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx!.font = '600 24px sans-serif';
      ctx!.fillText('Social Sphere Layout', pad + 16, canvas.height - pad - 16);

      try {
        const resultUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(resultUrl);
      } catch (err) {
        console.error('Failed to export collage canvas:', err);
        resolve(imageUrls[0]);
      }
    }
  });
}
