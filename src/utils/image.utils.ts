/**
 * Utilidades para manejo de imágenes
 */

/**
 * Construye una URL completa de imagen
 * Si la URL ya es absoluta (http:// o https://), la retorna tal cual
 * Si es relativa, la construye usando el baseURL del backend
 */
export function getImageUrl(imageUrl: string | undefined | null): string {
  // Si no hay URL, retornar imagen por defecto
  if (!imageUrl) {
    return '/images/product-01.jpg';
  }

  // Si ya es una URL completa (empieza con http:// o https://), retornarla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si empieza con /, es relativa al dominio actual
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Si es relativa al backend, construir URL completa
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5087/api';
  const backendBaseUrl = apiBaseUrl.replace('/api', '');

  // Asegurarse de no duplicar barras
  const url = `${backendBaseUrl}/${imageUrl.replace(/^\//, '')}`;

  return url;
}

/**
 * Obtiene la URL de thumbnail o la imagen original si no hay thumbnail
 */
export function getThumbnailUrl(thumbnailUrl: string | undefined | null, originalUrl: string | undefined | null): string {
  return getImageUrl(thumbnailUrl) || getImageUrl(originalUrl);
}
