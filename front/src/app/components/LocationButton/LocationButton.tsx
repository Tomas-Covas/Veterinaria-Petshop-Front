"use client"

import { useState } from 'react';
import { useShipping } from '@/src/context/ShippingContext';

export default function LocationButton() {
  const [showModal, setShowModal] = useState(false);
  const { shippingData, updatePostalCode } = useShipping();
  const [postalInput, setPostalInput] = useState(shippingData.postalCode || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleSave = () => {
    if (postalInput.trim()) {
      updatePostalCode(postalInput.trim());
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Usar API de geocodificación inversa de OpenStreetMap (gratuita)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'es'
              }
            }
          );
          
          const data = await response.json();
          
          if (data && data.address) {
            const { postcode, city, state, town, village, county, country, country_code } = data.address;
            
            // Verificar si la ubicación está en Argentina
            const isArgentina = country_code?.toLowerCase() === 'ar' || 
                               country?.toLowerCase().includes('argent');
            
            if (!isArgentina) {
              setLocationError(`La ubicación detectada es ${country || 'desconocida'}. Si estás en Argentina, ingresá manualmente tu código postal o verifica tu conexión/VPN.`);
              setLoadingLocation(false);
              return;
            }
            
            let locationString = '';
            
            // Priorizar código postal
            if (postcode) {
              locationString = postcode;
            }
            
            // Agregar ciudad/localidad (usar la primera disponible)
            const locality = city || town || village || state || county;
            if (locality) {
              locationString += locationString ? `, ${locality}` : locality;
            }
            
            if (locationString) {
              setPostalInput(locationString);
              setLoadingLocation(false);
            } else {
              setLocationError('No se pudo obtener la dirección exacta');
              setLoadingLocation(false);
            }
          }
        } catch (error) {
          setLocationError('Error al obtener la dirección');
          setLoadingLocation(false);
        }
      },
      (error) => {
        let errorMessage = 'Error al obtener ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso denegado. Activa la ubicación en tu navegador';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
          default:
            errorMessage = `Error al obtener ubicación: ${error.message || 'Desconocido'}`;
        }
        
        console.warn('Error de geolocalización:', errorMessage, error);
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const hasPostalCode = shippingData.postalCode && shippingData.postalCode.trim() !== '';

  return (
    <>
      {/* Botón de ubicación con dirección */}
      <div className="flex items-center">
        <button
          onClick={() => setShowModal(true)}
          className="relative p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          title={hasPostalCode ? `Tu código postal: ${shippingData.postalCode}` : "Ingresá tu código postal"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${hasPostalCode ? 'text-green-600' : 'text-orange-500'}`}
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
          {!hasPostalCode && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
            </span>
          )}
        </button>
        
        {hasPostalCode && (
          <span 
            onClick={() => setShowModal(true)}
            className="text-sm text-gray-700 font-medium cursor-pointer hover:text-orange-500 transition-colors max-w-[150px] truncate"
            title={shippingData.postalCode}
          >
            {shippingData.postalCode}
          </span>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-orange-500"
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
                </div>
                <h2 className="text-xl font-bold text-gray-800">Tu ubicación</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Alert informativo */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-700">
                  Ingresá tu código postal para calcular automáticamente el costo de envío en futuras compras
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal o Dirección
              </label>
              <input
                type="text"
                value={postalInput}
                onChange={(e) => setPostalInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: 1425, Buenos Aires"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                autoFocus
                disabled={loadingLocation}
              />
              
              <button
                onClick={handleGetCurrentLocation}
                disabled={loadingLocation}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingLocation ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Obteniendo ubicación...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Usar ubicación actual</span>
                  </>
                )}
              </button>
              {locationError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {locationError}
                </p>
              )}
            </div>

            {/* Mensaje de éxito */}
            {showSuccess && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-3 rounded flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium text-sm">¡Guardado exitosamente!</span>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!postalInput.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
