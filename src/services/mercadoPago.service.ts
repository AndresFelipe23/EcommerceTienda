import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import { apiService } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface CrearPreferenciaRequest {
  pedidoId?: string; // Opcional, puede ser null o undefined para crear preferencia sin pedido
  monto: number;
  descripcion: string;
  nombreCliente?: string;
  emailCliente?: string;
  telefonoCliente?: string;
  urlExito?: string;
  urlFallo?: string;
  urlPendiente?: string;
}

export interface PreferenciaResponse {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  clientId?: string;
}

class MercadoPagoService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  /**
   * Crear preferencia de pago en Mercado Pago
   */
  async crearPreferencia(dto: CrearPreferenciaRequest): Promise<ApiResponse<PreferenciaResponse>> {
    try {
      // Convertir a PascalCase para el backend
      // Si pedidoId es 'temp' o vacío, enviar null para permitir crear preferencia sin pedido
      const pedidoIdGuid = dto.pedidoId && dto.pedidoId !== 'temp' && dto.pedidoId !== '' 
        ? dto.pedidoId 
        : null;
      
      const dtoBackend: any = {
        Monto: dto.monto,
        Descripcion: dto.descripcion,
        NombreCliente: dto.nombreCliente,
        EmailCliente: dto.emailCliente,
        TelefonoCliente: dto.telefonoCliente,
        UrlExito: dto.urlExito,
        UrlFallo: dto.urlFallo,
        UrlPendiente: dto.urlPendiente,
      };
      
      // Solo incluir PedidoId si tiene un valor válido
      if (pedidoIdGuid) {
        dtoBackend.PedidoId = pedidoIdGuid;
      }

      const response = await apiService.post<PreferenciaResponse>(
        API_ENDPOINTS.mercadoPago.crearPreferencia,
        dtoBackend
      );
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al crear preferencia',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Verificar estado de un pago
   */
  async verificarPago(paymentId: string): Promise<ApiResponse<string>> {
    try {
      const endpoint = API_ENDPOINTS.mercadoPago.verificarPago(paymentId);
      const response = await apiService.get<string>(endpoint);
      return response;
    } catch (error) {
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error desconocido al verificar pago',
        errores: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }
}

// Exportar instancia singleton
export const mercadoPagoService = new MercadoPagoService();
