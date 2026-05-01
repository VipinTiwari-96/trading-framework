const MAX_SCREENSHOT_SIDE = 1600;
const JPEG_QUALITY = 0.72;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(file);
  });

const loadImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = source;
  });

export const compressScreenshot = async (file: File) => {
  const original = await readAsDataUrl(file);
  return compressScreenshotDataUrl(original);
};

export const compressScreenshotDataUrl = async (original: string) => {
  const image = await loadImage(original);
  const scale = Math.min(1, MAX_SCREENSHOT_SIDE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return original;

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const compressed = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return compressed.length < original.length ? compressed : original;
};
