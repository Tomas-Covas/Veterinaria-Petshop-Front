'use client';

interface PaymentButtonsProps {
  isCheckingOut: boolean;
  itemsLength: number;
  userData: any;
  totalAmount: number;
  onMercadoPagoCheckout: () => void;
  onStripeCheckout: () => void;
  onLogin: () => void;
}

export default function PaymentButtons({
  isCheckingOut,
  itemsLength,
  userData,
  totalAmount,
  onMercadoPagoCheckout,
  onStripeCheckout,
  onLogin
}: PaymentButtonsProps) {
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-5 w-5"
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
  );

  const MercadoPagoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.95 17.4l-4.95-4.95-4.95 4.95L6 16.35l4.95-4.95L6 6.45 7.05 5.4l4.95 4.95 4.95-4.95L18 6.45l-4.95 4.95 4.95 4.95-1.05 1.05z" />
    </svg>
  );

  const StripeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
  );

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-gray-700 mb-2">Método de pago</p>
      <div className="grid grid-cols-2 gap-2">
        {/* MercadoPago */}
        <button
          onClick={!userData ? onLogin : onMercadoPagoCheckout}
          className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-transparent bg-amber-400 hover:bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={itemsLength === 0 || isCheckingOut}
        >
          {isCheckingOut ? (
            <LoadingSpinner />
          ) : (
            <>
              <MercadoPagoIcon />
              <span className="text-xs">MercadoPago</span>
            </>
          )}
        </button>

        {/* Stripe con tooltip */}
        <div className="relative group">
          <button
            onClick={onStripeCheckout}
            className="w-full flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-transparent bg-blue-500 hover:bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={itemsLength === 0 || isCheckingOut}
          >
            {isCheckingOut ? (
              <LoadingSpinner />
            ) : (
              <>
                <StripeIcon />
                <span className="text-xs">Stripe</span>
              </>
            )}
          </button>
          
          {/* Tooltip con info de USD - aparece al hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 z-10">
            <div className="bg-blue-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
              <p className="font-semibold mb-1">💵 Pago en USD</p>
              <p className="text-blue-200">
                Aprox: ${(totalAmount / 1436).toFixed(2)} USD
              </p>
              <p className="text-blue-300 mt-1">
                Tu banco puede aplicar tasas adicionales
              </p>
              {/* Flecha del tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-8 border-transparent border-t-blue-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
