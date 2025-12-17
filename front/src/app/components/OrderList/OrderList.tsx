'use client'

import { Order } from '@/src/types'
import React from 'react'
import OrderCard from '../OrderCard/OrderCard'

interface Props {
  orders: Order[]
}

const OrderList: React.FC<Props> = ({ orders }) => {
  console.log('📋 OrderList recibió orders:', orders);
  console.log('📊 Cantidad de orders:', orders?.length);

  if (!orders || orders.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No tienes órdenes registradas
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

export default OrderList
