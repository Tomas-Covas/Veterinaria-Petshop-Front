'use client'

import Image, { StaticImageData } from 'next/image'
import React from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: string
  stock: number
  imgUrl: string | StaticImageData
}

interface OrderItem {
  id: string
  quantity: number
  unitPrice: string
  product: Product
}

export interface Order {
  id: string
  total: string
  status: 'ACTIVE' | 'delivered'
  paymentMethod: string | null
  notes: string | null
  createdAt: string
  expiresAt: string
  mercadoPagoId: string | null
  mercadoPagoStatus: string | null
  items: OrderItem[]
}

interface Props {
  order: Order
}

const OrderCard: React.FC<Props> = ({ order }) => {
  return (
    <div className="border border-gray-400 p-4 rounded-lg mb-4 bg-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="font-bold text-lg text-gray-800">Orden #{order.id}</h2>
      <p className="text-gray-700">
        Total: <span className="font-semibold">${order.total}</span>
      </p>
      <p className="text-gray-700">
        Estado:{' '}
        <span
          className={`font-semibold ${order.status === 'ACTIVE' ? 'text-blue-600' : 'text-green-600'
            }`}
        >
          {order.status === 'ACTIVE' ? 'Activa' : 'Entregada'}
        </span>
      </p>
      <p className="text-gray-700">
        Fecha creación: {new Date(order.createdAt).toLocaleString()} hs
      </p>
      <p className="text-gray-700">
        Expira: {new Date(order.expiresAt).toLocaleString()} hs
      </p>

      {order.paymentMethod && (
        <p className="text-gray-700">Método de pago: {order.paymentMethod}</p>
      )}
      {order.notes && (
        <p className="text-gray-700">Notas: {order.notes}</p>
      )}

      {order.mercadoPagoId && (
        <p className="text-gray-700">MP ID: {order.mercadoPagoId}</p>
      )}
      {order.mercadoPagoStatus && (
        <p className="text-gray-700">MP Estado: {order.mercadoPagoStatus}</p>
      )}

      <h3 className="mt-3 font-semibold text-gray-800">Items:</h3>
      {order.items.map((item) => {
        // Validar que la imagen sea una URL válida
        /* const getValidImageUrl = () => {
          const imgUrl = item.product.imgUrl;
          if (!imgUrl || imgUrl === 'No image' || imgUrl === 'no image') {
            return 'https://placehold.co/400x400/f59e0b/white?text=Sin+Imagen';
          }
          // Si es una URL válida (empieza con http:// o https://)
          if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
            return imgUrl;
          }
          // Si es una ruta relativa, no es válida para Image de Next.js
          return 'https://placehold.co/400x400/f59e0b/white?text=Sin+Imagen';
        }; */

        return (
          <div
            key={item.id}
            className="ml-4 mt-2 text-sm text-gray-600 flex items-start space-x-3"
          >
            <Image
              src={item.product.imgUrl || 'https://placehold.co/200x200/f59e0b/white?text=Sin+Imagen' }
              alt={item.product.name}
              width={200}
              height={200}
              className="w-16 h-16 object-cover rounded-md border"
            />
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className='flex justify-between'>Precio unidad: ${item.unitPrice} Cantidad: {item.quantity}</p>
              <p>Subtotal: ${parseFloat(item.unitPrice) * item.quantity}</p>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default OrderCard
