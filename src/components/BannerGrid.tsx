import BannerSimple from './BannerSimple';
import type { Banner } from '../services/banner.service';

interface BannerGridProps {
  banners: Banner[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  onBannerClick?: (banner: Banner) => void;
}

export default function BannerGrid({
  banners,
  columns = 2,
  className = '',
  onBannerClick,
}: BannerGridProps) {
  const validBanners = banners.filter((banner) => banner.imagenUrl);

  if (validBanners.length === 0) {
    return null;
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {validBanners.map((banner) => (
        <BannerSimple
          key={banner.banId}
          banner={banner}
          className="h-48 md:h-64"
          onBannerClick={onBannerClick}
        />
      ))}
    </div>
  );
}
