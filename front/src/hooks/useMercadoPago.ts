"use client";

import { useEffect, useState } from "react";
import { initMercadoPago } from "../services/mercadopago.services";

export const useMercadoPago = () => {
  const [mp, setMp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const mercadoPago = await initMercadoPago();
        setMp(mercadoPago);
      } catch (err) {
        setError(err as Error);
        console.error("Error al inicializar MercadoPago:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return { mp, isLoading, error };
};
