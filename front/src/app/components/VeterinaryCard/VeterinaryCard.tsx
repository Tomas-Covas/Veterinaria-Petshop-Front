import React from "react";
import Link from 'next/link';
import Image from 'next/image';
import { IVeterinary } from "@/src/types";
import avatar from "@/src/assets/avatar.jpg"

interface VeterinaryCardProps {
    veterinary: IVeterinary;
    disableLink?: boolean; // Nueva prop para desactivar el link
}

function VeterinaryCard({ veterinary, disableLink = false }: VeterinaryCardProps) {
  const href = !disableLink && veterinary.id ? `/veterinarians/${veterinary.id}` : undefined;

  const content = (
    <div className={`w-full h-full bg-linear-to-br from-white via-amber-50 to-amber-100 
    p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${!disableLink ? 'hover:scale-105 cursor-pointer' : ''}
    flex flex-col`}>
      {/* Imagen circular */}
      <div className="w-48 h-48 mx-auto overflow-hidden rounded-full bg-gray-200 relative shrink-0">
        <Image
          src={veterinary.image || avatar}
          alt={veterinary.name}
          fill
          loading="lazy"
          className="object-cover"
          sizes="192px"
        />
      </div>

      {/* Contenido */}
      <div className="mt-6 text-center flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {veterinary.name}
        </h3>
        <p className="text-base text-amber-600 font-semibold mb-3">
          {veterinary.specialty}
        </p>
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">
          {veterinary.description}
        </p>
        
        {/* Footer con experiencia */}
        <div className="pt-4 border-t border-gray-200 mt-auto">
          <span className="text-sm text-gray-600 font-medium">
            {veterinary.experience} años de experiencia
          </span>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} prefetch className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

export default VeterinaryCard;
