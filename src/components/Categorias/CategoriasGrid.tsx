import CategoriaCard from './CategoriaCard';
import type { CategoriaArbol } from '../../services/categoria.service';

interface CategoriasGridProps {
  categorias: CategoriaArbol[];
  titulo?: string;
}

export default function CategoriasGrid({ 
  categorias, 
  titulo = 'Categorías' 
}: CategoriasGridProps) {
  // Filtrar solo categorías padre activas
  const categoriasPadre = categorias.filter(cat => cat.activo);

  if (categoriasPadre.length === 0) {
    return null;
  }

  return (
    <section className="sec-banner bg0 p-t-80 p-b-50">
      <div className="container">
        <div className="p-b-10">
          <h3 className="ltext-103 cl5">
            {titulo}
          </h3>
        </div>

        <div className="row">
          {categoriasPadre.map((categoria) => (
            <CategoriaCard key={categoria.catId} categoria={categoria} />
          ))}
        </div>
      </div>
    </section>
  );
}
