'use client';

import { useRouter } from 'next/navigation';

export default function CheckoutCancel() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Ícono de cancelación */}
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
          Pago Cancelado
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          Has cancelado el proceso de pago. Tu carrito sigue activo y puedes intentarlo nuevamente cuando lo desees.
        </p>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/cart')}
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Volver al Carrito
          </button>
          
          <button
            onClick={() => router.push('/store')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Continuar Comprando
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-gray-600 px-6 py-2 hover:text-gray-900 transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
