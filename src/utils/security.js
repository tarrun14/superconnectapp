/**
 * Validates and sanitizes a URL to ensure it starts with http://, https://, /, or data:image/
 * Falls back to null if the URL is unsafe (e.g. javascript:...).
 * This ensures components can gracefully fallback to their default avatar/cover divs.
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim().toLowerCase();
  
  if (
    trimmed.startsWith('https://') || 
    trimmed.startsWith('http://') || 
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  ) {
    return url; // return original to preserve casing
  }
  
  return null;
};
