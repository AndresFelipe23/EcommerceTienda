import React from 'react';
import type { CategoriaArbol } from '../services/categoria.service';

interface CategoriaCardProps {
  categoria: CategoriaArbol;
  onClick?: (categoria: CategoriaArbol) => void;
}

export default function CategoriaCard({ categoria, onClick }: CategoriaCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(categoria);
    } else {
      // Navegar a la página de categoría por slug
      window.location.href = `/categoria/${categoria.slug}`;
    }
  };

  const hasSubcategories = categoria.subCategorias && categoria.subCategorias.length > 0;
  const hasImage = categoria.imagenUrl && categoria.imagenUrl.trim() !== '';

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
    >
      {hasImage ? (
        // Diseño con imagen
        <>
          {/* Imagen de la categoría */}
          <div className="relative h-56 bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <img
              src={categoria.imagenUrl}
              alt={categoria.nombre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                `;
              }}
            />
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Contenido */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                {categoria.nombre}
              </h3>
              {hasSubcategories && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full whitespace-nowrap">
                  {categoria.subCategorias!.length}
                </span>
              )}
            </div>
            
            {hasSubcategories && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {categoria.subCategorias!.length} subcategoría{categoria.subCategorias!.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Botón de acción */}
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
              <span>Ver productos</span>
              <svg
                className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </>
      ) : (
        // Diseño sin imagen - más compacto y profesional
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icono de categoría */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {categoria.nombre}
                </h3>
                {hasSubcategories && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full whitespace-nowrap flex-shrink-0">
                    {categoria.subCategorias!.length}
                  </span>
                )}
              </div>
              
              {hasSubcategories && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {categoria.subCategorias!.length} subcategoría{categoria.subCategorias!.length !== 1 ? 's' : ''} disponible{categoria.subCategorias!.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* Botón de acción */}
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                <span>Explorar categoría</span>
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}
