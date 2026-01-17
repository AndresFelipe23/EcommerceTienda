import { bannerService, type Banner } from '../services/banner.service';

interface BannerSimpleProps {
  banner: Banner;
  className?: string;
  onBannerClick?: (banner: Banner) => void;
}

export default function BannerSimple({ banner, className = '', onBannerClick }: BannerSimpleProps) {
  const handleBannerClick = async () => {
    // Incrementar contador de clics
    try {
      await bannerService.incrementarClics(banner.banId);
    } catch (error) {
      // Error al incrementar clics
    }

    // Redirigir si hay URL de destino
    if (banner.urlDestino) {
      window.open(banner.urlDestino, '_blank');
    }

    // Llamar callback si existe
    if (onBannerClick) {
      onBannerClick(banner);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-md ${banner.urlDestino ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={handleBannerClick}
    >
      <img
        src={banner.imagenUrl}
        alt={banner.titulo}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Banner';
        }}
      />
      {(banner.titulo || banner.descripcion) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end">
          <div className="w-full p-4 md:p-6 text-white">
            {banner.titulo && (
              <h3 className="text-xl md:text-2xl font-bold mb-1 drop-shadow-lg">{banner.titulo}</h3>
            )}
            {banner.descripcion && (
              <p className="text-sm md:text-base text-gray-100 drop-shadow-lg">{banner.descripcion}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
