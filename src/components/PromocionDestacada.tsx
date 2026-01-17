import { Link } from 'react-router';
import type { PromocionAplicable } from '../services/promocion.service';
import { getImageUrl } from '../utils/image.utils';

interface PromocionDestacadaProps {
  promocion: PromocionAplicable & { 
    descripcion?: string; 
    fechaInicio?: string;
    nombre: string;
    tipo: string;
    valorDescuento: number;
    fechaFin: string;
  };
  productosDestacados?: Array<{
    proId: string;
    nombre: string;
    slug: string;
    precioBase: number;
    precioConDescuento: number;
    imagenPrincipal?: string;
  }>;
  className?: string;
}

export default function PromocionDestacada({ 
  promocion, 
  productosDestacados = [],
  className = '' 
}: PromocionDestacadaProps) {
  const formatearDescuento = () => {
    if (promocion.tipo === 'Porcentaje') {
      return `-${promocion.valorDescuento}%`;
    } else if (promocion.tipo === 'MontoFijo') {
      return `-$${promocion.valorDescuento.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return 'Oferta especial';
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-gradient-to-br from-red-600 via-red-700 to-orange-600 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      <div className="relative p-8 md:p-12 lg:p-16">
        {/* Contenido principal de la promoción */}
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
              🎉 OFERTA ESPECIAL
            </span>
            <span className="px-4 py-2 bg-yellow-400 text-red-900 rounded-full text-sm font-bold">
              {formatearDescuento()}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
            {promocion.nombre}
          </h2>
          
          {(promocion as any).descripcion && (
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl drop-shadow-lg">
              {(promocion as any).descripcion}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Válido hasta {formatearFecha(promocion.fechaFin)}</span>
            </div>
          </div>
          
          <Link
            to="/productos"
            className="inline-block px-8 py-4 bg-white font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ color: '#000000' }}
          >
            Ver Ofertas →
          </Link>
        </div>

        {/* Productos destacados (si hay) */}
        {productosDestacados.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {productosDestacados.slice(0, 4).map((producto) => (
              <Link
                key={producto.proId}
                to={`/producto/${producto.slug}`}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all group"
              >
                <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-white/20">
                  {producto.imagenPrincipal ? (
                    <img
                      src={getImageUrl(producto.imagenPrincipal)}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getImageUrl(null);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                  {producto.nombre}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-yellow-300">
                    ${producto.precioConDescuento.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  {producto.precioBase > producto.precioConDescuento && (
                    <span className="text-xs text-white/70 line-through">
                      ${producto.precioBase.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
