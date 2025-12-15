"use client";

import { toast } from "react-toastify";

const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ==================== INTERFACES ====================

export interface MedicationCatalogItem {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  presentacion: string;
  requiereMatricula: boolean;
  restricciones: string;
}

export interface MedicationCatalogResponse {
  total: number;
  medications: MedicationCatalogItem[];
}

export interface CreateMedicationRequestBody {
  nombre: string;
  cantidad: number;
  urgencia: 'baja' | 'media' | 'alta';
  justificacion?: string;
}

export interface MedicationRequest {
  nombre: string;
  cantidad: number;
  urgencia: 'baja' | 'media' | 'alta';
  justificacion?: string;
  fechaSolicitud: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'entregado' | 'cancelado';
  comentarioAdmin?: string;
  fechaRespuesta?: string;
  veterinarioNombre: string;
  veterinarioEmail: string;
  veterinarioMatricula: string;
  veterinarianId?: string;
  requestIndex?: number;
}

export interface MyRequestsResponse {
  veterinarian: {
    id: string;
    name: string;
    email: string;
    licenseNumber: string;
  };
  requests: MedicationRequest[];
  total: number;
}

export interface AllRequestsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  requests: MedicationRequest[];
}

export interface UpdateStatusBody {
  veterinarianId: string;
  requestIndex: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'entregado' | 'cancelado';
  comentarioAdmin?: string;
}

// ==================== SERVICIOS ====================

/**
 * Obtiene el catálogo completo de medicamentos controlados
 */
export async function getMedicationsCatalog(): Promise<MedicationCatalogResponse> {
  try {
    const response = await fetch(
      `${APIURL}/veterinarians/controlled-medications/catalog`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener catálogo');
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Error al obtener catálogo:', error);
    toast.error('Error al cargar catálogo de medicamentos');
    throw error;
  }
}

/**
 * Crea una nueva solicitud de medicamento controlado (VETERINARIO)
 */
export async function createMedicationRequest(
  veterinarianId: string,
  data: CreateMedicationRequestBody
): Promise<any> {
  try {
    const response = await fetch(
      `${APIURL}/veterinarians/${veterinarianId}/controlled-medications/request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear solicitud');
    }

    const result = await response.json();
    toast.success('✅ Solicitud creada exitosamente');
    return result;
  } catch (error: any) {
    console.error('❌ Error al crear solicitud:', error);
    toast.error(error.message || 'Error al crear solicitud');
    throw error;
  }
}

/**
 * Obtiene todas las solicitudes del veterinario actual (VETERINARIO)
 */
export async function getMyMedicationRequests(
  veterinarianId: string
): Promise<MyRequestsResponse> {
  try {
    const response = await fetch(
      `${APIURL}/veterinarians/${veterinarianId}/controlled-medications/my-requests`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener solicitudes');
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Error al obtener mis solicitudes:', error);
    toast.error('Error al cargar solicitudes');
    throw error;
  }
}

/**
 * Obtiene todas las solicitudes de todos los veterinarios (ADMIN)
 */
export async function getAllMedicationRequests(): Promise<AllRequestsResponse> {
  try {
    const response = await fetch(
      `${APIURL}/veterinarians/controlled-medications/all-requests`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener solicitudes');
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Error al obtener todas las solicitudes:', error);
    toast.error('Error al cargar solicitudes');
    throw error;
  }
}

/**
 * Actualiza el estado de una solicitud (ADMIN)
 */
export async function updateRequestStatus(
  data: UpdateStatusBody
): Promise<any> {
  try {
    console.log('📡 Servicio - Enviando actualización:', data);
    console.log('📡 Servicio - veterinarianId:', data.veterinarianId, typeof data.veterinarianId);
    console.log('📡 Servicio - requestIndex:', data.requestIndex, typeof data.requestIndex);
    
    const response = await fetch(
      `${APIURL}/veterinarians/controlled-medications/update-status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar estado');
    }

    const result = await response.json();
    toast.success('✅ Estado actualizado correctamente');
    return result;
  } catch (error: any) {
    console.error('❌ Error al actualizar estado:', error);
    toast.error(error.message || 'Error al actualizar estado');
    throw error;
  }
}

/**
 * Elimina una solicitud pendiente (VETERINARIO)
 */
export async function deleteMyMedicationRequest(
  veterinarianId: string,
  requestIndex: number
): Promise<any> {
  try {
    const response = await fetch(
      `${APIURL}/veterinarians/${veterinarianId}/controlled-medications/my-requests/${requestIndex}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar solicitud');
    }

    const result = await response.json();
    toast.success('✅ Solicitud eliminada correctamente');
    return result;
  } catch (error: any) {
    console.error('❌ Error al eliminar solicitud:', error);
    toast.error(error.message || 'Error al eliminar solicitud');
    throw error;
  }
}

// ==================== UTILIDADES ====================

/**
 * Obtiene el color del badge según el estado
 */
export function getStatusColor(estado: string): string {
  switch (estado) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'aprobado':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rechazado':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'entregado':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'cancelado':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Obtiene el color del badge según la urgencia
 */
export function getUrgencyColor(urgencia: string): string {
  switch (urgencia) {
    case 'baja':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'media':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'alta':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Formatea la fecha en formato legible
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
