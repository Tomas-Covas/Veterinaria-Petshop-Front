const APIURL = process.env.NEXT_PUBLIC_API_URL;

// ============ INTERFACES ============


export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductSales {
  name: string;
  sales: number;
  revenue: number;
}

export interface CategoryStats {
  name: string;
  value: number;
  percentage: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalAppointments: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  appointmentsGrowth: number;
}

export interface LowStockProduct {
  name: string;
  stock: number;
  category: string;
  price: number;
}

export interface VeterinarianStats {
  name: string;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
}

export interface DiagnosisRecurrence {
  diagnosis: string;
  count: number;
  percentage: number;
}

// ============ FUNCIONES BÁSICAS (para cuando se implementen endpoints completos) ============

export const getDashboardMetrics = async (token: string): Promise<DashboardMetrics> => {
  try {
    const response = await fetch(`${APIURL}/analytics/metrics`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error obteniendo métricas:', error);
    throw error;
  }
};

export const getSalesData = async (
  period: 'day' | 'week' | 'month' | 'year',
  token: string
): Promise<SalesData[]> => {
  try {
    const response = await fetch(`${APIURL}/analytics/sales?period=${period}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error obteniendo datos de ventas:', error);
    throw error;
  }
};

export const getTopProducts = async (limit: number = 10, token: string): Promise<ProductSales[]> => {
  try {
    const response = await fetch(`${APIURL}/analytics/top-products?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error obteniendo productos top:', error);
    throw error;
  }
};

export const getCategoryStats = async (token: string): Promise<CategoryStats[]> => {
  try {
    const response = await fetch(`${APIURL}/analytics/categories`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error obteniendo stats de categorías:', error);
    throw error;
  }
};

// ============ FUNCIONES CON DATOS REALES DEL BACKEND ============

// 1. Productos con stock bajo/crítico
export const getLowStockProducts = async (token: string): Promise<LowStockProduct[]> => {
  try {
    const response = await fetch(`${APIURL}/analytics/low-stock`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error obteniendo productos con stock bajo:', error);
    throw error;
  }
};

// 2. Estadísticas por veterinario
export const getVeterinarianStats = async (token: string): Promise<VeterinarianStats[]> => {
  try {
    const response = await fetch(`${APIURL}/analytics/veterinarians`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error obteniendo stats de veterinarios:', error);
    throw error;
  }
};

// 3. Diagnósticos médicos recurrentes
export const getDiagnosisRecurrence = async (token: string): Promise<DiagnosisRecurrence[]> => {
  try {
    console.log('🔍 Llamando a:', `${APIURL}/analytics/diagnosis-recurrence`);
    const response = await fetch(`${APIURL}/analytics/diagnosis-recurrence`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Datos de diagnósticos recibidos:', data);
    console.log('📊 Cantidad de diagnósticos:', Array.isArray(data) ? data.length : 'No es array');
    
    return data;
  } catch (error: any) {
    console.error('❌ Error obteniendo recurrencia de diagnósticos:', error);
    throw error;
  }
};
