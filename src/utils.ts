/**
 * Formats a number as Nigerian Naira (NGN)
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('NGN', '₦');
}

/**
 * Formats a date string into a readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Resolves the absolute backend API URL.
 * If running on a third-party domain (like Vercel or local Vite port 5173),
 * this falls back to the live pre-production Cloud Run backend.
 */
export function getApiUrl(path: string): string {
  // Always keep leading slash uniform
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  
  const metaEnv = (import.meta as any).env || {};
  if (metaEnv.VITE_API_URL) {
    return `${metaEnv.VITE_API_URL}${formattedPath}`;
  }

  const hostname = window.location.hostname;
  const isCloudRun = hostname.endsWith('.run.app') || hostname.endsWith('.aistudio-dev.run.app') || hostname.includes('aistudio');
  const isPort3000 = window.location.port === '3000';

  if (!isCloudRun && !isPort3000) {
    // We are on Vercel or standard local Vite (port 5173) - point to the live backend container
    const liveBackendUrl = 'https://ais-pre-ynj6fgeaskzdrvh6nfd6j6-820114844945.europe-west2.run.app';
    return `${liveBackendUrl}${formattedPath}`;
  }

  return formattedPath;
}
