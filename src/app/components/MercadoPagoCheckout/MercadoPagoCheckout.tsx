"use client";

import { useEffect, useRef, useState } from "react";
import { useMercadoPago } from "@/src/hooks/useMercadoPago";
import { getPaymentMethods } from "@/src/services/mercadopago.services";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface MercadoPagoCheckoutProps {
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: any) => void;
}

export default function MercadoPagoCheckout({ 
  amount, 
  onSuccess, 
  onError 
}: MercadoPagoCheckoutProps) {
  const { mp, isLoading, error } = useMercadoPago();
  const [cardForm, setCardForm] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Cargar métodos de pago disponibles
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        console.log("💳 Métodos de pago disponibles:", methods);
      } catch (error) {
        console.error("Error al cargar métodos de pago:", error);
      }
    };

    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (!mp || !formRef.current) return;

    // Crear el formulario de tarjeta
    const initCardForm = async () => {
      try {
        const cardFormInstance = mp.cardForm({
          amount: amount.toString(),
          iframe: true,
          form: {
            id: "form-checkout",
            cardNumber: {
              id: "form-checkout__cardNumber",
              placeholder: "Número de tarjeta",
            },
            expirationDate: {
              id: "form-checkout__expirationDate",
              placeholder: "MM/YY",
            },
            securityCode: {
              id: "form-checkout__securityCode",
              placeholder: "CVV",
            },
            cardholderName: {
              id: "form-checkout__cardholderName",
              placeholder: "Titular de la tarjeta",
            },
            issuer: {
              id: "form-checkout__issuer",
              placeholder: "Banco emisor",
            },
            installments: {
              id: "form-checkout__installments",
              placeholder: "Cuotas",
            },
            identificationType: {
              id: "form-checkout__identificationType",
              placeholder: "Tipo de documento",
            },
            identificationNumber: {
              id: "form-checkout__identificationNumber",
              placeholder: "Número de documento",
            },
            cardholderEmail: {
              id: "form-checkout__cardholderEmail",
              placeholder: "Email",
            },
          },
          callbacks: {
            onFormMounted: (error: any) => {
              if (error) {
                console.error("Error al montar el formulario:", error);
                return;
              }
              console.log("✅ Formulario de pago montado correctamente");
            },
            onSubmit: async (event: Event) => {
              event.preventDefault();
              setIsProcessing(true);

              try {
                // Obtener todos los datos del formulario
                const {
                  paymentMethodId,
                  issuerId,
                  cardholderEmail,
                  amount: formAmount,
                  token,
                  installments,
                  identificationNumber,
                  identificationType
                } = cardFormInstance.getCardFormData();

                console.log("📝 Datos del formulario:", {
                  paymentMethodId,
                  issuerId,
                  cardholderEmail,
                  amount: formAmount,
                  token,
                  installments,
                  identificationNumber,
                  identificationType
                });

                // Enviar los datos al backend para procesar el pago
                const response = await fetch(`${API_URL}/payments/process`, {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    token,
                    transaction_amount: Number(formAmount),
                    installments: Number(installments),
                    payment_method_id: paymentMethodId,
                    issuer_id: issuerId,
                    payer: {
                      email: cardholderEmail,
                      identification: {
                        type: identificationType,
                        number: identificationNumber
                      }
                    }
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || "Error al procesar el pago");
                }

                const result = await response.json();
                console.log("✅ Respuesta del pago:", result);
                
                if (result.status === "approved") {
                  onSuccess?.(result.id);
                } else if (result.status === "rejected") {
                  onError?.(new Error(result.status_detail || "Pago rechazado"));
                } else {
                  onError?.(new Error(`Estado del pago: ${result.status}`));
                }
              } catch (error) {
                console.error("❌ Error en el pago:", error);
                onError?.(error);
              } finally {
                setIsProcessing(false);
              }
            },
          },
        });

        setCardForm(cardFormInstance);
      } catch (error) {
        console.error("Error al inicializar el formulario:", error);
        onError?.(error);
      }
    };

    initCardForm();
  }, [mp, amount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error al cargar MercadoPago</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form id="form-checkout" ref={formRef} className="space-y-6">
        
        {/* Título */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Información de Pago</h2>
          <p className="text-gray-600 mt-2 text-lg">Total a pagar: <span className="text-amber-600 font-bold">${amount.toLocaleString()}</span></p>
        </div>

        {/* Información de la tarjeta */}
        <div 
          className="relative rounded-xl border-2 border-amber-200 p-6 space-y-4 shadow-sm overflow-hidden"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIxMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZWYzYzciLz48ZyBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNTAiIGZpbGw9IiNmOTdmMGYiLz48Y2lyY2xlIGN4PSI5MDAiIGN5PSIyMDAiIHI9IjQwIiBmaWxsPSIjZjk3ZjBmIi8+PGNpcmNsZSBjeD0iMzAwIiBjeT0iODAwIiByPSI2MCIgZmlsbD0iI2Y5N2YwZiIvPjxjaXJjbGUgY3g9IjcwMCIgY3k9IjYwMCIgcj0iMzUiIGZpbGw9IiNmOTdmMGYiLz48Y2lyY2xlIGN4PSI1MDAiIGN5PSI0MDAiIHI9IjQ1IiBmaWxsPSIjZjk3ZjBmIi8+PC9nPjwvc3ZnPg==')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Capa de color amber transparente */}
          <div className="absolute inset-0 bg-amber-200/30 -z-10"></div>
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Datos de la tarjeta</h3>
          </div>
          
          {/* Número de tarjeta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Número de tarjeta
            </label>
            <div 
              id="form-checkout__cardNumber" 
              className="border-2 border-amber-300 rounded-lg p-3 bg-white/80 backdrop-blur-sm shadow-sm hover:border-amber-400 transition-colors"
            ></div>
          </div>

          {/* Fecha y CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de vencimiento
              </label>
              <div 
                id="form-checkout__expirationDate" 
                className="border-2 border-amber-300 rounded-lg p-3 bg-white/80 backdrop-blur-sm shadow-sm hover:border-amber-400 transition-colors"
              ></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código de seguridad
              </label>
              <div 
                id="form-checkout__securityCode" 
                className="border-2 border-amber-300 rounded-lg p-3 bg-white/80 backdrop-blur-sm shadow-sm hover:border-amber-400 transition-colors"
              ></div>
            </div>
          </div>

          {/* Nombre del titular */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del titular
            </label>
            <input
              type="text"
              id="form-checkout__cardholderName"
              className="w-full border-2 border-amber-300 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
              placeholder="Nombre como aparece en la tarjeta"
            />
          </div>

          {/* Banco emisor */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Banco emisor
            </label>
            <select
              id="form-checkout__issuer"
              className="w-full border-2 border-amber-300 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
            ></select>
          </div>

          {/* Cuotas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cuotas
            </label>
            <select
              id="form-checkout__installments"
              className="w-full border-2 border-amber-300 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm"
            ></select>
          </div>
        </div>

        {/* Información del titular */}
        <div 
          className="relative rounded-xl border-2 border-orange-200 p-6 space-y-4 shadow-sm overflow-hidden"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIxMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZWYzYzciLz48ZyBvcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNTAiIGZpbGw9IiNmOTdmMGYiLz48Y2lyY2xlIGN4PSI5MDAiIGN5PSIyMDAiIHI9IjQwIiBmaWxsPSIjZjk3ZjBmIi8+PGNpcmNsZSBjeD0iMzAwIiBjeT0iODAwIiByPSI2MCIgZmlsbD0iI2Y5N2YwZiIvPjxjaXJjbGUgY3g9IjcwMCIgY3k9IjYwMCIgcj0iMzUiIGZpbGw9IiNmOTdmMGYiLz48Y2lyY2xlIGN4PSI1MDAiIGN5PSI0MDAiIHI9IjQ1IiBmaWxsPSIjZjk3ZjBmIi8+PC9nPjwvc3ZnPg==')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Capa de color amber transparente */}
          <div className="absolute inset-0 bg-amber-200/30 -z-10"></div>
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Datos del titular</h3>
          </div>
          
          {/* Tipo de documento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de documento
            </label>
            <select
              id="form-checkout__identificationType"
              className="w-full border-2 border-orange-300 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
            ></select>
          </div>

          {/* Número de documento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Número de documento
            </label>
            <input
              type="text"
              id="form-checkout__identificationNumber"
              className="w-full border-2 border-orange-300 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
              placeholder="12345678"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="form-checkout__cardholderEmail"
              className="w-full border-2 border-orange-300 rounded-lg px-4 py-3 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          id="form-checkout__submit"
          disabled={isProcessing}
          className="w-full bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Procesando pago...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Pagar ${amount.toLocaleString()}
            </>
          )}
        </button>

        {/* Logo de MercadoPago */}
        <div className="text-center pt-4 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Pago seguro procesado por</p>
          <div className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.95 17.4l-4.95-4.95-4.95 4.95L6 16.35l4.95-4.95L6 6.45 7.05 5.4l4.95 4.95 4.95-4.95L18 6.45l-4.95 4.95 4.95 4.95-1.05 1.05z"/>
            </svg>
            <p className="text-amber-500 font-medium-semibold">MercadoPago</p>
          </div>
        </div>
      </form>
    </div>
  );
}
