const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const calculateShipping = async (postalCode: string, items?: Array<{productId: string, quantity: number}>, token?: string) => {
    try {
        const body: any = { postalCode };
        
        // Solo incluir items si se proporcionan
        if (items && items.length > 0) {
            body.items = items;
        }
        
        const response = await fetch(`${APIURL}/sale-orders/calculate-shipping`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token })
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al calcular envío:', errorText);
            throw new Error(`Error al calcular envío: ${response.status}`);
        }

        const result = await response.json();
        // El backend puede devolver: { shippingCost, zone, deliveryTime }
        return result;
    } catch (error: any) {
        console.error('Error en calculateShipping:', error);
        throw error;
    }
};

export const createOrder = async (items: Array<{productId: string | number, quantity: number}>, userId: string, token: string) => {
    try {
        console.log('Creando orden en:', `${APIURL}/sale-orders`)
        console.log('Items:', items)
        console.log('User ID:', userId)
        console.log('Token:', token)
        
        const payload = {
            userId: userId,
            items: items.map(item => ({
                productId: String(item.productId),
                quantity: item.quantity
            })),
            paymentMethod: 'online' // Por defecto
        };
        
        console.log('Payload:', payload)
        
        const response = await fetch(`${APIURL}/sale-orders`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token })
            },
            body: JSON.stringify(payload),
        });
        
        console.log('Respuesta status:', response.status)
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error(`Error al crear la orden: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Orden creada exitosamente:', result);
        return result;
    }catch (error:any) {
        console.error('Error en createOrder:', error);
        throw new Error(error);
    };

};

export const getAllOrders = async (token:string) => {
    try { 
        console.log('📦 Obteniendo todas las órdenes desde:', `${APIURL}/sale-orders`);
        const res = await fetch(`${APIURL}/sale-orders`, {
            method: 'GET',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token })
            }
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.warn('⚠️ Error al obtener órdenes (backend):', res.status, errorText);
            throw new Error(`Error al obtener órdenes: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('✅ Datos recibidos:', data);
        
        // El backend puede devolver array directamente o envuelto en un objeto
        const orders = Array.isArray(data) ? data : data.data || [];
        console.log('📊 Órdenes procesadas:', orders.length, 'órdenes');
        return orders;
    } catch (error:any) {
        console.warn('⚠️ No se pudieron cargar órdenes desde el backend:', error.message);
        throw error;
    }
};

export const getUserOrders = async (userId: string/* , token: string */) => {
    try { 
        const res = await fetch(`${APIURL}/sale-orders/history/${userId}`, {
            method: 'GET',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                /* ...(token && { Authorization: `Bearer ${token}` }) */
            }
        });
        
        if (!res.ok) {
            console.error('Error al obtener órdenes del usuario:', res.status);
            return [];
        }
        
        const response = await res.json();
        
        // El backend devuelve {message: string, data: Array}
        const orders = response.data/*  || response.orders || response.saleOrders || response; */
        
        // Asegurarse de que sea un array
        return orders
    } catch (error: any) {
        console.error('Error en getUserOrders:', error);
        return [];
    }
}


// PRODUCTO DENTRO DE ITEMS
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imgUrl: string;
}

// ITEM DE LA ORDEN
export interface SaleOrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

// COMPRADOR
export interface Buyer {
  id: string;
  uid: string;
  name: string;
  email: string;
  user: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  profileImageUrl: string;
  role: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

// ORDEN DE VENTA
export interface SaleOrder {
  id: string;
  total: string;
  status: "ACTIVE" | "PENDING" | "CANCELLED" | "PAID" | string;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;  // ISO date
  expiresAt: string;  // ISO date
  mercadoPagoId: string | null;
  mercadoPagoStatus: string | null;
  buyer: Buyer;
  branch: string | null;
  items: SaleOrderItem[];
}

// RESPUESTA DEL BACKEND
export interface SaleOrdersResponse {
  message: string;
  data: SaleOrder[];
}
// Obtener el historial de compras del usuario
export const getOrderHistory = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${APIURL}/sale-orders/history/${userId}`, {
            method: 'GET',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token })
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text()
            console.error('Error del servidor:', errorText)
            throw new Error(`Error al obtener historial: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        // Backend retorna { message: string, data: Order[] }
        return result.data || [];
    } catch (error: any) {
        console.error('Error en getOrderHistory:', error);
        throw error;
    }
};

