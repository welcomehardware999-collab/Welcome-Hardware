// Centralized asset path resolution ensuring compatibility with
// both root domain hosting (http://localhost:3000) and GitHub Pages (/Welcome-Hardware/)

const rawBase = (import.meta as any).env?.BASE_URL || '/';
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export const BASE_URL = normalizedBase;

export const LOGO_URL = `${normalizedBase}welcome-hardware-logo.svg`;

export function getAssetUrl(path?: string): string {
  if (!path) return LOGO_URL;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // If it's the logo, return the canonical LOGO_URL
  if (path.includes('welcome-hardware-logo.svg')) {
    return LOGO_URL;
  }
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}${clean}`;
}
