'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Obtener parámetros de la URL
    // MercadoPago: payment_id, status, merchant_order_id
    // Stripe: session_id
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const merchantOrderId = searchParams.get('merchant_order_id');
    const sessionId = searchParams.get('session_id');

    // Determinar si es pago de Stripe o MercadoPago
    const paymentProvider = sessionId ? 'Stripe' : 'MercadoPago';

    setPaymentInfo({
      paymentId: paymentId || sessionId,
      status,
      merchantOrderId,
      provider: paymentProvider
    });

    console.log(`✅ Pago exitoso con ${paymentProvider}`, { 
      paymentId, 
      sessionId, 
      status, 
      merchantOrderId 
    });

    // Limpiar el carrito del localStorage
    localStorage.removeItem('cart');

    // Countdown y redirect automático después de 5 segundos
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push('/dashboard?payment=success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Ícono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-center text-gray-600 mb-4">
          Tu compra se ha procesado correctamente. Recibirás un email de confirmación en breve.
        </p>

        {/* Contador de redirección */}
        <p className="text-center text-sm text-gray-500 mb-6">
          Serás redirigido al dashboard en {countdown} segundo{countdown !== 1 ? 's' : ''}...
        </p>

        {/* Información del pago */}
        {paymentInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {paymentInfo.provider && (
              <div className="flex justify-between text-sm mb-3 pb-2 border-b border-gray-200">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-semibold text-blue-600">{paymentInfo.provider}</span>
              </div>
            )}
            {paymentInfo.paymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{paymentInfo.provider === 'Stripe' ? 'Session ID' : 'ID de Pago'}:</span>
                <span className="font-mono text-gray-900 text-xs">{paymentInfo.paymentId}</span>
              </div>
            )}
            {paymentInfo.status && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-green-600 uppercase">{paymentInfo.status}</span>
              </div>
            )}
            {paymentInfo.merchantOrderId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Orden:</span>
                <span className="font-mono text-gray-900">{paymentInfo.merchantOrderId}</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard?payment=success')}
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-center transition-colors shadow-lg text-lg"
          >
            ✅ Ir a Mi Dashboard
          </button>
          
          <Link
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>

        {/* Información adicional */}
        <p className="text-xs text-center text-gray-500 mt-6">
          Si tienes alguna duda, contáctanos a soporte@veterinaria.com
        </p>
      </div>
    </div>
  );
}
