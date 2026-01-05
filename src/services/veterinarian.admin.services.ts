const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ICreateVeterinarian {
  name: string;
  email: string;
  matricula: string;
  description: string;
  phone: string;
  time: string; // Fecha ISO (ej: "2025-12-01")
  horario_atencion?: string; // DateTime ISO 8601 (ej: "2025-12-11T09:00:00Z")
  isActive?: boolean;
}

export interface IUpdateVeterinarian {
  name?: string;
  email?: string;
  matricula?: string;
  description?: string;
  phone?: string;
  time?: string;
  isActive?: boolean;
}

// Crear veterinario (solo admin)
export const createVeterinarian = async (data: ICreateVeterinarian, token: string) => {
  try {
    const response = await fetch(`${API_URL}/veterinarians`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear veterinario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createVeterinarian:", error);
    throw error;
  }
};

// Actualizar veterinario (solo admin)
export const updateVeterinarian = async (
  id: string,
  data: IUpdateVeterinarian,
  token: string
) => {
  try {
    const response = await fetch(`${API_URL}/veterinarians/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar veterinario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateVeterinarian:", error);
    throw error;
  }
};

// Eliminar (desactivar) veterinario (solo admin)
export const deleteVeterinarian = async (id: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/veterinarians/${id}/deactivate`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al desactivar veterinario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en deleteVeterinarian:", error);
    throw error;
  }
};

// Activar/Desactivar veterinario (solo admin)
export const toggleVeterinarianStatus = async (id: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/veterinarians/${id}/toggle-status`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al cambiar estado del veterinario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en toggleVeterinarianStatus:", error);
    throw error;
  }
};

// Obtener todos los veterinarios (incluye inactivos para admin)
export const getAllVeterinariansAdmin = async (token: string) => {
  try {
    console.log('Llamando a GET /veterinarians con token:', token ? 'Token presente' : 'Sin token');
    
    const response = await fetch(`${API_URL}/veterinarians`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Status de respuesta:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error del backend:', error);
      throw new Error(error.message || "Error al obtener veterinarios");
    }

    const result = await response.json();
    console.log('Respuesta getAllVeterinariansAdmin:', result);
    return result;
  } catch (error) {
    console.error("Error en getAllVeterinariansAdmin:", error);
    throw error;
  }
};

// Obtener veterinario por ID
export const getVeterinarianById = async (id: string, token?: string) => {
  try {
    const response = await fetch(`${API_URL}/veterinarians/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener veterinario");
    }

    const result = await response.json();
    console.log('Respuesta completa getVeterinarianById:', result);
    return result;
  } catch (error) {
    console.error("Error en getVeterinarianById:", error);
    throw error;
  }
};

// Cambiar contraseña (veterinario autenticado)
export const changeVeterinarianPassword = async (
  email: string,
  currentPassword: string,
  newPassword: string,
  repeatNewPassword: string,
  token: string
) => {
  try {
    const response = await fetch(`${API_URL}/veterinarians/change-password`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        email, 
        currentPassword, 
        newPassword,
        repeatNewPassword 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al cambiar contraseña");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en changeVeterinarianPassword:", error);
    throw error;
  }
};

// Actualizar perfil del veterinario (descripción, teléfono, imagen)
export const updateVeterinarianProfile = async (
  id: string,
  formData: FormData,
  token: string
) => {
  try {
    console.log('🔐 Actualizando perfil con:', {
      url: `${API_URL}/veterinarians/${id}/profile`,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
    });
    
    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    console.log('📋 Headers siendo enviados:', headers);
    
    const response = await fetch(`${API_URL}/veterinarians/${id}/profile`, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: formData,
    });
    
    console.log('📡 Respuesta status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar perfil");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateVeterinarianProfile:", error);
    throw error;
  }
};
