/**
 * Cached Base64 College Logo Helper for PDF Generators (jsPDF)
 * TGPCOP Students Council
 */

const LOCAL_LOGO_URL = '/logo.jpg';
const CLOUDINARY_LOGO_URL = 'https://res.cloudinary.com/dzbbqslbe/image/upload/v1773854898/IMG-20261008-WA0059_sq1kox.jpg';

let cachedLogoBase64: string | null = null;

/**
 * Loads the college logo as a base64 Data URL for embedding into jsPDF documents.
 * Prioritizes local `/logo.jpg` with instantaneous fallback to Cloudinary.
 */
export async function getLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;

  const tryFetch = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  try {
    // 1. Try local asset first (0ms latency in browser)
    let dataUrl = await tryFetch(LOCAL_LOGO_URL);

    // 2. Fallback to Cloudinary CDN
    if (!dataUrl) {
      dataUrl = await tryFetch(CLOUDINARY_LOGO_URL);
    }

    if (dataUrl) {
      cachedLogoBase64 = dataUrl;
      return dataUrl;
    }
  } catch (err) {
    console.warn('Could not load base64 logo for PDF:', err);
  }

  return null;
}
