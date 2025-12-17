import { IPet } from '@/src/types'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import avatar from "@/src/assets/avatarHueso.png"

const CardPet: React.FC<IPet> = (pet) => {

  const getPetAge = () => {
    const start = new Date(pet.fecha_nacimiento).getTime()
    const end = pet.fecha_fallecimiento
      ? new Date(pet.fecha_fallecimiento).getTime()
      : Date.now()
    return Math.floor((end - start) / (1000 * 60 * 60 * 24 * 365.25))
  }

  return (
    <Link href={`/pets/${pet.id}`}>
      <div className="bg-linear-to-br from-orange-400 via-orange-200 to-orange-300 
      rounded-xl shadow-lg p-6 my-2 max-w-md mx-2 cursor-pointer hover:scale-105
      border border-gray-400 hover:shadow-xl transition-shadow">

        <div className="flex flex-row justify-evenly items-center">
          <div className='flex flex-col items-center text-center'>
            {/* Nombre principal*/}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{pet.nombre}</h2>

            {/* Línea decorativa*/}
            <div className="w-12 h-1 bg-orange-500 rounded-full mb-4" />

            {/* Información estructurada */}
            <div className="text-sm text-gray-700 space-y-2">
              <p><span className="font-semibold text-gray-800">Raza:</span> {pet.breed || 'No especificada'}</p>
              <p><span className="font-semibold text-gray-800">Especie:</span> {pet.especie}</p>
              <p><span className="font-semibold text-gray-800">Edad:</span> {getPetAge()} años</p>
              <p><span className="font-semibold text-gray-800">Sexo:</span> {pet.sexo}</p>
            </div>
            <p className='font-bold mt-3 border-t-5 border-b-5 p-2 rounded-2xl'>Ver detalles</p>
          </div>
          <div>
            <Image 
              src={pet.image || avatar} 
              width={120} 
              height={120} 
              alt={pet.nombre}
              className='rounded-full bg-gray-400 object-cover'
              unoptimized={!!pet.image}
              key={pet.image || 'avatar'}
            />
          </div>
          
        </div>
      </div>
    </Link>
  )
}

export default CardPet
