"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeCheckout } from "@stripe/stripe-js";
import { useState } from "react";

interface StripeCheckoutProps {
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: any) => void;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
);

export default function StripeCheckout({
  amount,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const stripe = (await stripePromise) as StripeCheckout | null;

      if (!stripe) throw new Error("Stripe no pudo inicializarse");

      const response = await fetch("/api/create-stripe-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la sesión de checkout");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (result.error) {
        onError?.(result.error);
        console.error("Error en redirectToCheckout:", result.error);
      }
    } catch (error) {
      onError?.(error);
      console.error("Error en el checkout de Stripe:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300"
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          Procesando...
        </div>
      ) : (
        "Pagar con Stripe"
      )}
    </button>
  );
}
