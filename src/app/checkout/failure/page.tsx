'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutFailure() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const statusDetail = searchParams.get('status_detail');

    setPaymentInfo({
      paymentId,
      status,
      statusDetail
    });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Ícono de error */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Pago Rechazado
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          No pudimos procesar tu pago. Por favor, intenta nuevamente con otro método de pago.
        </p>

        {/* Información del pago */}
        {paymentInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {paymentInfo.status && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-red-600 uppercase">{paymentInfo.status}</span>
              </div>
            )}
            {paymentInfo.statusDetail && (
              <div className="text-sm">
                <span className="text-gray-600">Detalle:</span>
                <p className="mt-1 text-gray-900">{paymentInfo.statusDetail}</p>
              </div>
            )}
          </div>
        )}

        {/* Causas comunes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-yellow-900 mb-2">Causas comunes:</h3>
          <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
            <li>Fondos insuficientes</li>
            <li>Datos incorrectos de la tarjeta</li>
            <li>Límite de compra excedido</li>
            <li>Tarjeta vencida o bloqueada</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard?payment=failure')}
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-4 rounded-lg text-center transition-colors shadow-lg text-lg"
          >
            ❌ Ir a Mi Dashboard
          </button>
          
          <Link
            href="/cart"
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Volver al Carrito
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>

        {/* Información adicional */}
        <p className="text-xs text-center text-gray-500 mt-6">
          ¿Necesitas ayuda? Contáctanos a soporte@veterinaria.com
        </p>
      </div>
    </div>
  );
}
