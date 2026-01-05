'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: any[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Función helper para convertir imagen a src
  const getImageSrc = (image: any): string | any => {
    if (!image) return '/next.svg';
    if (typeof image === 'string') {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      } else if (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${image}`;
      }
    }
    return image; // Es StaticImageData
  };

  return (
    <>
      {/* Desktop */}
      <div className="col-span-2 max-lg:hidden">
        <div className="flex gap-4">
          {/* Miniaturas verticales a la izquierda */}
          {images.length > 1 && (
            <div className="flex flex-col gap-3 w-24">
              {images.slice(0, 6).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`aspect-square overflow-hidden rounded-lg bg-white border-2 transition ${
                    selectedIndex === idx 
                      ? 'border-orange-500' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Image
                    alt={`${productName} - imagen ${idx + 1}`}
                    src={getImageSrc(img)}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Imagen principal a la derecha */}
          <div className="flex-1 aspect-w-4 aspect-h-3 overflow-hidden rounded-lg bg-white border border-gray-200 flex items-center justify-center px-0 py-2 cursor-zoom-in">
            <Image
              alt={productName}
              src={getImageSrc(images[selectedIndex])}
              width={600}
              height={400}
              loading="lazy"
              className="object-contain max-h-full max-w-full transition-transform duration-500 ease-in-out hover:scale-125"
              sizes="66vw"
            />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        {/* Imagen principal */}
        <div className="aspect-square overflow-hidden rounded-lg bg-white border border-gray-200 flex items-center justify-center px-0 py-2 cursor-zoom-in">
          <Image
            alt={productName}
            src={getImageSrc(images[selectedIndex])}
            width={600}
            height={600}
            loading="lazy"
            className="object-contain max-h-full max-w-full transition-transform duration-500 ease-in-out hover:scale-125"
          />
        </div>
        
        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-2 px-4">
            {images.slice(0, 4).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`aspect-square overflow-hidden rounded-lg bg-white border-2 transition ${
                  selectedIndex === idx 
                    ? 'border-orange-500' 
                    : 'border-gray-200'
                }`}
              >
                <Image
                  alt={`${productName} - imagen ${idx + 1}`}
                  src={getImageSrc(img)}
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
