"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { useShipping } from "@/src/context/ShippingContext";
import MercadoPagoWallet from "../components/MercadoPagoWallet/MercadoPagoWallet";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createCheckout } from "@/src/services/order.services";
import StripeCheckout from "../components/StripeCheckout/StripeCheckout";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getTotal, clearCart } = useCart();
  const { userData } = useAuth();
  const { shippingData, setShippingData } = useShipping();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(true);

  // Estado local para el formulario
  const [localShippingData, setLocalShippingData] = useState(shippingData);

  useEffect(() => {
    // Redirigir si no hay usuario o carrito vacío
    if (!userData) {
      toast.error("Debes iniciar sesión para continuar");
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Tu carrito está vacío");
      router.push("/store");
      return;
    }

    // Cargar datos guardados del contexto
    setLocalShippingData(shippingData);

    // NO crear el checkout automáticamente, esperar a que se complete el formulario de envío
  }, [userData, cartItems, shippingData]);

  const initCheckout = async () => {
    if (!userData || cartItems.length === 0 || isLoadingCheckout) return;

    setIsLoadingCheckout(true);

    try {
      console.log("🚀 Iniciando checkout...");
      console.log("👤 Usuario ID:", userData.user.id);
      console.log("🔑 Token:", userData.token?.substring(0, 20) + "...");

      const response = await createCheckout(
        String(userData.user.id),
        userData.token
      );

      console.log(
        "✅ Respuesta COMPLETA del checkout:",
        JSON.stringify(response, null, 2)
      );

      // El backend devuelve: { message: string, data: { preferenceId: string, initPoint: string, sandboxInitPoint: string } }
      const prefId =
        response.data?.preferenceId ||
        response.preferenceId ||
        response.preference_id ||
        response.id;

      if (prefId) {
        console.log("🎯 PreferenceId encontrado:", prefId);
        setPreferenceId(prefId);
        toast.success("Checkout creado exitosamente");
      } else {
        console.error(
          "❌ No se encontró preferenceId en la respuesta. Estructura completa:",
          response
        );
        throw new Error("No se recibió el preferenceId del backend");
      }
    } catch (error: any) {
      console.error("❌ Error COMPLETO al crear checkout:", {
        message: error.message,
        stack: error.stack,
        error: error,
      });
      toast.error(error.message || "Error al crear el checkout", {
        description: "Revisa la consola para más detalles",
        duration: 10000,
      });
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    console.log("✅ Pago exitoso! ID:", paymentId);

    toast.success("¡Pago realizado con éxito!", {
      description: "Redirigiendo al dashboard...",
      duration: 3000,
    });

    // Limpiar el carrito
    await clearCart();

    // Redirigir al dashboard después de 2 segundos
    setTimeout(() => {
      router.push("/dashboard?payment=success");
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    console.error("❌ Error en el pago:", error);

    toast.error("Error al procesar el pago", {
      description: error.message || "Intenta nuevamente",
      duration: 5000,
    });
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que al menos el código postal esté lleno
    if (!localShippingData.postalCode?.trim()) {
      toast.error("Debes ingresar un código postal");
      return;
    }

    // Guardar en el contexto global
    setShippingData(localShippingData);
    console.log("📍 Datos de envío guardados:", localShippingData);
    setShowShippingForm(false);

    // Crear el checkout después de completar el formulario
    initCheckout();

    toast.success("Datos de envío guardados");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLocalShippingData({
      ...localShippingData,
      [e.target.name]: e.target.value,
    });
  };

  if (!userData || cartItems.length === 0) {
    return null;
  }

  const total = getTotal();

  console.log("🛒 CHECKOUT - Items en carrito:", cartItems);
  console.log("📊 CHECKOUT - Total calculado:", total);
  cartItems.forEach((item) => {
    console.log(
      `  📦 ${item.name}: precio=$${item.price}, cantidad=${
        item.quantity || 1
      }, subtotal=$${Number(item.price) * (item.quantity || 1)}`
    );
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Resumen del pedido */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Finalizar compra
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Resumen del pedido
            </h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-amber-100"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-medium">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ${Number(item.price).toLocaleString()} ×{" "}
                      {item.quantity || 1}
                    </span>
                  </div>
                  <span className="font-bold text-amber-600">
                    $
                    {(
                      Number(item.price) * (item.quantity || 1)
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-amber-200 pt-4 mt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-amber-600 text-2xl">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de datos de envío */}
        {showShippingForm && (
          <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-blue-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              Datos de envío
            </h2>

            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código Postal */}
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Código Postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={localShippingData.postalCode || ""}
                    onChange={handleInputChange}
                    placeholder="Ej: 1234"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ciudad
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={localShippingData.city || ""}
                    onChange={handleInputChange}
                    placeholder="Ej: Buenos Aires"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Dirección completa */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Dirección completa
                  <span className="text-gray-500 text-xs ml-2">
                    (Calle, número, piso, depto)
                  </span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={localShippingData.address || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: Av. Corrientes 1234, Piso 5, Depto B"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Provincia */}
                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Provincia/Estado
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={localShippingData.province || ""}
                    onChange={handleInputChange}
                    placeholder="Ej: Buenos Aires"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* Información adicional */}
                <div>
                  <label
                    htmlFor="additionalInfo"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Información adicional
                  </label>
                  <input
                    type="text"
                    id="additionalInfo"
                    name="additionalInfo"
                    value={localShippingData.additionalInfo || ""}
                    onChange={handleInputChange}
                    placeholder="Ej: Timbre, referencias"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Nota:</span> Actualmente
                    solo necesitamos el código postal. En el futuro podrás
                    seleccionar la sucursal más cercana en un mapa.
                  </p>
                </div>
              </div>

              {/* Botón continuar */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Continuar al pago
              </button>
            </form>
          </div>
        )}

        {/* Formulario de pago */}
        {!showShippingForm && (
          <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-orange-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-orange-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              Método de pago
            </h2>
            {isLoadingCheckout && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Preparando checkout...
                </p>
              </div>
            )}
            {!isLoadingCheckout && !preferenceId && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">
                  No se pudo crear el checkout
                </p>
                <button
                  onClick={initCheckout}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Reintentar
                </button>
              </div>
            )}
            {preferenceId && <MercadoPagoWallet preferenceId={preferenceId} />}{" "}
            <div className="mt-6">
              {" "}
              <h3 className="text-xl font-bold mb-4">Pagar con Stripe</h3>{" "}
              <StripeCheckout
                amount={total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />{" "}
            </div>{" "}
          </div>
        )}

        {/* Botón volver */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/cart")}
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 font-semibold text-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Volver al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
