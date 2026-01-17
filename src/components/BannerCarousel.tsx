import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerService, type Banner } from '../services/banner.service';

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
  onBannerClick?: (banner: Banner) => void;
}

export default function BannerCarousel({
  banners,
  autoPlay = true,
  interval = 5000,
  onBannerClick,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filtrar banners válidos
  const validBanners = banners.filter((banner) => banner.imagenUrl);

  useEffect(() => {
    if (validBanners.length === 0) return;

    if (autoPlay && !isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validBanners.length);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, isHovered, validBanners.length]);

  if (validBanners.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validBanners.length) % validBanners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleBannerClick = async (banner: Banner) => {
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
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banners */}
      <div className="relative w-full h-full">
        {validBanners.map((banner, index) => (
          <div
            key={banner.banId}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`w-full h-full cursor-pointer ${banner.urlDestino ? 'hover:opacity-95' : ''}`}
              onClick={() => handleBannerClick(banner)}
            >
              <img
                src={banner.imagenUrl}
                alt={banner.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x600?text=Banner';
                }}
              />
              {(banner.titulo || banner.descripcion) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end">
                  <div className="w-full p-6 md:p-8 text-white">
                    {banner.titulo && (
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                        {banner.titulo}
                      </h3>
                    )}
                    {banner.descripcion && (
                      <p className="text-sm md:text-base lg:text-lg text-gray-100 max-w-2xl drop-shadow-lg">
                        {banner.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navegación anterior/siguiente */}
      {validBanners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="Banner siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicadores */}
      {validBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {validBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir al banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
