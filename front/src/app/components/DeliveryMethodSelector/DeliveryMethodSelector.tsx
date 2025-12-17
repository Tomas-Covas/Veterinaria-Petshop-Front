'use client';

interface DeliveryMethodSelectorProps {
  deliveryMethod: 'shipping' | 'pickup';
  onMethodChange: (method: 'shipping' | 'pickup') => void;
  shippingCost: number | null;
}

export default function DeliveryMethodSelector({
  deliveryMethod,
  onMethodChange,
  shippingCost
}: DeliveryMethodSelectorProps) {
  return (
    <div className="mb-3">
      <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        Método de entrega
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onMethodChange('shipping')}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${
            deliveryMethod === 'shipping'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 bg-white hover:border-orange-300'
          }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            deliveryMethod === 'shipping' ? 'border-orange-500' : 'border-gray-300'
          }`}>
            {deliveryMethod === 'shipping' && (
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            )}
          </div>
          <span className="text-xs font-medium text-gray-900">🚚 Envío</span>
        </button>
        
        <button
          onClick={() => onMethodChange('pickup')}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${
            deliveryMethod === 'pickup'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 bg-white hover:border-orange-300'
          }`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            deliveryMethod === 'pickup' ? 'border-orange-500' : 'border-gray-300'
          }`}>
            {deliveryMethod === 'pickup' && (
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            )}
          </div>
          <span className="text-xs font-medium text-gray-900">🏪 Retiro</span>
        </button>
      </div>
      
      {/* Info de retiro - visible mientras esté seleccionado */}
      {deliveryMethod === 'pickup' && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded-lg">
          <p className="text-xs font-semibold text-amber-900 mb-0.5">📍 Av. Principal 1234, Ciudad</p>
          <p className="text-xs text-amber-700">Lun-Vie 9-18hs | Sáb 9-13hs</p>
        </div>
      )}
    </div>
  );
}
