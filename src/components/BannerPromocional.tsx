import { Link } from 'react-router';
import type { Banner } from '../services/banner.service';
import { getImageUrl } from '../utils/image.utils';
import { bannerService } from '../services/banner.service';

interface BannerPromocionalProps {
  banner: Banner;
  className?: string;
  variant?: 'default' | 'compact';
}

export default function BannerPromocional({ banner, className = '', variant = 'default' }: BannerPromocionalProps) {
  const handleBannerClick = async () => {
    // Incrementar contador de clics
    try {
      await bannerService.incrementarClics(banner.banId);
    } catch (error) {
      // Error al incrementar clics
    }

    // Redirigir si hay URL de destino
    if (banner.urlDestino) {
      if (banner.urlDestino.startsWith('http')) {
        window.open(banner.urlDestino, '_blank');
      } else {
        window.location.href = banner.urlDestino;
      }
    }
  };

  const isCompact = variant === 'compact';

  const contenido = (
    <div
      className={`group relative overflow-hidden ${isCompact ? 'rounded-3xl' : 'rounded-2xl'} ${
        banner.urlDestino ? 'cursor-pointer transition-all duration-500 hover:-translate-y-2' : ''
      } ${className}`}
      onClick={handleBannerClick}
    >
      {/* Contenedor principal con diseño tipo card moderno */}
      <div className={`relative w-full ${isCompact ? 'min-h-[280px] md:min-h-[340px] lg:min-h-[380px]' : 'h-full min-h-[300px] md:min-h-[400px]'} bg-white shadow-lg hover:shadow-2xl transition-shadow duration-500`}>
        {/* Imagen de fondo con efecto parallax */}
        {banner.imagenUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={getImageUrl(banner.imagenUrl)}
              alt={banner.titulo || 'Banner promocional'}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getImageUrl(null);
              }}
            />
            {/* Overlay con gradiente vertical más sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${isCompact ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-blue-600 via-purple-600 to-purple-700'}`}></div>
        )}

        {/* Contenido con diseño tipo card flotante */}
        <div className={`relative z-10 h-full flex flex-col justify-end ${
          isCompact 
            ? 'p-6 md:p-8 lg:p-10 min-h-[280px] md:min-h-[340px] lg:min-h-[380px]' 
            : 'p-8 md:p-12 lg:p-16 min-h-[300px] md:min-h-[400px]'
        }`}>
          {/* Badge decorativo superior */}
          {banner.urlDestino && (
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          <div className="space-y-3 md:space-y-4 max-w-xl">
            {banner.titulo && (
              <h2 className={`${
                isCompact 
                  ? 'text-2xl md:text-3xl lg:text-4xl' 
                  : 'text-3xl md:text-4xl lg:text-5xl'
              } font-extrabold text-white leading-tight drop-shadow-lg`}>
                {banner.titulo}
              </h2>
            )}
            {banner.descripcion && (
              <p className={`${
                isCompact 
                  ? 'text-sm md:text-base lg:text-lg line-clamp-2' 
                  : 'text-lg md:text-xl'
              } text-gray-100/90 leading-relaxed drop-shadow-md`}>
                {banner.descripcion}
              </p>
            )}
            {banner.urlDestino && (
              <div className="pt-2">
                <span className={`inline-flex items-center gap-2 ${
                  isCompact 
                    ? 'px-6 py-3 text-sm md:text-base' 
                    : 'px-8 py-3.5 text-base md:text-lg'
                } bg-white text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:px-10`}>
                  Explorar
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Efecto de borde inferior decorativo */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        
        {/* Partículas decorativas en las esquinas */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-all duration-500"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 group-hover:bg-white/10 transition-all duration-500"></div>
      </div>
    </div>
  );

  // Si tiene URL de destino y no es un enlace externo, envolver en Link
  if (banner.urlDestino && !banner.urlDestino.startsWith('http')) {
    return (
      <Link to={banner.urlDestino} className="block">
        {contenido}
      </Link>
    );
  }

  return contenido;
}
