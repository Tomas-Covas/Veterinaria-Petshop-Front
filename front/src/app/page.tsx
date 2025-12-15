"use client"

import Carousel from '../app/components/Carousel/Carousel'
import HomeCategories from '../app/components/HomeCategories/HomeCategories'
import Delivery from '../app/components/Delivery/Delivery'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();

  return (
    <div className='pt-20 bg-orange-200'>


      <Carousel />

      {/* Banner de envío con código postal */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Icono y texto principal */}
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-1">¡Envíos a todo el país!</h2>
                <p className="text-blue-100 text-sm md:text-base">Hacé click en el ícono de ubicación arriba para guardar tu código postal</p>
              </div>
            </div>
          </div>

          {/* Características adicionales */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Envío rápido y seguro</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Seguimiento en tiempo real</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Retiro por sucursal disponible</span>
            </div>
          </div>
        </div>
      </div>

      <HomeCategories />

      <Delivery />

    </div>
  );
}
