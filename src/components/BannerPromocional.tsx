import { Link } from 'react-router';
import type { Banner } from '../services/banner.service';
import { getImageUrl } from '../utils/image.utils';
import { bannerService } from '../services/banner.service';

interface BannerPromocionalProps {
  banner: Banner;
  className?: string;
}

export default function BannerPromocional({ banner, className = '' }: BannerPromocionalProps) {
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

  const contenido = (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-gray-800 to-gray-900 ${banner.urlDestino ? 'cursor-pointer hover:shadow-2xl transition-all duration-300' : ''} ${className}`}
      onClick={handleBannerClick}
    >
      {/* Imagen de fondo */}
      {banner.imagenUrl ? (
        <div className="relative w-full h-full min-h-[300px] md:min-h-[400px]">
          <img
            src={getImageUrl(banner.imagenUrl)}
            alt={banner.titulo || 'Banner promocional'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getImageUrl(null);
            }}
          />
          {/* Overlay para mejor legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-full min-h-[300px] md:min-h-[400px] bg-gradient-to-br from-blue-600 to-purple-700"></div>
      )}

      {/* Contenido del banner */}
      <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-center h-full min-h-[300px] md:min-h-[400px]">
        {banner.titulo && (
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {banner.titulo}
          </h2>
        )}
        {banner.descripcion && (
          <p className="text-lg md:text-xl text-gray-100 mb-6 max-w-2xl drop-shadow-lg">
            {banner.descripcion}
          </p>
        )}
        {banner.urlDestino && (
          <div className="mt-4">
            <span className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
              Ver más →
            </span>
          </div>
        )}
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
