import React from 'react';
import CategoriaCard from './CategoriaCard';
import type { CategoriaArbol } from '../services/categoria.service';

interface CategoriasGridProps {
  categorias: CategoriaArbol[];
  titulo?: string;
  mostrarSoloActivas?: boolean;
}

export default function CategoriasGrid({ 
  categorias, 
  titulo = 'Categorías',
  mostrarSoloActivas = true 
}: CategoriasGridProps) {
  // Filtrar solo categorías padre activas (no subcategorías)
  // Las categorías padre son las que están en el nivel raíz del árbol
  const categoriasFiltradas = categorias
    .filter(cat => {
      // Solo categorías activas si es necesario
      if (mostrarSoloActivas && !cat.activo) return false;
      // Solo categorías padre (las que están en el nivel raíz)
      return true; // Todas las del array son categorías padre
    });

  if (categoriasFiltradas.length === 0) {
    return null;
  }

  return (
    <section className="mb-16 relative">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      {/* Encabezado mejorado */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Navegación
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {titulo}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Descubre nuestra amplia selección de productos organizados en {categoriasFiltradas.length} categoría{categoriasFiltradas.length !== 1 ? 's' : ''} cuidadosamente curada{categoriasFiltradas.length !== 1 ? 's' : ''}
        </p>
        
        {/* Línea decorativa */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-indigo-500" />
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <div className="h-px w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-500" />
        </div>
      </div>

      {/* Grid mejorado con animaciones escalonadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {categoriasFiltradas.map((categoria, index) => (
          <div
            key={categoria.catId}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
            }}
          >
            <CategoriaCard categoria={categoria} />
          </div>
        ))}
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </section>
  );
}
