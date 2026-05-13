/**
 * Load claim images for vision/OCR. Handles data URLs, direct fetch, and dev-server proxy (CORS bypass).
 */

const PROXY_PATH = '/__zathura_proxy_image';

function parseDataUrlBase64(dataUrl: string): string | null {
  const m = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl.trim());
  return m ? m[2]!.replace(/\s/g, '') : null;
}

function blobToBase64(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

async function fetchAsBlob(url: string): Promise<Blob | null> {
  try {
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) return null;
    return await resp.blob();
  } catch {
    return null;
  }
}

async function fetchViaDevProxy(url: string): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;
  try {
    const proxyUrl = `${window.location.origin}${PROXY_PATH}?url=${encodeURIComponent(url)}`;
    const resp = await fetch(proxyUrl);
    if (!resp.ok) return null;
    return await resp.blob();
  } catch {
    return null;
  }
}

export async function fetchClaimImageAsBase64(url: string): Promise<string | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('data:')) {
    return parseDataUrlBase64(trimmed);
  }

  let blob = await fetchAsBlob(trimmed);
  if (!blob && import.meta.env.DEV) {
    blob = await fetchViaDevProxy(trimmed);
  }

  if (!blob) return null;
  return blobToBase64(blob);
}

export function guessImageMimeFromBase64(base64: string): string {
  const head = base64.slice(0, 12);
  if (head.startsWith('/9j/')) return 'image/jpeg';
  if (head.startsWith('iVBORw0KGgo')) return 'image/png';
  if (head.startsWith('R0lGOD')) return 'image/gif';
  if (head.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
}
