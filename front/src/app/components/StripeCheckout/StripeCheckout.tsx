// components/StripeCheckout/StripeCheckout.tsx
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface StripeCheckoutProps {
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: any) => void;
}

export default function StripeCheckout({
  amount,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const stripe = await stripePromise;
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const { sessionId } = await response.json();

      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe error:", error);
        onError?.(error);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isProcessing}
      className="btn-primary"
    >
      {isProcessing ? "Processing..." : `Pay $${amount}`}
    </button>
  );
}
