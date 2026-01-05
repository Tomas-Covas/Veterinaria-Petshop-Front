'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPending() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const merchantOrderId = searchParams.get('merchant_order_id');

    setPaymentInfo({
      paymentId,
      status,
      merchantOrderId
    });

    // Limpiar el carrito
    localStorage.removeItem('cart');
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Ícono de pendiente */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Pago Pendiente
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>

        {/* Información del pago */}
        {paymentInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {paymentInfo.paymentId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID de Pago:</span>
                <span className="font-mono text-gray-900">{paymentInfo.paymentId}</span>
              </div>
            )}
            {paymentInfo.status && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-yellow-600 uppercase">{paymentInfo.status}</span>
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

        {/* Información sobre pagos pendientes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-blue-900 mb-2">¿Qué sigue?</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Recibirás un email cuando se acredite el pago</li>
            <li>• Puede tomar entre 24-48hs hábiles</li>
            <li>• Puedes verificar el estado en "Mis Pedidos"</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard?payment=pending')}
            className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-4 rounded-lg text-center transition-colors shadow-lg text-lg"
          >
            ⏳ Ir a Mi Dashboard
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
          ¿Tienes dudas? Escríbenos a soporte@veterinaria.com
        </p>
      </div>
    </div>
  );
}
