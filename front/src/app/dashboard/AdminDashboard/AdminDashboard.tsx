'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { IProduct } from "@/src/types";
import VeterinarianManagement from "./VeterinarianManagement";
import OrderHistory from "./OrderHistory";
import StoreManagement from "./StoreManagement";
import Analytics from "./Analytics";
import AdminMedicationRequests from "@/src/app/components/AdminMedicationRequests/AdminMedicationRequests";
import dynamic from 'next/dynamic';

const GeneralMedicationsPage = dynamic(() => import('../general-medications/page'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Appointment {
  id: string;
  date: string;
  time: string;
  pet?: {
    name: string;
    user?: {
      name: string;
    };
  };
  veterinarian?: {
    name: string;
  };
  status: string;
  reason?: string;
}

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

interface CategorySales {
  categoryName: string;
  totalSales: number;
  productCount: number;
  orderCount: number;
}

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'appointments' | 'orders' | 'store' | 'medications' | 'general-medications'>('analytics');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (userData?.token) {
      loadAppointments();
      loadOrders();
      loadProducts();
    }
  }, [userData]);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await fetch(`${API_URL}/appointments/AllAppointments`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📅 Turnos recibidos:', data);
        const appointmentsArray = Array.isArray(data) ? data : data.data || [];
        console.log('📊 Total de turnos:', appointmentsArray.length);
        setAppointments(appointmentsArray);
      } else {
        console.error('❌ Error al cargar turnos:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch(`${API_URL}/sale-orders`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🛒 Órdenes recibidas:', data);
        const ordersArray = Array.isArray(data) ? data : data.data || [];
        console.log('📊 Total de órdenes:', ordersArray.length);
        setOrders(ordersArray);
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch(`${API_URL}/products`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Productos recibidos:', data);
        const productsArray = Array.isArray(data) ? data : data.data || [];
        console.log('📊 Total de productos:', productsArray.length);
        setProducts(productsArray);
      } else {
        console.error('❌ Error al cargar productos:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">Bienvenido, {userData?.user?.name}</p>
        </div>

        {/* Tabs - Mobile Dropdown */}
        <div className="mb-6">
          {/* Mobile Dropdown */}
          <div className="xl:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border-2 border-amber-200 rounded-lg py-3 px-4 flex items-center justify-between text-left font-medium text-gray-900 hover:bg-amber-50 transition-all"
            >
              <span>
                {activeTab === 'analytics' && '📊 Analytics'}
                {activeTab === 'appointments' && '📅 Turnos de Veterinarios'}
                {activeTab === 'orders' && '🛒 Historial de Compras'}
                {activeTab === 'store' && '🏪 Administración de Store'}
                {activeTab === 'medications' && '🔐 Medicamentos Controlados'}
                {activeTab === 'general-medications' && '💊 Medicamentos Generales'}
              </span>
              <svg 
                className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-amber-200 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => { setActiveTab('analytics'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-all ${
                    activeTab === 'analytics' ? 'bg-amber-100 text-amber-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => { setActiveTab('appointments'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-all ${
                    activeTab === 'appointments' ? 'bg-amber-100 text-amber-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  📅 Turnos de Veterinarios
                </button>
                <button
                  onClick={() => { setActiveTab('orders'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-all ${
                    activeTab === 'orders' ? 'bg-amber-100 text-amber-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  🛒 Historial de Compras
                </button>
                <button
                  onClick={() => { setActiveTab('store'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-all ${
                    activeTab === 'store' ? 'bg-amber-100 text-amber-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  🏪 Administración de Store
                </button>
                <button
                  onClick={() => { setActiveTab('medications'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-all ${
                    activeTab === 'medications' ? 'bg-amber-100 text-amber-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  🔐 Medicamentos Controlados
                </button>
                <button
                  onClick={() => { setActiveTab('general-medications'); setIsDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-amber-50 transition-all ${
                    activeTab === 'general-medications' ? 'bg-amber-100 text-amber-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  💊 Medicamentos Generales
                </button>
              </div>
            )}
          </div>

          {/* Desktop Tabs */}
          <div className="hidden xl:block border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`${
                  activeTab === 'appointments'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                📅 Turnos de Veterinarios
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`${
                  activeTab === 'orders'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                🛒 Historial de Compras
              </button>
              <button
                onClick={() => setActiveTab('store')}
                className={`${
                  activeTab === 'store'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                🏪 Administración de Store
              </button>
              <button
                onClick={() => setActiveTab('medications')}
                className={`${
                  activeTab === 'medications'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                🔐 Medicamentos Controlados
              </button>
              <button
                onClick={() => setActiveTab('general-medications')}
                className={`${
                  activeTab === 'general-medications'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                💊 Medicamentos Generales
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'analytics' && (
          <Analytics />
        )}

        {activeTab === 'appointments' && (
          <VeterinarianManagement 
            appointments={appointments} 
            loading={loadingAppointments}
          />
        )}

        {activeTab === 'orders' && (
          <OrderHistory 
            orders={orders} 
            loading={loadingOrders}
          />
        )}

        {activeTab === 'store' && (
          <StoreManagement 
            products={products} 
            loading={loadingProducts}
            onProductsChange={loadProducts}
            userToken={userData?.token}
          />
        )}

        {activeTab === 'medications' && (
          <AdminMedicationRequests />
        )}

        {activeTab === 'general-medications' && (
          <GeneralMedicationsPage />
        )}
      </div>
    </div>
  );
}
