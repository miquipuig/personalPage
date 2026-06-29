// Convert an image blob to JPEG (flattening transparency onto white). Used for
// drag/drop & paste uploads in the editor, so they're compressed like the
// media-library uploads. Returns the original blob if conversion isn't possible.
export async function toJpeg(file: Blob, quality = 0.82): Promise<Blob> {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b || file), 'image/jpeg', quality));
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
