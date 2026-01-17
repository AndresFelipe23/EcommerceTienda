# Frontend Tienda - Ecommerce

Frontend para clientes de la tienda ecommerce. Este proyecto es la interfaz pública donde los clientes pueden ver productos, agregar al carrito, realizar pedidos, etc.

## 🚀 Tecnologías

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Enrutamiento
- **SweetAlert2** - Notificaciones

## 📦 Instalación

```bash
# Instalar dependencias
npm install
# o
bun install
```

## ⚙️ Configuración

1. **Crear archivo `.env`** basado en `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5087/api
```

2. **Para producción**, actualiza la URL:

```env
VITE_API_BASE_URL=https://api.tudominio.com/api
```

## 🏃 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
# o
bun run dev
```

El proyecto estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## 🏗️ Estructura del Proyecto

```
src/
├── config/
│   └── api.config.ts          # Configuración de endpoints de la API
├── services/
│   ├── api.service.ts         # Cliente HTTP base
│   ├── auth.service.ts         # Servicio de autenticación
│   ├── producto.service.ts     # Servicio de productos
│   └── categoria.service.ts    # Servicio de categorías
├── types/
│   └── api.types.ts            # Tipos TypeScript para la API
└── App.tsx                     # Componente principal
```

## 🔌 Consumo de la API

### Ejemplo: Obtener productos

```typescript
import { productoService } from './services/producto.service';

// Listar productos
const response = await productoService.listar();
if (response.exito && response.datos) {
  console.log('Productos:', response.datos);
}

// Obtener producto por slug
const producto = await productoService.obtenerPorSlug('mi-producto');
```

### Ejemplo: Obtener categorías

```typescript
import { categoriaService } from './services/categoria.service';

// Obtener árbol de categorías
const categorias = await categoriaService.obtenerArbol();
```

### Ejemplo: Autenticación

```typescript
import { authService } from './services/auth.service';

// Login
const response = await authService.login({
  email: 'cliente@example.com',
  contrasena: 'password123'
});

// Verificar si está autenticado
if (authService.isAuthenticated()) {
  const usuario = authService.getUsuario();
  console.log('Usuario:', usuario);
}

// Logout
authService.logout();
```

## 🌐 Multi-Tenancy

Este frontend está diseñado para funcionar con el sistema multi-tenant:

- **Resolución automática**: El middleware del backend resuelve la tienda por dominio
- **Sin configuración manual**: No necesitas especificar el `tiendaId` en cada petición
- **Dominio específico**: Cada tienda tiene su propio dominio (ej: `menusqr.site`)

## 📝 Notas

- El frontend consume la API que resuelve automáticamente la tienda por dominio
- Los endpoints públicos (productos, categorías) no requieren autenticación
- Los endpoints de usuario (carrito, pedidos) requieren autenticación con JWT
