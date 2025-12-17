"use client";

import perrocompra from "../../assets/perrocompra.png";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useCart } from "@/src/context/CartContext";
import { useEffect, useState, useRef } from "react";
import { IProduct } from "@/src/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  addToCartBackend,
  createCheckout,
  calculateShipping,
  getCart,
} from "@/src/services/order.services";
import { toast } from "sonner";
import Image, { StaticImageData } from "next/image";
import { XMarkIcon } from "@heroicons/react/16/solid";
import MercadoPagoWallet from "../components/MercadoPagoWallet/MercadoPagoWallet";
import fallbackImage from "@/src/assets/avatar.jpg";
import { useShipping } from "@/src/context/ShippingContext";
import DeliveryMethodSelector from "../components/DeliveryMethodSelector/DeliveryMethodSelector";
import PaymentButtons from "../components/PaymentButtons/PaymentButtons";

function CartPage() {
  const [open, setOpen] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const hasSyncedRef = useRef(false);
  const [postalCodeInput, setPostalCodeInput] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');

  const { shippingData, updatePostalCode } = useShipping();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotal,
    clearCart,
    getItemsCount,
    loadCartFromBackend,
  } = useCart();
  const itemsCount = getItemsCount();
  const items: IProduct[] = Array.isArray(cartItems)
    ? (cartItems as IProduct[])
    : [];
  const { userData } = useAuth();
  const router = useRouter();

  const getLogin = () => {
    router.push("/auth/login?redirect=/cart");
  };

  useEffect(() => {
    const syncCart = async () => {
      if (!userData?.user?.id) return;

      if (hasSyncedRef.current) return;
      hasSyncedRef.current = true;

      // 1. Obtener carrito del backend
      const backendCart = await getCart(userData.user.id);
      const backendItems = backendCart?.items || [];

      console.log("🛒 Items en backend:", backendItems.length);

      // ✅ Si el backend YA tiene productos → ignorar localStorage
      if (backendItems.length > 0) {
        console.log("✅ Backend tiene productos, ignorando localStorage");
        localStorage.removeItem("cart");
        await loadCartFromBackend();
        return;
      }

      // 2. Si backend está vacío → sincronizar localStorage
      const localCart = localStorage.getItem("cart");

      if (localCart) {
        const localItems = JSON.parse(localCart);

        if (localItems.length > 0) {
          console.log("🔄 Backend vacío → sincronizando localStorage → backend");

          for (const item of localItems) {
            await addToCartBackend(
              String(userData.user.id),
              item.id,
              item.quantity || 1,
              userData.token || ""
            );
          }
        }

        // limpiar localStorage después de sincronizar
        localStorage.removeItem("cart");
      }

      // 3. Cargar carrito final desde backend
      await loadCartFromBackend();
    };

    syncCart();
  }, [userData?.user?.id, loadCartFromBackend]);


  const handleCheckout = async () => {
    if (!userData?.user?.id) {
      toast.custom(
        () => (
          <div className="flex items-center gap-3 rounded-md border border-red-800 bg-red-100 px-4 py-2 text-red-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div className="text-sm font-medium">
              Debes iniciar sesión para completar la compra
            </div>
          </div>
        ),
        { duration: 4000 }
      );
      return getLogin();
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await createCheckout(
        userData.user.id,
        userData.token || ""
      );
      const data = response?.data;
      const checkoutUrl = data?.initPoint || data?.sandboxInitPoint;

      if (checkoutUrl) {
        console.log("✅ Redirigiendo a MercadoPago (PRODUCCIÓN):", checkoutUrl);
        localStorage.removeItem("cart");
        window.location.href = checkoutUrl;
      } else {
        console.warn(
          "⚠️ MercadoPago no configurado, orden creada sin initPoint"
        );
        localStorage.removeItem("cart");
        toast.success(
          `✅ ¡Orden #${data?.id?.slice(0, 8)} creada exitosamente! Total: $${data?.total
          }. Redirigiendo al historial...`,
          { duration: 3000 }
        );
        setTimeout(() => {
          setOpen(false);
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error("❌ Error al crear checkout:", error);
      const errorMessage = error.message || "";

      if (
        errorMessage.includes("No hay carrito activo") ||
        errorMessage.includes("vacío")
      ) {
        toast.error(
          "El carrito está vacío. Agrega productos antes de continuar."
        );
      } else if (errorMessage.includes("Insufficient stock")) {
        toast.error("Uno o más productos no tienen stock suficiente.");
      } else {
        toast.error(errorMessage || "Error al procesar el pago");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!userData?.user?.id) {
      toast.error("Debes iniciar sesión para continuar");
      return getLogin();
    }

    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    setIsCheckingOut(true);
    try {
      // Llamar a la API del backend para crear una sesión de checkout
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sale-orders/checkout-stripe/${userData.user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            success_url: `${window.location.origin}/checkout/success`,
            cancel_url: `${window.location.origin}/checkout/failure`,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Error al crear la sesión de checkout"
        );
      }

      // Redirigir a la URL de checkout
      window.location.href = result.data.checkoutUrl;
    } catch (error: any) {
      console.error("Error al procesar el pago con Stripe:", error);
      toast.error(error.message || "Error al procesar el pago con Stripe");
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    if (shippingData.postalCode) {
      setPostalCodeInput(shippingData.postalCode);
    }
  }, [shippingData.postalCode]);

  const handleCalculateShipping = async (postalCode: string) => {
    if (!postalCode.trim() || items.length === 0) return;

    setLoadingShipping(true);
    try {
      const itemsForShipping = items.map((item) => ({
        productId: String(item.id),
        quantity: item.quantity || 1,
      }));

      // Intentar primero con geolocalización
      let result = null;

      try {
        if ("geolocation" in navigator) {
          console.log("📍 Intentando obtener ubicación del usuario...");
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 300000,
              });
            }
          );

          const { latitude, longitude } = position.coords;
          console.log("✅ Ubicación obtenida:", { latitude, longitude });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sale-orders/calculate-shipping`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...(userData?.token && { Authorization: userData.token }),
              },
              body: JSON.stringify({
                latitude,
                longitude,
                items: itemsForShipping,
              }),
            }
          );

          if (response.ok) {
            result = await response.json();
            console.log("✅ Cálculo con coordenadas exitoso:", result);
          } else {
            throw new Error("Falló el cálculo con coordenadas");
          }
        }
      } catch (geoError: any) {
        console.warn("⚠️ No se pudo usar geolocalización:", geoError.message);
      }

      // Si falló la geolocalización, usar código postal
      if (!result) {
        console.log("🚚 Calculando envío con código postal:", postalCode);
        result = await calculateShipping(
          postalCode,
          itemsForShipping,
          userData?.token
        );
        console.log("✅ Resultado del cálculo:", result);
      }

      if (result && typeof result.shippingCost === "number") {
        setShippingCost(result.shippingCost);
      } else if (result && typeof result.cost === "number") {
        setShippingCost(result.cost);
      } else {
        setShippingCost(0);
      }
    } catch (error: any) {
      console.error("❌ Error al calcular envío:", error);
      setShippingCost(null);
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleSavePostalCode = () => {
    if (!postalCodeInput.trim()) {
      toast.error("Ingresa un código postal válido");
      return;
    }
    updatePostalCode(postalCodeInput);
    handleCalculateShipping(postalCodeInput);
    toast.success("Código postal guardado");
  };

  // Recalcular envío cuando cambian los items del carrito
  useEffect(() => {
    if (shippingData.postalCode && items.length > 0) {
      handleCalculateShipping(shippingData.postalCode);
    }
  }, [items.length]);

  const handleUpdateQuantity = async (
    productId: number | string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId: number | string) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  return (
    <div className="relative min-h-screen pt-20">
      <div className="fixed inset-0 pt-20 z-0">
        <div className="absolute inset-0 bg-linear-to-r from-amber-100 via-amber-50 to-transparent" />
        <Image
          src={perrocompra}
          alt="Perro con bolsa de compras"
          fill
          className="object-contain object-left"
          priority
        />
      </div>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-30 right-8 z-50 bg-amber-500 cursor-pointer
           hover:bg-amber-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Abrir carrito"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {itemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
              {itemsCount}
            </span>
          )}
        </button>
      )}

      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed top-26 bottom-4 right-2 xs:right-4 sm:right-8 md:right-14 flex max-w-full pl-2 xs:pl-4 sm:pl-8">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <div className="flex h-full w-full border-amber-200 border-2 rounded-2xl flex-col bg-white shadow-xl">
                  {/* Header fijo del carrito */}
                  <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-gray-900">
                        Tu carrito
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            router.push("/");
                          }}
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contenido con scroll */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flow-root border-amber-200">
                      <ul role="list" className="-my-6">
                          {items.length === 0 ? (
                            <li className="py-6 text-gray-600">
                              Tu carrito está vacío
                            </li>
                          ) : (
                            items.map((item: IProduct, index: number) => {
                              let imageSrc: string | StaticImageData =
                                fallbackImage;
                              const imageToUse =
                                (item as any).imgUrl || item.image;

                              if (imageToUse) {
                                if (typeof imageToUse === "string") {
                                  if (
                                    imageToUse.startsWith("http://") ||
                                    imageToUse.startsWith("https://")
                                  ) {
                                    imageSrc = imageToUse;
                                  } else {
                                    imageSrc = `${process.env.NEXT_PUBLIC_API_URL}${imageToUse}`;
                                  }
                                } else {
                                  imageSrc = imageToUse;
                                }
                              }

                              return (
                                <li
                                  key={item.id}
                                  className={`flex py-3 sm:py-6 px-2 sm:px-4 rounded-lg ${index % 2 === 0 ? "bg-amber-50" : "bg-white"
                                    }`}
                                >
                                  <div className="size-16 sm:size-24 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                    <Image
                                      src={imageSrc}
                                      alt={item.name}
                                      width={96}
                                      height={96}
                                      loading="lazy"
                                      className="object-cover w-full h-full"
                                    />
                                  </div>

                                  <div className="ml-2 sm:ml-4 flex flex-1 flex-col min-w-0">
                                    <div>
                                      <div className="flex justify-between text-sm sm:text-base font-medium text-gray-900">
                                        <h3 className="truncate pr-2">
                                          <a href={`/product/${item.id}`}>
                                            {item.name}
                                          </a>
                                        </h3>
                                        <p className="ml-2 shrink-0 text-xs sm:text-base">
                                          $
                                          {(
                                            Number(item.price) *
                                            (item.quantity || 1)
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2">
                                        {item.description}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-400">
                                        Precio unitario: $
                                        {Number(item.price).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm mt-2">
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <button
                                          onClick={() =>
                                            handleUpdateQuantity(
                                              item.id,
                                              (item.quantity || 1) - 1
                                            )
                                          }
                                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 text-sm"
                                          disabled={(item.quantity || 1) <= 1}
                                        >
                                          −
                                        </button>
                                        <span className="w-8 sm:w-12 text-center font-medium text-xs sm:text-sm">
                                          {item.quantity || 1}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleUpdateQuantity(
                                              item.id,
                                              (item.quantity || 1) + 1
                                            )
                                          }
                                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-amber-200 hover:bg-amber-300 flex items-center justify-center font-bold text-gray-700 text-sm"
                                        >
                                          +
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveItem(item.id)
                                        }
                                        className="font-medium text-red-600 rounded-md px-1 sm:px-2 py-1 hover:bg-red-600 hover:text-white transition-colors duration-200 text-xs sm:text-sm"
                                      >
                                        Quitar
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </div>

                    {/* Selector de método de entrega */}
                    {items.length > 0 && (
                      <DeliveryMethodSelector
                        deliveryMethod={deliveryMethod}
                        onMethodChange={setDeliveryMethod}
                        shippingCost={shippingCost}
                      />
                    )}

                    {/* Resumen de costos */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-base text-gray-900">
                        <p>Subtotal</p>
                        <p className="font-medium">
                          ${Number(getTotal()).toLocaleString()}
                        </p>
                      </div>

                      {/* Mostrar código postal y costo de envío solo si eligió envío a domicilio */}
                      {deliveryMethod === 'shipping' && shippingData.postalCode && (
                        <div className="flex justify-between text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>Envío a: {shippingData.postalCode}</span>
                          </div>
                          {loadingShipping ? (
                            <div className="flex items-center gap-1">
                              <svg
                                className="animate-spin h-4 w-4 text-green-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <span className="text-xs">Calculando...</span>
                            </div>
                          ) : shippingCost !== null ? (
                            <span className="font-medium text-green-700">
                              {shippingCost === 0
                                ? "GRATIS"
                                : `$${shippingCost.toLocaleString()}`}
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600">
                              A calcular
                            </span>
                          )}
                        </div>
                      )}

                      {/* Mostrar costo de envío */}
                      {deliveryMethod === 'shipping' && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <p>Envío</p>
                          <p className="font-medium">
                            {loadingShipping ? (
                              <span className="text-xs">Calculando...</span>
                            ) : shippingCost !== null ? (
                              shippingCost === 0 ? "GRATIS" : `$${shippingCost.toLocaleString()}`
                            ) : (
                              <span className="text-xs text-amber-600">A calcular</span>
                            )}
                          </p>
                        </div>
                      )}

                      {deliveryMethod === 'pickup' && (
                        <div className="flex justify-between text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <p className="font-medium">Retiro en tienda</p>
                          <p className="font-semibold">GRATIS</p>
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                        <p>Total</p>
                        <p className="text-orange-600">
                          $
                          {(
                            Number(getTotal()) + (deliveryMethod === 'shipping' ? (shippingCost || 0) : 0)
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* Info de envío */}
                      {deliveryMethod === 'shipping' && shippingCost !== null && shippingCost > 0 && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                          🚚 Costo de envío calculado según tu ubicación
                        </p>
                      )}
                    </div>

                    {/* Formulario de código postal - solo si eligió envío */}
                    {items.length > 0 && deliveryMethod === 'shipping' && !shippingData.postalCode && (
                      <div className="mt-6 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <h3 className="text-sm font-semibold text-blue-900">
                            ¿A dónde enviamos tu pedido?
                          </h3>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={postalCodeInput}
                              onChange={(e) =>
                                setPostalCodeInput(e.target.value)
                              }
                              placeholder="Código postal"
                              className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                            />
                          </div>
                          <button
                            onClick={handleSavePostalCode}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-sm whitespace-nowrap"
                          >
                            Guardar
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-blue-700">
                          💡 Ingresá tu código postal para calcular el envío
                        </p>
                      </div>
                    )}

                    {/* Botón para cambiar código postal si ya existe uno y eligió envío */}
                    {items.length > 0 && deliveryMethod === 'shipping' && shippingData.postalCode && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            const newPostal = prompt(
                              "Ingresá tu nuevo código postal:",
                              shippingData.postalCode
                            );
                            if (newPostal && newPostal.trim()) {
                              updatePostalCode(newPostal.trim());
                              setPostalCodeInput(newPostal.trim());
                              handleCalculateShipping(newPostal.trim());
                              toast.success("Código postal actualizado");
                            }
                          }}
                          disabled={loadingShipping}
                          className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                        >
                          Cambiar código postal
                        </button>
                      </div>
                    )}

                    {/* Botones de pago */}
                    <PaymentButtons
                      isCheckingOut={isCheckingOut}
                      itemsLength={items.length}
                      userData={userData}
                      totalAmount={getTotal()}
                      onMercadoPagoCheckout={handleCheckout}
                      onStripeCheckout={handleStripeCheckout}
                      onLogin={getLogin}
                    />

                    <div className="relative mt-6 mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">o</span>
                      </div>
                    </div>

                    <div className="flex justify-center text-center text-sm text-gray-500 mb-4">
                      <button
                        type="button"
                        onClick={handleClearCart}
                        className="font-medium text-amber-500 hover:text-red-600 transition-colors"
                        disabled={items.length === 0}
                      >
                        Vaciar carrito
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>

      {showPaymentModal && preferenceId && (
        <Dialog
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          className="relative z-50"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="max-w-lg w-full bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle className="text-xl font-semibold">
                  Completa tu pago
                </DialogTitle>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <MercadoPagoWallet preferenceId={preferenceId} />

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                  📝 Instrucciones importantes:
                </p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Haz clic en el botón azul de MercadoPago</li>
                  <li>Completa el pago en la nueva ventana</li>
                  <li>
                    Después del pago, <strong>vuelve a esta pestaña</strong>
                  </li>
                  <li>Tu pedido se procesará automáticamente</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  router.push("/dashboard");
                }}
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Ver mis pedidos
              </button>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default CartPage;
