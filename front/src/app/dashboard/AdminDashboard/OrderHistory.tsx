'use client';

import { useState } from 'react';

interface Order {
  id: string;
  createdAt?: string;
  total?: string;
  status: string;
  paymentMethod?: string;
  notes?: string;
  mercadoPagoId?: string;
  mercadoPagoStatus?: string;
  buyer?: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  items?: Array<{
    id?: string;
    product?: {
      id?: string;
      name: string;
      description?: string;
      price?: string;
      imgUrl?: string;
    };
    quantity: number;
    unitPrice: string;
  }>;
}

interface OrderHistoryProps {
  orders: Order[];
  loading: boolean;
}

export default function OrderHistory({ orders, loading }: OrderHistoryProps) {
  const [expandedOrderGroups, setExpandedOrderGroups] = useState<Record<string, boolean>>({
    today: true,
    week: false,
    month: false,
    older: false
  });
  const [orderFilters, setOrderFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    searchClient: '',
    category: 'all'
  });

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    }
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completado':
      case 'confirmed':
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleOrderGroup = (group: string) => {
    setExpandedOrderGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const filterOrders = (orders: Order[]) => {
    return orders.filter(order => {
      // Filtro por fecha
      if (orderFilters.startDate && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(orderFilters.startDate);
        if (orderDate < startDate) return false;
      }
      if (orderFilters.endDate && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const endDate = new Date(orderFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (orderDate > endDate) return false;
      }
      
      // Filtro por estado
      if (orderFilters.status !== 'all' && order.status?.toLowerCase() !== orderFilters.status.toLowerCase()) {
        return false;
      }
      
      // Filtro por cliente
      if (orderFilters.searchClient) {
        const searchTerm = orderFilters.searchClient.toLowerCase();
        const buyerName = order.buyer?.name?.toLowerCase() || '';
        const buyerEmail = order.buyer?.email?.toLowerCase() || '';
        if (!buyerName.includes(searchTerm) && !buyerEmail.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const groupOrdersByDate = (orders: Order[]) => {
    const filteredOrders = filterOrders(orders);
    
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

    filteredOrders.forEach(order => {
      if (!order.createdAt) return;
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
      orders.reduce((sum, order) => sum + (parseFloat(order.total || '0')), 0);

    return [
      { title: 'Hoy', key: 'today', orders: groups.today, total: calculateTotal(groups.today) },
      { title: 'Última semana', key: 'week', orders: groups.week, total: calculateTotal(groups.week) },
      { title: 'Último mes', key: 'month', orders: groups.month, total: calculateTotal(groups.month) },
      { title: 'Anteriores', key: 'older', orders: groups.older, total: calculateTotal(groups.older) }
    ].filter(group => group.orders.length > 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Compras</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filterOrders(orders).length} de {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'} · Total filtrado: ${filterOrders(orders).reduce((sum, order) => sum + parseFloat(order.total || '0'), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
          {(orderFilters.startDate || orderFilters.endDate || orderFilters.status !== 'all' || orderFilters.searchClient) && (
            <button
              onClick={() => setOrderFilters({ startDate: '', endDate: '', status: 'all', searchClient: '', category: 'all' })}
              className="ml-auto text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={orderFilters.startDate}
              onChange={(e) => setOrderFilters({ ...orderFilters, startDate: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={orderFilters.endDate}
              onChange={(e) => setOrderFilters({ ...orderFilters, endDate: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
            <select
              value={orderFilters.status}
              onChange={(e) => setOrderFilters({ ...orderFilters, status: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Buscar Cliente */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              value={orderFilters.searchClient}
              onChange={(e) => setOrderFilters({ ...orderFilters, searchClient: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mostrar filtros activos */}
        {(orderFilters.startDate || orderFilters.endDate || orderFilters.status !== 'all' || orderFilters.searchClient) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Filtros activos:</p>
            <div className="flex flex-wrap gap-2">
              {orderFilters.startDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  Desde: {new Date(orderFilters.startDate).toLocaleDateString('es-AR')}
                  <button onClick={() => setOrderFilters({ ...orderFilters, startDate: '' })} className="hover:text-amber-900">✕</button>
                </span>
              )}
              {orderFilters.endDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  Hasta: {new Date(orderFilters.endDate).toLocaleDateString('es-AR')}
                  <button onClick={() => setOrderFilters({ ...orderFilters, endDate: '' })} className="hover:text-amber-900">✕</button>
                </span>
              )}
              {orderFilters.status !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  Estado: {orderFilters.status}
                  <button onClick={() => setOrderFilters({ ...orderFilters, status: 'all' })} className="hover:text-amber-900">✕</button>
                </span>
              )}
              {orderFilters.searchClient && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  Cliente: "{orderFilters.searchClient}"
                  <button onClick={() => setOrderFilters({ ...orderFilters, searchClient: '' })} className="hover:text-amber-900">✕</button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-8 text-gray-500">
            No hay compras registradas
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupOrdersByDate(orders).map((group) => {
            const isExpanded = expandedOrderGroups[group.key];

            return (
              <div key={group.key} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Header del grupo */}
                <button
                  onClick={() => toggleOrderGroup(group.key)}
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
                          {group.orders.length} {group.orders.length === 1 ? 'orden' : 'órdenes'}
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
                      <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          {/* Orden y Fecha */}
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="shrink-0">
                              <p className="text-xs text-gray-500 uppercase">Orden</p>
                              <p className="text-sm font-semibold text-gray-900">
                                #{order.id?.substring(0, 8) || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-AR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'Sin fecha'}
                              </p>
                            </div>
                            
                            {/* Cliente */}
                            <div className="shrink-0 border-l border-gray-200 pl-4">
                              <p className="text-xs text-gray-500 uppercase">Cliente</p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.buyer?.name || 'No especificado'}
                              </p>
                              {order.buyer?.email && (
                                <p className="text-xs text-gray-500">{order.buyer.email}</p>
                              )}
                            </div>
                            
                            {/* Productos */}
                            {order.items && order.items.length > 0 && (
                              <div className="flex-1 min-w-0 border-l border-gray-200 pl-4">
                                <p className="text-xs text-gray-500 uppercase mb-1">Productos</p>
                                <div className="flex flex-wrap gap-1">
                                  {order.items.slice(0, 2).map((item, index) => (
                                    <span key={index} className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                      {item.product?.name || 'Producto'} (x{item.quantity})
                                    </span>
                                  ))}
                                  {order.items.length > 2 && (
                                    <span className="text-xs text-gray-500 italic px-2 py-1">
                                      +{order.items.length - 2} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Total y Estado */}
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right border-l border-gray-200 pl-4">
                              <p className="text-xs text-gray-500 uppercase">Total</p>
                              <p className="text-xl font-bold text-amber-600">
                                ${order.total ? parseFloat(order.total).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0.00'}
                              </p>
                            </div>
                            
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(order.status || 'pending')}`}>
                              {order.status || 'Pendiente'}
                            </span>
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
      )}
    </div>
  );
}
