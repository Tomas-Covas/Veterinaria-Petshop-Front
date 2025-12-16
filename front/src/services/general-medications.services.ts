const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Medication {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationRequest {
  id: string;
  medicationId: string;
  medicationName: string;
  requestedBy: string;
  veterinarianName?: string;
  quantity: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  approverName?: string | null;
  approvedAt: string | null;
  completedAt: string | null;
}

export interface MedicationUsage {
  id: string;
  medicationId: string;
  medicationName: string;
  veterinarianId: string;
  veterinarianName: string;
  quantity: number;
  usedAt: string;
  notes?: string;
}

// Obtener todos los medicamentos
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const response = await fetch(`${APIURL}/general-medications`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener medicamentos');
    }

    const data = await response.json();

    // Normalizar: si viene { data: [...] }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    return [];

  } catch (error) {
    console.error('Error en getMedications:', error);
    throw error;
  }
};

// Obtener medicamentos con stock bajo
export const getLowStockMedications = async (): Promise<Medication[]> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/low-stock`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener medicamentos con stock bajo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getLowStockMedications:', error);
    throw error;
  }
};

// Solicitar reposición de medicamento
export const requestMedicationRestock = async (
  medicationId: string,
  quantity: number
): Promise<MedicationRequest> => {
  try {
    console.log('📤 Enviando solicitud al backend:', { medicationId, quantity });
    console.log('📍 URL:', `${APIURL}/general-medications/request-restock`);
    
    const response = await fetch(`${APIURL}/general-medications/request-restock`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medicationId,
        quantity,
      }),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del backend:', errorText);
      let errorMessage = 'Error al solicitar reposición';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Respuesta del backend:', result);
    return result;
  } catch (error) {
    console.error('💥 Error en requestMedicationRestock:', error);
    throw error;
  }
};

// Registrar uso de medicamento
export const useMedication = async (
  medicationId: string,
  quantity: number,
  notes?: string
): Promise<MedicationUsage> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/use`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medicationId,
        quantity,
        notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar uso');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error en useMedication:', error);
    throw error;
  }
};

// Obtener solicitudes de reposición
export const getMedicationRequests = async (status?: 'pending' | 'approved' | 'completed' | 'rejected'): Promise<MedicationRequest[]> => {
  try {
    const url = status 
      ? `${APIURL}/general-medications/requests?status=${status}`
      : `${APIURL}/general-medications/requests`;
    
    console.log('📤 Consultando solicitudes en:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Status de respuesta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del backend al obtener solicitudes:', errorText);
      throw new Error('Error al obtener solicitudes');
    }

    const data = await response.json();
    console.log('✅ Solicitudes recibidas del backend:', data);
    console.log('📊 Total de solicitudes:', Array.isArray(data) ? data.length : 'No es un array');
    
    return data;
  } catch (error) {
    console.error('💥 Error en getMedicationRequests:', error);
    throw error;
  }
};

// Aprobar solicitud (solo admin)
export const approveRequest = async (requestId: string): Promise<MedicationRequest> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/requests/${requestId}/approve`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al aprobar solicitud');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en approveRequest:', error);
    throw error;
  }
};

// Rechazar solicitud (solo admin)
export const rejectRequest = async (requestId: string): Promise<MedicationRequest> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/requests/${requestId}/reject`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al rechazar solicitud');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en rejectRequest:', error);
    throw error;
  }
};

// Completar solicitud (solo admin)
export const completeRequest = async (requestId: string): Promise<{ request: MedicationRequest; medication: Medication }> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/requests/${requestId}/complete`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al completar solicitud');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en completeRequest:', error);
    throw error;
  }
};

// Actualizar stock (solo admin)
export const updateMedicationStock = async (
  medicationId: string,
  quantity: number
): Promise<Medication> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/${medicationId}/stock`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar stock');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateMedicationStock:', error);
    throw error;
  }
};

// Obtener historial de uso
export const getMedicationUsageHistory = async (
  medicationId?: string
): Promise<MedicationUsage[]> => {
  try {
    const url = medicationId 
      ? `${APIURL}/general-medications/usage/${medicationId}`
      : `${APIURL}/general-medications/usage`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener historial');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getMedicationUsageHistory:', error);
    throw error;
  }
};

// Cargar medicamentos iniciales (solo admin)
export const seedMedications = async (): Promise<Medication[]> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/seed`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar medicamentos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en seedMedications:', error);
    throw error;
  }
};

// Cancelar/eliminar solicitud de reposición (veterinario que la creó o admin)
export const cancelRequest = async (requestId: string): Promise<void> => {
  try {
    const response = await fetch(`${APIURL}/general-medications/requests/${requestId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cancelar solicitud');
    }
  } catch (error) {
    console.error('Error en cancelRequest:', error);
    throw error;
  }
};
