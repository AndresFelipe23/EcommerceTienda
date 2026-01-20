import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import type { MetodoPagoDisponible } from '../../services/metodoPago.service';
import type { DireccionCreate } from '../../services/direccion.service';

interface PagoFormProps {
  metodoPago: MetodoPagoDisponible;
  total: number;
  direccionEnvio: DireccionCreate;
  direccionFacturacion: DireccionCreate;
  onPagoConfirmado: (datosPago: any) => void;
  onCancelar: () => void;
}

export default function PagoForm({
  metodoPago,
  total,
  direccionEnvio,
  direccionFacturacion,
  onPagoConfirmado,
  onCancelar,
}: PagoFormProps) {
  const { usuario } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: '',
    nombre: '',
    vencimiento: '',
    cvv: '',
  });

  // Detectar Mercado Pago de forma más robusta
  const tipoLower = metodoPago.tipo?.toLowerCase() || '';
  const nombreLower = metodoPago.nombre?.toLowerCase() || '';
  const esMercadoPago = tipoLower === 'mercadopago' || 
                       tipoLower.includes('mercadopago') ||
                       nombreLower.includes('mercado pago') ||
                       nombreLower.includes('mercadopago');
  const esTarjetaCredito = metodoPago.tipo === 'TarjetaCredito';
  const esTransferencia = metodoPago.tipo === 'Transferencia';
  const esEfectivo = metodoPago.tipo === 'Efectivo';

  const handlePagarMercadoPago = async () => {
    setIsProcessing(true);
    try {
      // Guardar datos del pedido temporalmente en localStorage
      const datosPedidoTemporal = {
        metodoPagoId: metodoPago.metId,
        direccionEnvio,
        direccionFacturacion,
        total,
        timestamp: Date.now(),
      };
      localStorage.setItem('pedidoTemporal', JSON.stringify(datosPedidoTemporal));

      // Importar dinámicamente el servicio
      const { mercadoPagoService } = await import('../../services/mercadoPago.service');
      
      // Crear preferencia de Mercado Pago
      // Usar window.location.origin para las URLs de redirección
      // El backend detectará si son localhost y no agregará auto_return
      const baseUrl = window.location.origin;
      const emailCliente = usuario?.email || direccionEnvio.telefono || 'cliente@ejemplo.com';
      
      const response = await mercadoPagoService.crearPreferencia({
        // No enviar pedidoId para crear preferencia sin pedido existente
        monto: total,
        descripcion: `Pedido temporal - ${new Date().toLocaleString()}`,
        nombreCliente: `${direccionEnvio.nombre} ${direccionEnvio.apellido}`.trim(),
        emailCliente: emailCliente,
        telefonoCliente: direccionEnvio.telefono || '',
        urlExito: `${baseUrl}/checkout/exito`,
        urlFallo: `${baseUrl}/checkout/fallo`,
        urlPendiente: `${baseUrl}/checkout/pendiente`,
      });

      if (response.exito && response.datos) {
        // Guardar el initPoint en localStorage también
        const initPoint = response.datos.sandboxInitPoint || response.datos.initPoint;
        localStorage.setItem('mercadoPagoInitPoint', initPoint);
        
        // Mostrar mensaje informativo antes de redirigir
        Swal.fire({
          icon: 'info',
          title: 'Redirigiendo a Mercado Pago',
          text: 'Serás redirigido a la página de pago de Mercado Pago para completar tu compra.',
          showConfirmButton: false,
          timer: 2000,
          allowOutsideClick: false,
        });
        
        // Redirigir a Mercado Pago después de un breve delay
        setTimeout(() => {
          window.location.href = initPoint;
        }, 500);
      } else {
        console.error('Error al crear preferencia de Mercado Pago:', response);
        Swal.fire({
          icon: 'error',
          title: 'Error al crear preferencia de pago',
          html: `<p>${response.mensaje || 'Error desconocido al crear la preferencia de pago'}</p>
                 ${response.errores && response.errores.length > 0 
                   ? `<p class="text-sm mt-2">Detalles: ${response.errores.join(', ')}</p>` 
                   : ''}`,
          confirmButtonText: 'Entendido',
          customClass: {
            container: 'z-[9999999]',
            popup: 'z-[9999999]',
          },
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error al procesar pago con Mercado Pago:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al procesar el pago',
        html: `<p>Ocurrió un error al intentar procesar el pago con Mercado Pago.</p>
               <p class="text-sm mt-2">${error instanceof Error ? error.message : 'Error desconocido'}</p>
               <p class="text-xs mt-2 text-gray-500">Por favor, intenta nuevamente o contacta con soporte si el problema persiste.</p>`,
        confirmButtonText: 'Entendido',
        customClass: {
          container: 'z-[9999999]',
          popup: 'z-[9999999]',
        },
      });
      setIsProcessing(false);
    }
  };

  const handlePagarTarjeta = () => {
    // Validar datos de tarjeta
    if (!datosTarjeta.numero || !datosTarjeta.nombre || !datosTarjeta.vencimiento || !datosTarjeta.cvv) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor completa todos los campos de la tarjeta',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Simular procesamiento de pago (en producción, esto se haría con un procesador de pagos real)
    setIsProcessing(true);
    setTimeout(() => {
      onPagoConfirmado({
        metodoPago: 'TarjetaCredito',
        datosPago: {
          ultimos4Digitos: datosTarjeta.numero.slice(-4),
          tipo: 'credito',
        },
      });
    }, 2000);
  };

  const handlePagarTransferencia = () => {
    // Obtener configuración del método de pago
    let qrUrl = '';
    let numeroCuenta = '';
    
    try {
      if (metodoPago.configuracion) {
        const config = JSON.parse(metodoPago.configuracion);
        qrUrl = config.qrUrl || '';
        numeroCuenta = config.numeroCuenta || '';
      }
    } catch (e) {
      console.error('Error al parsear configuración:', e);
    }

    if (!qrUrl) {
      Swal.fire({
        icon: 'error',
        title: 'Error de configuración',
        text: 'El código QR no está configurado para este método de pago. Por favor, contacta al administrador.',
        confirmButtonText: 'Entendido',
      });
      return;
    }
    
    Swal.fire({
      icon: 'info',
      title: 'Código QR de Transferencia',
      html: `
        <div class="text-center">
          <p class="mb-4 text-gray-600">Escanea este código QR con tu banco para realizar la transferencia:</p>
          <div class="bg-gray-100 p-4 rounded-lg inline-block mb-4">
            <img src="${qrUrl}" alt="QR Code" class="w-48 h-48 object-contain mx-auto" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="w-48 h-48 bg-gray-300 flex items-center justify-center text-gray-500" style="display: none;">
              Error al cargar QR
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-2">Monto: $${total.toLocaleString('es-CO')}</p>
          ${numeroCuenta ? `<p class="text-xs text-gray-500 mb-2">Número de cuenta: <strong>${numeroCuenta}</strong></p>` : ''}
          <p class="text-xs text-gray-500">Después de realizar la transferencia, confirma el pago.</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ya pagué',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      width: '500px',
    }).then((result) => {
      if (result.isConfirmed) {
        onPagoConfirmado({
          metodoPago: 'Transferencia',
          datosPago: {
            qrUrl,
            numeroCuenta,
          },
        });
      }
    });
  };

  const handlePagarEfectivo = () => {
    Swal.fire({
      icon: 'info',
      title: 'Pago en Efectivo',
      html: `
        <div class="text-left">
          <p class="mb-3 text-gray-700">Puedes pagar en efectivo:</p>
          <ul class="list-disc list-inside space-y-2 text-gray-600 mb-4">
            <li>En nuestra tienda física</li>
            <li>Al recibir tu pedido en domicilio</li>
          </ul>
          <p class="text-sm text-gray-500">Monto a pagar: <strong>$${total.toLocaleString('es-CO')}</strong></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    }).then((result) => {
      if (result.isConfirmed) {
        onPagoConfirmado({
          metodoPago: 'Efectivo',
          datosPago: {
            tipo: 'efectivo',
          },
        });
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Completar Pago</h3>
      
      {esMercadoPago && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              Serás redirigido a Mercado Pago para completar el pago de forma segura.
            </p>
            <p className="text-xs text-blue-600">
              Monto a pagar: <strong>${total.toLocaleString('es-CO')}</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePagarMercadoPago}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando...' : 'Pagar con Mercado Pago'}
            </button>
            <button
              onClick={onCancelar}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {esTarjetaCredito && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Tarjeta
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={datosTarjeta.numero}
                onChange={(e) => setDatosTarjeta({ ...datosTarjeta, numero: e.target.value.replace(/\s/g, '') })}
                maxLength={16}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre en la Tarjeta
              </label>
              <input
                type="text"
                placeholder="JUAN PEREZ"
                value={datosTarjeta.nombre}
                onChange={(e) => setDatosTarjeta({ ...datosTarjeta, nombre: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vencimiento
                </label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={datosTarjeta.vencimiento}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setDatosTarjeta({ ...datosTarjeta, vencimiento: value });
                  }}
                  maxLength={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={datosTarjeta.cvv}
                  onChange={(e) => setDatosTarjeta({ ...datosTarjeta, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  maxLength={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePagarTarjeta}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando pago...' : 'Pagar'}
            </button>
            <button
              onClick={onCancelar}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {esTransferencia && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-4">
              Se generará un código QR para realizar la transferencia bancaria.
            </p>
            <p className="text-xs text-gray-600">
              Monto: <strong>${total.toLocaleString('es-CO')}</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePagarTransferencia}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generar Código QR
            </button>
            <button
              onClick={onCancelar}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {esEfectivo && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              Puedes pagar en efectivo al recibir tu pedido o en nuestra tienda física.
            </p>
            <p className="text-xs text-gray-600">
              Monto: <strong>${total.toLocaleString('es-CO')}</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePagarEfectivo}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Pedido
            </button>
            <button
              onClick={onCancelar}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
