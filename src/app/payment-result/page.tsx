'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    // Obtener parámetros de MercadoPago
    const paymentStatus = searchParams.get('status');
    const collectionStatus = searchParams.get('collection_status');
    const payment_id = searchParams.get('payment_id');
    const preferenceId = searchParams.get('preference_id');
    const externalReference = searchParams.get('external_reference');
    const merchantOrderId = searchParams.get('merchant_order_id');

    console.log('🎯 Parámetros de retorno de MercadoPago:', {
      status: paymentStatus,
      collection_status: collectionStatus,
      payment_id: payment_id,
      preference_id: preferenceId,
      external_reference: externalReference,
      merchant_order_id: merchantOrderId
    });

    // Guardar payment_id para el comprobante
    if (payment_id) {
      setPaymentId(payment_id);
    }

    // Determinar el estado final
    let finalStatus = paymentStatus || collectionStatus;
    
    if (finalStatus === 'success' || finalStatus === 'approved') {
      setStatus('success');
      localStorage.removeItem('cart');
    } else if (finalStatus === 'failure' || finalStatus === 'rejected') {
      setStatus('failure');
    } else if (finalStatus === 'pending' || finalStatus === 'in_process') {
      setStatus('pending');
      localStorage.removeItem('cart');
    } else {
      // Si no hay parámetros, ir directo al dashboard
      setStatus('success');
      localStorage.removeItem('cart');
    }
  }, [searchParams]);

  useEffect(() => {
    if (status && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      if (status === 'failure') {
        router.push('/cart');
      } else {
        router.push('/dashboard?payment=' + status);
      }
    }
  }, [status, countdown, router]);

  const openMercadoPagoReceipt = () => {
    if (paymentId) {
      // Abrir comprobante de MercadoPago en nueva pestaña
      window.open(`https://www.mercadopago.com.ar/activities?order=${paymentId}`, '_blank');
    }
  };

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando resultado del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pago exitoso!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu compra se ha procesado correctamente.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-medium">
                Recibirás un email con los detalles de tu compra
              </p>
            </div>
            
            {paymentId && (
              <button
                onClick={openMercadoPagoReceipt}
                className="w-full mb-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Ver comprobante de MercadoPago
              </button>
            )}
            
            <p className="text-sm text-gray-500 mb-3">
              Redirigiendo al dashboard en {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
            <button
              onClick={() => router.push('/dashboard?payment=success')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Ir al dashboard ahora
            </button>
          </>
        )}
        
        {status === 'failure' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pago rechazado
            </h1>
            <p className="text-gray-600 mb-6">
              Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                Verifica los datos de tu método de pago e intenta nuevamente
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Redirigiendo al carrito en {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
            <button
              onClick={() => router.push('/cart')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Volver al carrito ahora
            </button>
          </>
        )}
        
        {status === 'pending' && (
          <>
            <div className="text-yellow-500 text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pago pendiente
            </h1>
            <p className="text-gray-600 mb-6">
              Tu pago está siendo procesado. Te notificaremos cuando se complete.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                Esto puede tomar unos minutos dependiendo del método de pago seleccionado
              </p>
            </div>
            
            {paymentId && (
              <button
                onClick={openMercadoPagoReceipt}
                className="w-full mb-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Ver estado en MercadoPago
              </button>
            )}
            
            <p className="text-sm text-gray-500 mb-4">
              Redirigiendo al dashboard en {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
            <button
              onClick={() => router.push('/dashboard?payment=pending')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Ir al dashboard ahora
            </button>
          </>
        )}
      </div>
    </div>
  );
}
