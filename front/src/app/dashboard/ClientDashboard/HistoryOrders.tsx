'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { getOrderHistory } from '@/src/services/order.services';
import Image from 'next/image';

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  items: OrderItem[];
}

interface OrderGroup {
  title: string;
  orders: Order[];
  total: number;
}

export default function HistoryOrders() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    today: true,
    week: false,
    month: false,
    older: false
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const groupOrdersByDate = (orders: Order[]): OrderGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: Record<string, Order[]> = {
      today: [],
      week: [],
      month: [],
      older: []
    };

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= today) {
        groups.today.push(order);
      } else if (orderDate >= weekAgo) {
        groups.week.push(order);
      } else if (orderDate >= monthAgo) {
        groups.month.push(order);
      } else {
        groups.older.push(order);
      }
    });

    const calculateTotal = (orders: Order[]) => 
      orders.reduce((sum, order) => sum + Number(order.total), 0);

    return [
      { title: 'Hoy', orders: groups.today, total: calculateTotal(groups.today) },
      { title: 'Última semana', orders: groups.week, total: calculateTotal(groups.week) },
      { title: 'Último mes', orders: groups.month, total: calculateTotal(groups.month) },
      { title: 'Anteriores', orders: groups.older, total: calculateTotal(groups.older) }
    ].filter(group => group.orders.length > 0);
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (!userData?.user?.id) {
        console.log('❌ No hay userId en userData');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Cargando historial para userId:', userData.user.id);
        setLoading(true);
        const result = await getOrderHistory(String(userData.user.id), userData.token || '');
        console.log('✅ Historial recibido:', result);
        console.log('📦 Cantidad de órdenes del backend:', result?.length || 0);
        
        // Filtrar solo las órdenes que realmente pertenecen a este usuario
        const userOrders = (result || []).filter((order: any) => {
          const orderUserId = order.buyerId || order.buyer?.id || order.userId;
          const belongs = orderUserId === userData.user.id;
          
          if (!belongs) {
            console.warn('⚠️ Orden filtrada (no pertenece al usuario):', {
              orderId: order.id,
              orderBuyerId: orderUserId,
              currentUserId: userData.user.id
            });
          }
          
          return belongs;
        });
        
        console.log('✅ Órdenes del usuario actual:', userOrders.length);
        setOrders(userOrders);
      } catch (err: any) {
        console.error('❌ Error al cargar historial:', err);
        setError(err.message || 'Error al cargar el historial de compras');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [userData?.user?.id, userData?.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Debes iniciar sesión para ver tu historial de compras</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-24 w-24 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No hay compras registradas</h3>
        <p className="mt-2 text-sm text-gray-500">Cuando realices tu primera compra aparecerá aquí</p>
      </div>
    );
  }

  const orderGroups = groupOrdersByDate(orders);
  const totalGeneral = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Compras</h2>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} {orders.length === 1 ? 'compra' : 'compras'} · Total: ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {orderGroups.map((group, index) => {
        const groupKey = ['today', 'week', 'month', 'older'][index] || 'older';
        const isExpanded = expandedGroups[groupKey];

        return (
          <div key={groupKey} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Header del grupo */}
            <button
              onClick={() => toggleGroup(groupKey)}
              className="w-full bg-linear-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 hover:from-amber-100 hover:to-orange-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 text-amber-600 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">{group.title}</h3>
                    <p className="text-sm text-gray-600">
                      {group.orders.length} {group.orders.length === 1 ? 'compra' : 'compras'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ${group.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </button>

            {/* Contenido del grupo (desplegable) */}
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {group.orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    {/* Header de la orden */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Fecha de compra</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total de la orden</p>
                        <p className="text-xl font-bold text-amber-600">
                          ${Number(order.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Items de la orden */}
                    <div className="space-y-3">
                      {order.items.map((item) => {
                        // Validar que la imagen sea una URL válida
                        const getValidImageUrl = () => {
                          const imgUrl = item.product.image;
                          if (!imgUrl || imgUrl === 'No image' || imgUrl === 'no image') {
                            return 'https://placehold.co/400x400/f59e0b/white?text=Sin+Imagen';
                          }
                          if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
                            return imgUrl;
                          }
                          return 'https://placehold.co/400x400/f59e0b/white?text=Sin+Imagen';
                        };

                        return (
                          <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                            {/* Imagen del producto */}
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-white shrink-0 border border-gray-200">
                              <Image
                                src={getValidImageUrl()}
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            {/* Detalles del producto */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                              <p className="text-xs text-gray-500 truncate">{item.product.description}</p>
                              <p className="text-xs text-gray-600 mt-1">Cantidad: {item.quantity}</p>
                            </div>

                            {/* Precio */}
                            <div className="text-right shrink-0">
                              <p className="text-xs text-gray-500">${Number(item.unitPrice).toLocaleString('es-AR')} c/u</p>
                              <p className="text-sm font-semibold text-gray-900">
                                ${(Number(item.unitPrice) * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer con estado */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Pagado
                        </span>
                        <p className="text-xs text-gray-500">Order ID: {order.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