// Obtener el carrito del usuario
export const getCart = async (userId: string) => {
    try {
        const response = await fetch(`${APIURL}/sale-orders/cart/${userId}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
        });
        
        if (!response.ok) {
            throw new Error(`Error al obtener el carrito: ${response.status}`);
        }
        
        const result = await response.json();
        // El backend retorna { message: string, data: SaleOrder | null }
        // SaleOrder tiene: { id, buyer, items: [{product, quantity, unitPrice}], total, status, expiresAt }
        
        return result.data;        
    } catch (error: any) {
        console.error('Error en getCart:', error);
        throw error;
    }
};

// Agregar producto al carrito
export const addToCartBackend = async (userId: string, productId: string | number, quantity: number, token: string) => {
    try {
        const response = await fetch(`${APIURL}/sale-orders/cart/add`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token })
            },
            body: JSON.stringify({
                userId,
                productId: String(productId),
                quantity
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al agregar al carrito: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        return result.data;
    } catch (error: any) {
        console.error('Error en addToCartBackend:', error);
        throw error;
    }
};

// Actualizar cantidad de producto en el carrito
export const updateCartQuantity = async (userId: string, productId: string | number, quantity: number, token: string) => {
    try {
        const response = await fetch(`${APIURL}/sale-orders/cart/update`, {
            method: "PATCH",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token })
            },
            body: JSON.stringify({
                userId,
                productId: String(productId),
                quantity
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al actualizar cantidad: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        return result.data;
    } catch (error: any) {
        console.error('Error en updateCartQuantity:', error);
        throw error;
    }
};

// Eliminar producto del carrito
export const removeFromCartBackend = async (userId: string, productId: string | number, token: string) => {
    try {
        const response = await fetch(`${APIURL}/sale-orders/cart/remove`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token })
            },
            body: JSON.stringify({
                userId,
                productId: String(productId)
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Error al eliminar del carrito: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data;
    } catch (error: any) {
        console.error('Error en removeFromCartBackend:', error);
        throw error;
    }
};

// Vaciar el carrito
export const clearCartBackend = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${APIURL}/sale-orders/cart/clear/${userId}`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token })
            },
        });
        
        if (!response.ok) {
            throw new Error(`Error al vaciar el carrito: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data;
    } catch (error: any) {
        console.error('Error en clearCartBackend:', error);
        throw error;
    }
};

// Obtener carrito activo del usuario
export const getActiveCart = async (userId: string, token: string) => {
    try {
        const response = await fetch(`${APIURL}/sale-orders/cart/${userId}`, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token })
            },
        });
        
        if (!response.ok) {
            throw new Error(`Error al obtener carrito: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data; // puede ser null si no hay carrito activo
    } catch (error: any) {
        console.error('Error en getActiveCart:', error);
        throw error;
    }
};

// Crear checkout desde el carrito (NUEVO FLUJO - usa el carrito del backend)
export const createCheckout = async (userId: string, token: string) => {
    try {
        console.log('🛒 Creando checkout para userId:', userId);
        console.log('🔍 Verificando carrito del usuario antes del checkout...');
        
        // Primero obtener el carrito para ver qué tiene
        const cart = await getCart(userId);
        console.log('📦 Carrito actual:', cart);
        
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new Error('El carrito está vacío');
        }
        
        console.log('📊 Items en carrito:');
        cart.items.forEach((item: any) => {
            console.log(`  - ${item.product.name}: cantidad=${item.quantity}, precio unitario=$${item.unitPrice}, subtotal=$${item.quantity * item.unitPrice}`);
        });
        console.log('💰 Total del carrito según frontend:', cart.total);
        
        console.log('📤 Enviando checkout para carrito del usuario');
        
        // Preparar las URLs de retorno para MercadoPago
        // Usar ngrok URL si está disponible, sino usar el origin actual
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
        const baseUrl = ngrokUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002');
        
        console.log('🌐 Base URL para MercadoPago:', baseUrl);
        console.log('🌐 Endpoint:', `${APIURL}/sale-orders/checkout/${userId}`);
        console.log('🔐 Authorization header:', token ? 'Presente (primeros 20 chars): ' + token.substring(0, 20) + '...' : 'AUSENTE');
        
        // Llamar al endpoint de checkout que convierte el carrito en orden
        // El backend requiere success_url, failure_url y pending_url por separado
        const response = await fetch(`${APIURL}/sale-orders/checkout/${userId}`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                success_url: `${baseUrl}/payment-result?status=success`,
                failure_url: `${baseUrl}/payment-result?status=failure`,
                pending_url: `${baseUrl}/payment-result?status=pending`,
                auto_return: "all" // ⭐ Redirige inmediatamente sin esperar
            })
        });
        
        console.log('📡 Respuesta HTTP status:', response.status);
        console.log('📡 Respuesta HTTP statusText:', response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error del backend (texto completo):', errorText);
            
            // Intentar parsear como JSON si es posible
            try {
                const errorJson = JSON.parse(errorText);
                console.error('❌ Error del backend (JSON):', errorJson);
            } catch {
                console.error('❌ La respuesta de error no es JSON válido');
            }
            
            throw new Error(`Error al crear checkout: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Respuesta COMPLETA del checkout (cruda):', result);
        console.log('✅ Tipo de respuesta:', typeof result);
        console.log('✅ Keys de la respuesta:', Object.keys(result));
        
        // Backend retorna el preference ID de MercadoPago
        return result;
    } catch (error: any) {
        console.error('💥 Error COMPLETO en createCheckout:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            error: error
        });
        throw error;
    }
};

// Checkout con Stripe
export const checkoutStripe = async (userId: string, token: string) => {
    try {
        const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:3002';
        
        console.log('🔵 Iniciando checkout con Stripe para userId:', userId);
        console.log('🌐 URLs de retorno basadas en:', ngrokUrl);
        
        const response = await fetch(`${APIURL}/sale-orders/checkout-stripe/${userId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token })
            },
            body: JSON.stringify({
                success_url: `${ngrokUrl}/checkout/success`,
                cancel_url: `${ngrokUrl}/checkout/cancel`,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error en checkout Stripe:', errorText);
            throw new Error(`Error al crear checkout de Stripe: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Respuesta de Stripe checkout:', data);
        
        if (data.checkoutUrl) {
            // Redirigir al usuario a la página de pago de Stripe
            window.location.href = data.checkoutUrl;
        } else {
            throw new Error('No se recibió URL de checkout de Stripe');
        }
        
        return data;
    } catch (error: any) {
        console.error('💥 Error en checkoutStripe:', error);
        throw error;
    }
};
