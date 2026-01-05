import React, { useState } from "react";
import Link from 'next/link'
import Image from 'next/image'
import { IProduct } from "@/src/types";

interface AdminProductCardProps {
    product: IProduct;
    onPriceUpdate: (productId: string | number, newPrice: number) => Promise<void>;
}

function AdminProductCard({ product, onPriceUpdate }: AdminProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(product.price.toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const href = product.id ? `/product/${product.id}` : undefined;
  
  // Manejar diferentes tipos de imagen: string URL, objeto StaticImageData, o fallback
  let imageSrc: string | any = '/next.svg';
  if (product.image) {
    if (typeof product.image === 'string') {
      if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
        imageSrc = product.image;
      } else if (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
        imageSrc = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${product.image}`;
      }
    } else {
      // Es un objeto StaticImageData de Next.js
      imageSrc = product.image;
    }
  }

  const handleSavePrice = async () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      alert('Ingresa un precio válido');
      return;
    }

    setIsUpdating(true);
    try {
      await onPriceUpdate(product.id, price);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar precio:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-sm bg-linear-to-br from-white via-gray-100 to-amber-100 p-4 rounded-lg shadow hover:shadow-xl transition-transform hover:scale-105 flex flex-col border-2 border-amber-300">
      {href ? (
        <Link href={href} className="block">
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
        </Link>
      ) : (
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
      )}

      <div className="mt-4 flex-1">
        <h3 className="text-sm text-gray-700 line-clamp-2 font-semibold">
          {product.name}
        </h3>
      </div>

      <div className="mt-4 space-y-2">
        {/* Editor de precio */}
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">$</span>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="flex-1 border-2 border-amber-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSavePrice}
                disabled={isUpdating}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xs font-semibold py-1 px-2 rounded transition"
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewPrice(product.price.toString());
                }}
                disabled={isUpdating}
                className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white text-xs font-semibold py-1 px-2 rounded transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">${product.price}</p>
              <span className="text-xs text-gray-500">Stock: {product.stock}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 px-3 rounded transition"
            >
              ✏️ Editar Precio
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminProductCard;
