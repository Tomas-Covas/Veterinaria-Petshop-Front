"use client"
import React from "react";
import Link from 'next/link'
import Image from 'next/image'
import { IProduct } from "@/src/types";
import AddCartButton from "../AddCartButton/AddCartButton";

interface CardProps {
  product: IProduct
}

function Card({ product }: CardProps) {
  const href = product.id ? `/product/${product.id}` : undefined;

  // Manejar diferentes tipos de imagen: string URL, objeto StaticImageData, o fallback
  let imageSrc: string | any = '/next.svg';
  const imageToUse = (product as any).imgUrl || product.image;
  
  if (imageToUse) {
    if (typeof imageToUse === 'string') {
      if (imageToUse.startsWith('http://') || imageToUse.startsWith('https://')) {
        imageSrc = imageToUse;
      } else if (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
        imageSrc = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${imageToUse}`;
      }
    } else {
      imageSrc = imageToUse; // StaticImageData
    }
  }

  const content = (
    <div
      className="
        group relative
        max-w-sm 
        bg-linear-to-br from-white via-gray-100 to-amber-100 
        p-4 rounded-lg shadow 
        cursor-pointer flex flex-col
        transition-transform duration-300 hover:scale-105
        "
    >
      <Link href={href || '#'} prefetch className="inline-block">
        {/* Imagen normal */}
        <div className="w-full aspect-4/3 overflow-hidden rounded-md bg-gray-50 relative">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            loading="lazy"
            className="object-contain p-2"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>

        {/* Info normal */}
        <div className="mt-4 flex-1">
          <h3 className="text-sm text-gray-700 line-clamp-2">
            <span className="inset-0">{product.name}</span>
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-medium text-gray-900">${product.price}</p>
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        </div>

      </Link>
      <div className="mt-[-35px] justify-end">
        <AddCartButton product={product} variant="icon"/>
      </div>
    </div>
  );

  return href ? (
    <div>

      {content}

    </div>
  ) : (
    content
  );
}

export default Card;
