import { useEffect, useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { tiendaService } from '../services/tienda.service';
import { categoriaService, type CategoriaArbol } from '../services/categoria.service';

export default function SobreNosotros() {
  const [categorias, setCategorias] = useState<CategoriaArbol[]>([]);
  const [tiendaNombre, setTiendaNombre] = useState('Tienda');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const tiendaResponse = await tiendaService.obtenerActual();
        if (tiendaResponse.exito && tiendaResponse.datos) {
          setTiendaNombre(tiendaResponse.datos.nombre);
          const tiendaId = tiendaResponse.datos.tieId;
          
          const categoriasResponse = await categoriaService.obtenerArbol(tiendaId);
          if (categoriasResponse.exito && categoriasResponse.datos) {
            setCategorias(categoriasResponse.datos);
          }
        }
      } catch (error) {
        // Error al cargar datos
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar categorias={categorias} tiendaNombre={tiendaNombre} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Sobre Nosotros
            </h1>
            <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
              Conoce nuestra historia y compromiso con la calidad
            </p>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Misión */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Misión</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                En {tiendaNombre}, nos dedicamos a ofrecer productos de la más alta calidad 
                que satisfagan las necesidades de nuestros clientes. Nuestro compromiso es 
                brindar una experiencia de compra excepcional, con atención personalizada y 
                un servicio al cliente de primer nivel.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Trabajamos día a día para ser tu tienda de confianza, donde encuentres 
                productos que mejoren tu vida y la de tus seres queridos.
              </p>
            </section>

            {/* Visión */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Visión</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Aspiramos a ser reconocidos como la tienda líder en nuestro sector, 
                destacándonos por la excelencia en el servicio, la innovación constante 
                y el compromiso con la satisfacción del cliente.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Buscamos crecer de manera sostenible, manteniendo siempre nuestros valores 
                de honestidad, calidad y responsabilidad social.
              </p>
            </section>

            {/* Valores */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestros Valores</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Calidad</h3>
                  <p className="text-gray-700">
                    Seleccionamos cuidadosamente cada producto para garantizar la mejor calidad.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Confianza</h3>
                  <p className="text-gray-700">
                    Construimos relaciones duraderas basadas en la transparencia y honestidad.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Compromiso</h3>
                  <p className="text-gray-700">
                    Estamos comprometidos con la satisfacción total de nuestros clientes.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovación</h3>
                  <p className="text-gray-700">
                    Buscamos constantemente nuevas formas de mejorar y ofrecer mejores servicios.
                  </p>
                </div>
              </div>
            </section>

            {/* Historia */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Historia</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {tiendaNombre} nació con la visión de crear un espacio donde los clientes 
                pudieran encontrar productos de calidad a precios justos. Desde nuestros inicios, 
                hemos crecido gracias a la confianza y el apoyo de nuestros clientes.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Hoy, seguimos trabajando con la misma pasión y dedicación, adaptándonos a las 
                necesidades del mercado moderno mientras mantenemos nuestros valores fundamentales.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
