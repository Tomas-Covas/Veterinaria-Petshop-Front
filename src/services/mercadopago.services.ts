"use client";

import { loadMercadoPago } from "@mercadopago/sdk-js";

let mercadoPagoInstance: any = null;

export const initMercadoPago = async () => {
  if (mercadoPagoInstance) {
    return mercadoPagoInstance;
  }

  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY no está configurada");
  }

  try {
    await loadMercadoPago();
    
    // @ts-ignore - MercadoPago se carga globalmente
    const mp = new window.MercadoPago(publicKey, {
      locale: "es-AR",
    });

    mercadoPagoInstance = mp;
    console.log("✅ MercadoPago inicializado correctamente");
    return mp;
  } catch (error) {
    console.error("❌ Error al inicializar MercadoPago:", error);
    throw error;
  }
};

export const getMercadoPago = () => {
  if (!mercadoPagoInstance) {
    throw new Error("MercadoPago no ha sido inicializado. Llama a initMercadoPago() primero.");
  }
  return mercadoPagoInstance;
};

// Crear preferencia de pago
export const createPaymentPreference = async (orderData: {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer?: {
    name?: string;
    email?: string;
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
}) => {
  try {
    const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${APIURL}/payments/create-preference`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Error al crear preferencia de pago: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error en createPaymentPreference:", error);
    throw error;
  }
};

// Obtener métodos de pago disponibles
export const getPaymentMethods = async () => {
  try {
    const publicKey =
      process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    
    const response = await fetch(
      `https://api.mercadopago.com/v1/payment_methods?public_key=${publicKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener métodos de pago: ${response.status}`);
    }

    const methods = await response.json();
    return methods;
  } catch (error) {
    console.error("Error en getPaymentMethods:", error);
    throw error;
  }
};
