import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home';
import ProductDetailNew from './pages/ProductDetailNew';
import CategoriaPage from './pages/CategoriaPage';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';
import CarritoPage from './pages/CarritoPage';
import CheckoutPage from './pages/CheckoutPage';
import ListaDeseosPage from './pages/ListaDeseosPage';
import MisPedidos from './pages/MisPedidos';
import DetallePedido from './pages/DetallePedido';
import SobreNosotros from './pages/SobreNosotros';
import Contacto from './pages/Contacto';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/producto/:slug" element={<ProductDetailNew />} />
          <Route path="/categoria/:slug" element={<CategoriaPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          
          {/* Rutas de autenticación (siempre disponibles) */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas protegidas (requieren autenticación) */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <MiCuenta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute>
                <MiCuenta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lista-deseos"
            element={
              <ProtectedRoute>
                <ListaDeseosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <MisPedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos/:id"
            element={
              <ProtectedRoute>
                <DetallePedido />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
