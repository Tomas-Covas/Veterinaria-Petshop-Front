import React from 'react'
import Image from 'next/image'
import gatoCaja from "@/src/assets/gatoCaja.jpg"

function Banner() {
  const title = "Elegí la forma de envío que quieras"
  const subTitle = "Compra de una manera sencilla sin moverte de tu casa. Selecciona si retiras por nuestra sucursal, si te lo enviamos con nuestra logística o a través del correo Andreani."

  return (
    <div
      className="
        flex flex-col lg:flex-row items-center justify-between
        bg-linear-to-r from-orange-500 to-amber-500
        rounded-3xl shadow-lg overflow-hidden
        p-8 lg:p-12 mb-10 max-w-6xl mx-auto
        transition-transform duration-300 hover:scale-[1.02]
      "
    >
      {/* Texto */}
      <div className="flex-1 text-center lg:text-left text-white">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
          {title}
        </h1>
        <p className="text-lg md:text-xl leading-relaxed opacity-90">
          {subTitle}
        </p>
      </div>

      {/* Imagen */}
      <div className="flex-1 mt-8 lg:mt-0 lg:ml-10 relative w-full aspect-4/3">
        <Image
          src={gatoCaja}
          alt="Gatito en caja"
          fill
          className="object-cover rounded-2xl shadow-md"
          priority
        />
      </div>
    </div>
  )
}

export default Banner
