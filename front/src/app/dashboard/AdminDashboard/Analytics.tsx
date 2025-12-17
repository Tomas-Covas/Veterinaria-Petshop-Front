'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  getLowStockProducts,
  getVeterinarianStats,
  getDiagnosisRecurrence,
  type LowStockProduct,
  type VeterinarianStats,
  type DiagnosisRecurrence,
} from '@/src/services/analytics.services';
import { getMedicationUsageHistory, getMedications, type Medication, type MedicationUsage } from '@/src/services/general-medications.services';
import { getMedicationsCatalog, getAllMedicationRequests, type MedicationCatalogItem, type MedicationRequest } from '@/src/services/controlled-medications.services';
import { getAllAppointments, type Appointment } from '@/src/services/appointment.services';
import { getAllOrders } from '@/src/services/order.services';
import type { Order } from '@/src/types';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Analytics() {
  const { userData } = useAuth();
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [veterinarianStats, setVeterinarianStats] = useState<VeterinarianStats[]>([]);
  const [diagnosisRecurrence, setDiagnosisRecurrence] = useState<DiagnosisRecurrence[]>([]);
  const [medicationUsage, setMedicationUsage] = useState<MedicationUsage[]>([]);
  const [generalMedications, setGeneralMedications] = useState<Medication[]>([]);
  const [controlledMedications, setControlledMedications] = useState<MedicationCatalogItem[]>([]);
  const [controlledRequests, setControlledRequests] = useState<MedicationRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMedicationUsage, setShowMedicationUsage] = useState(false);
  
  // Estados para controlar desplegables
  const [showProductos, setShowProductos] = useState(true);
  const [showTurnos, setShowTurnos] = useState(false);
  const [showMedicamentos, setShowMedicamentos] = useState(false);
  const [showCompras, setShowCompras] = useState(false);

  useEffect(() => {
    if (userData?.token) {
      loadAnalytics();
    }
  }, [userData?.token]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar datos base (todos los usuarios pueden acceder)
      const [stockData, vetData, diagnosisData, usageData, generalMeds, allAppointments, ordersData] = await Promise.all([
        getLowStockProducts(userData?.token || ''),
        getVeterinarianStats(userData?.token || ''),
        getDiagnosisRecurrence(userData?.token || ''),
        getMedicationUsageHistory(),
        getMedications(),
        getAllAppointments(userData?.token || ''),
        getAllOrders(userData?.token || '').catch(err => {
          console.warn('⚠️ No se pudieron cargar las órdenes:', err.message);
          return []; // Retornar array vacío si falla
        }),
      ]);

      console.log('📊 DATOS RECIBIDOS DE ANALYTICS:');
      console.log('Stock bajo:', stockData);
      console.log('Stats veterinarios:', vetData);
      console.log('🏥 DIAGNÓSTICOS RECIBIDOS:', diagnosisData);
      console.log('Uso medicamentos:', usageData);
      console.log('Medicamentos generales:', generalMeds);
      console.log('📅 TURNOS RECIBIDOS:', allAppointments);

      setLowStockProducts(stockData);
      setVeterinarianStats(vetData);
      setDiagnosisRecurrence(diagnosisData);
      setMedicationUsage(usageData || []);
      setGeneralMedications(generalMeds || []);
      setAppointments(allAppointments || []);
      
      console.log('💰 ÓRDENES RECIBIDAS:', ordersData);
      console.log('💰 Tipo de ordersData:', typeof ordersData);
      console.log('💰 Es array?:', Array.isArray(ordersData));
      console.log('💰 Cantidad de órdenes:', Array.isArray(ordersData) ? ordersData.length : 'No es array');
      
      // Asegurar que ordersData sea siempre un array
      const processedOrders = Array.isArray(ordersData) ? ordersData : [];
      setOrders(processedOrders);
      console.log('💰 Órdenes procesadas y guardadas:', processedOrders.length);
      
      // Debug: Mostrar estructura de la primera orden
      if (processedOrders.length > 0) {
        console.log('📦 Primera orden estructura:', processedOrders[0]);
        console.log('📦 Keys de primera orden:', Object.keys(processedOrders[0]));
        console.log('📦 Items de primera orden:', processedOrders[0].items);
        if (processedOrders[0].items && processedOrders[0].items.length > 0) {
          console.log('📦 Primer item:', processedOrders[0].items[0]);
          console.log('📦 Keys de primer item:', Object.keys(processedOrders[0].items[0]));
        }
      }

      // Cargar medicamentos controlados y solicitudes para veterinarios y admins
      if (userData?.user?.role === 'veterinarian' || userData?.user?.role === 'admin') {
        try {
          const [controlledCatalog, allRequests] = await Promise.all([
            getMedicationsCatalog(),
            getAllMedicationRequests()
          ]);
          setControlledMedications(controlledCatalog?.medications || []);
          setControlledRequests(allRequests?.requests || []);
          console.log('📋 Solicitudes de medicamentos controlados:', allRequests?.requests);
        } catch (controlledErr) {
          console.warn('No se pudo cargar medicamentos controlados:', controlledErr);
          setControlledMedications([]);
          setControlledRequests([]);
        }
      } else {
        setControlledMedications([]);
        setControlledRequests([]);
      }
    } catch (err: any) {
      console.error('Error cargando analytics:', err);
      setError(err.message || 'Error cargando datos de analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">⚠️ {error}</p>
        <p className="text-sm text-red-500 mt-2">
          El backend necesita implementar los endpoints de analytics
        </p>
        <button
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Calcular métricas
  const criticalStock = lowStockProducts.filter(p => p.stock === 0).length;
  const lowStock = lowStockProducts.filter(p => p.stock > 0 && p.stock < 5).length;
  const totalAppointments = veterinarianStats.reduce((sum, vet) => sum + vet.totalAppointments, 0);
  const completedAppointments = veterinarianStats.reduce((sum, vet) => sum + vet.completedAppointments, 0);
  const topVeterinarian = [...veterinarianStats].sort((a, b) => b.completedAppointments - a.completedAppointments)[0];

  // Funciones para estadísticas de medicamentos
  const getMedicationUsageStats = () => {
    const stats: { [key: string]: { name: string; count: number; total: number } } = {};
    
    medicationUsage.forEach(usage => {
      if (!stats[usage.medicationId]) {
        stats[usage.medicationId] = {
          name: usage.medicationName,
          count: 0,
          total: 0
        };
      }
      stats[usage.medicationId].count++;
      stats[usage.medicationId].total += usage.quantity;
    });

    return Object.values(stats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  const getMaxUsage = () => {
    const stats = getMedicationUsageStats();
    return stats.length > 0 ? Math.max(...stats.map(s => s.total)) : 1;
  };

  // Clasificar medicamentos por tipo (controlados vs generales)
  const getMedicationTypeStats = () => {
    const generalMedIds = new Set(generalMedications.map(m => m.id));
    const controlledMedIds = new Set(controlledMedications.map(m => m.id));
    
    let generalCount = 0;
    let controlledCount = 0;
    let generalUnits = 0;
    let controlledUnits = 0;
    let otherCount = 0;
    let otherUnits = 0;

    medicationUsage.forEach(usage => {
      if (generalMedIds.has(usage.medicationId)) {
        generalCount++;
        generalUnits += usage.quantity;
      } else if (controlledMedIds.has(usage.medicationId)) {
        controlledCount++;
        controlledUnits += usage.quantity;
      } else {
        // Medicamentos que no están en ninguna categoría
        otherCount++;
        otherUnits += usage.quantity;
      }
    });

    const stats = [];
    if (generalCount > 0) {
      stats.push({ name: 'Medicamentos Generales', value: generalCount, units: generalUnits, color: '#3b82f6' });
    }
    if (controlledCount > 0) {
      stats.push({ name: 'Medicamentos Controlados', value: controlledCount, units: controlledUnits, color: '#ef4444' });
    }
    if (otherCount > 0) {
      stats.push({ name: 'Otros Medicamentos', value: otherCount, units: otherUnits, color: '#6b7280' });
    }

    return stats.length > 0 ? stats : [
      { name: 'Sin datos', value: 0, units: 0, color: '#9ca3af' }
    ];
  };

  // Top 5 medicamentos generales más usados
  const getTopGeneralMedications = () => {
    const generalMedIds = new Set(generalMedications.map(m => m.id));
    const stats: { [key: string]: { name: string; total: number } } = {};
    
    medicationUsage.forEach(usage => {
      if (generalMedIds.has(usage.medicationId)) {
        if (!stats[usage.medicationId]) {
          stats[usage.medicationId] = { name: usage.medicationName, total: 0 };
        }
        stats[usage.medicationId].total += usage.quantity;
      }
    });

    return Object.values(stats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  // Distribución de turnos por hora y veterinario
  const getAppointmentsByHour = () => {
    // Crear objeto con las 24 horas del día
    const hourlyData: { [hour: string]: { [vetName: string]: number } } = {};
    
    // Inicializar todas las horas (8:00 a 20:00)
    for (let h = 8; h <= 20; h++) {
      const hourKey = `${h.toString().padStart(2, '0')}:00`;
      hourlyData[hourKey] = {};
    }

    // Contar turnos por hora y veterinario
    appointments.forEach(apt => {
      if (apt.time && apt.veterinarian?.name) {
        const hour = apt.time.substring(0, 5); // "14:30:00" -> "14:30"
        const hourRounded = `${apt.time.substring(0, 2)}:00`; // Redondear a la hora
        const vetName = apt.veterinarian.name;
        
        if (!hourlyData[hourRounded]) {
          hourlyData[hourRounded] = {};
        }
        
        if (!hourlyData[hourRounded][vetName]) {
          hourlyData[hourRounded][vetName] = 0;
        }
        
        hourlyData[hourRounded][vetName]++;
      }
    });

    // Convertir a formato para Recharts
    return Object.keys(hourlyData)
      .sort()
      .map(hour => ({
        hour,
        ...hourlyData[hour]
      }));
  };

  // Obtener lista única de veterinarios
  const getUniqueVeterinarians = () => {
    const vets = new Set<string>();
    appointments.forEach(apt => {
      if (apt.veterinarian?.name) {
        vets.add(apt.veterinarian.name);
      }
    });
    return Array.from(vets);
  };

  // Top 5 medicamentos controlados más solicitados (aprobados)
  const getTopControlledMedications = () => {
    const stats: { [key: string]: { name: string; total: number; count: number } } = {};
    
    // Contar solicitudes aprobadas y entregadas
    controlledRequests.forEach(request => {
      if (request.estado === 'aprobado' || request.estado === 'entregado') {
        const key = request.nombre;
        if (!stats[key]) {
          stats[key] = { name: request.nombre, total: 0, count: 0 };
        }
        stats[key].total += request.cantidad;
        stats[key].count += 1;
      }
    });

    return Object.values(stats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  // 1. Línea de tiempo de ventas - agrupa por fecha
  const getSalesByDate = () => {
    if (!Array.isArray(orders)) return [];
    const salesByDate: { [date: string]: number } = {};
    
    orders.forEach(order => {
      // Usar createdAt si existe, sino usar id
      const dateStr = order.createdAt || order.id;
      const date = new Date(dateStr).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' });
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += Number(order.total) || 0;
    });

    const result = Object.entries(salesByDate)
      .map(([date, total]) => ({ 
        date, 
        total: parseFloat((Number(total) || 0).toFixed(2)) 
      }))
      .slice(-15); // Últimas 15 entradas
    
    console.log('📈 Sales by date:', result);
    return result;
  };

  // 2. Top 10 productos más vendidos
  const getTopProducts = () => {
    if (!Array.isArray(orders)) return [];
    const productStats: { [name: string]: { name: string; quantity: number; revenue: number } } = {};
    
    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        const productName = item.product?.name || 'Producto sin nombre';
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        
        if (!productStats[productName]) {
          productStats[productName] = { name: productName, quantity: 0, revenue: 0 };
        }
        productStats[productName].quantity += quantity;
        productStats[productName].revenue += price * quantity;
      });
    });

    const result = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    console.log('💰 Top products:', result);
    return result;
  };

  // 3. Distribución de rangos de precios
  const getPriceDistribution = () => {
    if (!Array.isArray(orders)) return [];
    const priceRanges: { [range: string]: number } = {
      '$0 - $10k': 0,
      '$10k - $30k': 0,
      '$30k - $50k': 0,
      '$50k - $100k': 0,
      '$100k+': 0
    };
    
    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        const price = Number((item as any).unitPrice) || 0;
        
        if (price < 10000) {
          priceRanges['$0 - $10k']++;
        } else if (price < 30000) {
          priceRanges['$10k - $30k']++;
        } else if (price < 50000) {
          priceRanges['$30k - $50k']++;
        } else if (price < 100000) {
          priceRanges['$50k - $100k']++;
        } else {
          priceRanges['$100k+']++;
        }
      });
    });

    return Object.entries(priceRanges)
      .filter(([, count]) => count > 0)
      .map(([range, count]) => ({ range, count }));
  };

  // 4. Top productos por ingresos generados
  const getTopProductsByRevenue = () => {
    if (!Array.isArray(orders)) return [];
    const productStats: { [name: string]: { name: string; revenue: number } } = {};
    
    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        const productName = (item as any).product?.name || 'Producto sin nombre';
        const quantity = Number(item.quantity) || 0;
        const price = Number((item as any).unitPrice) || 0;
        const revenue = price * quantity;
        
        if (!productStats[productName]) {
          productStats[productName] = { name: productName, revenue: 0 };
        }
        productStats[productName].revenue += revenue;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // 5. Tamaño promedio del carrito
  const getAverageCartSize = () => {
    if (!Array.isArray(orders) || orders.length === 0) return 0;
    
    const totalItems = orders.reduce((sum, order) => {
      if (!order.items || !Array.isArray(order.items)) return sum;
      return sum + order.items.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0);
    }, 0);
    
    return parseFloat((totalItems / orders.length).toFixed(2));
  };

  // 5. Cantidad de productos vendidos por categoría
  const getProductsByCategory = () => {
    if (!Array.isArray(orders)) return [];
    const categoryStats: { [category: string]: number } = {};
    
    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        const productName = (item as any).product?.name;
        if (!productName) return;
        
        // Extraer categoría del nombre del producto
        // Intentar detectar la categoría por palabras clave comunes
        let category = 'General';
        const nameLower = productName.toLowerCase();
        
        if (nameLower.includes('alimento') || nameLower.includes('comida')) {
          category = 'Alimentos';
        } else if (nameLower.includes('juguete')) {
          category = 'Juguetes';
        } else if (nameLower.includes('transportadora') || nameLower.includes('correa') || nameLower.includes('collar')) {
          category = 'Accesorios';
        } else if (nameLower.includes('shampoo') || nameLower.includes('higiene')) {
          category = 'Higiene';
        } else if (nameLower.includes('cama') || nameLower.includes('cucha')) {
          category = 'Descanso';
        }
        
        const quantity = Number(item.quantity) || 0;
        categoryStats[category] = (categoryStats[category] || 0) + quantity;
      });
    });

    return Object.entries(categoryStats)
      .map(([category, quantity]) => ({ category, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  // 6. Promedio de ingresos
  const getAverageRevenue = () => {
    if (!Array.isArray(orders) || orders.length === 0) return 0;
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    return parseFloat((totalRevenue / orders.length).toFixed(2));
  };

  const getTotalRevenue = () => {
    if (!Array.isArray(orders)) return 0;
    const total = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    return Number(total) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">📊 Panel de analisis</h2>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Stock Crítico"
          value={criticalStock.toString()}
          subtitle="≤ 3 unidades"
          icon="⚠️"
          color="red"
        />
        <MetricCard
          title="Stock Bajo"
          value={lowStock.toString()}
          subtitle="4-15 unidades"
          icon="📦"
          color="orange"
        />
        <MetricCard
          title="Turnos Completados"
          value={completedAppointments.toString()}
          subtitle={`de ${totalAppointments} totales`}
          icon="✅"
          color="blue"
        />
        <MetricCard
          title="Veterinario Destacado"
          value={topVeterinarian?.name.split(' ')[1] || '-'}
          subtitle={`${topVeterinarian?.completedAppointments || 0} turnos`}
          icon="🏆"
          color="purple"
        />
      </div>

      {/* SECCIÓN 1: PRODUCTOS */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowProductos(!showProductos)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">📦</span>
            Productos y Stock
          </h2>
          <svg 
            className={`w-6 h-6 text-gray-600 transition-transform ${showProductos ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showProductos && (
          <div className="space-y-6">
            {/* Stock Crítico - Gráfica de Barras Mejorada */}
            <div className="bg-linear-to-br from-white via-orange-50/30 to-red-50/30 rounded-2xl shadow-xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span>Productos con Stock Bajo</span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">Top 10 productos que requieren reposición</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                ≤3 Crítico
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                ≤10 Bajo
              </span>
            </div>
          </div>
          
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] text-gray-400">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-semibold">Stock Óptimo</p>
              <p className="text-sm">No hay productos con stock bajo</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={lowStockProducts.slice(0, 10)} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="criticallinear" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="lowlinear" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="normallinear" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  type="number" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontWeight: '500' }}
                  label={{ value: 'Unidades en Stock', position: 'insideBottom', offset: -5, style: { fontSize: '11px', fill: '#6b7280' } }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  stroke="#6b7280"
                  style={{ fontSize: '11px', fontWeight: '600' }}
                  tick={{ fill: '#374151' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #f59e0b',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}
                  formatter={(value: any, name: any, props: any) => [
                    <div key="tooltip" className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-gray-700">Stock:</span>
                        <span className={`text-lg font-bold ${
                          props.payload.stock <= 3 ? 'text-red-600' : 
                          props.payload.stock <= 10 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>{value} unidades</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-xs text-gray-600">
                        <span>Categoría:</span>
                        <span className="font-semibold">{props.payload.category}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-xs text-gray-600">
                        <span>Precio:</span>
                        <span className="font-semibold">${parseFloat(props.payload.price).toFixed(2)}</span>
                      </div>
                      {props.payload.stock === 0 && (
                        <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded text-center">
                          🚨 SIN STOCK
                        </div>
                      )}
                      {props.payload.stock > 0 && props.payload.stock <= 3 && (
                        <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded text-center">
                          ⚠️ CRÍTICO
                        </div>
                      )}
                    </div>
                  ]}
                  cursor={{ fill: 'rgba(251, 146, 60, 0.1)' }}
                />
                <Bar 
                  dataKey="stock" 
                  radius={[0, 8, 8, 0]} 
                  name="Stock"
                  label={{
                    position: 'right',
                    fill: '#1f2937',
                    fontSize: 12,
                    fontWeight: 'bold',
                    formatter: (value: any) => `${value}`
                  }}
                >
                  {lowStockProducts.slice(0, 10).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.stock === 0 ? '#dc2626' :
                        entry.stock <= 3 ? 'url(#criticallinear)' : 
                        entry.stock <= 10 ? 'url(#lowlinear)' : 
                        'url(#normallinear)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
            </div>

            {/* Alertas de Stock Crítico */}
            {(criticalStock > 0 || lowStock > 0) && (
              <div className="bg-linear-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🚨</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-2">
                      ¡Alerta de Inventario!
                    </h3>
                    <p className="text-red-700 mb-4">
                      {criticalStock > 0 && <span><strong>{criticalStock} productos SIN STOCK</strong> (0 unidades). </span>}
                      {lowStock > 0 && <span><strong>{lowStock} productos</strong> con stock bajo (&lt;5 unidades). </span>}
                      Reposición urgente necesaria.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {lowStockProducts.map((product, index) => (
                        <div 
                          key={index} 
                          className={`bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition ${
                            product.stock === 0 ? 'border-2 border-red-500' : 'border border-orange-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                            <div className={`text-3xl font-bold ${product.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                              {product.stock}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-600">Precio unitario</span>
                            <span className="font-semibold text-gray-800">${product.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* SECCIÓN 2: TURNOS Y VETERINARIOS */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowTurnos(!showTurnos)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">👨‍⚕️</span>
            Turnos, Veterinarios y Diagnósticos
          </h2>
          <svg 
            className={`w-6 h-6 text-gray-600 transition-transform ${showTurnos ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showTurnos && (
          <div className="space-y-6">
            {/* Gráfica de Veterinarios */}
            <div className="bg-linear-to-br from-white to-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Productividad por Veterinario</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={veterinarianStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completedAppointments" fill="#10b981" radius={[8, 8, 0, 0]} name="Completados" />
                  <Bar dataKey="pendingAppointments" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Horarios de Turnos por Veterinario */}
            <div className="bg-linear-to-br from-white to-indigo-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🕐 Distribución de Turnos por Hora</h3>
              <p className="text-sm text-gray-600 mb-4">Horarios más solicitados por veterinario</p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getAppointmentsByHour()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" label={{ value: 'Cantidad de turnos', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  {getUniqueVeterinarians().map((vetName, index) => (
                    <Bar 
                      key={vetName} 
                      dataKey={vetName} 
                      fill={COLORS[index % COLORS.length]} 
                      radius={[4, 4, 0, 0]}
                      name={vetName}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Diagnósticos - Pie Chart */}
            <div className="bg-linear-to-br from-white to-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🏥 Diagnósticos Recurrentes
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({diagnosisRecurrence.reduce((sum, d) => sum + d.count, 0)} casos totales)
                </span>
              </h3>
              {diagnosisRecurrence.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={diagnosisRecurrence as any}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(props: any) => {
                      const { diagnosis, percentage, count } = props;
                      return diagnosis && percentage !== undefined && count !== undefined
                        ? `${diagnosis}: ${count} (${percentage.toFixed(1)}%)`
                        : '';
                    }}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {diagnosisRecurrence.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} casos (${props.payload.percentage}%)`,
                      props.payload.diagnosis
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <span className="text-6xl">📊</span>
                  <p className="text-gray-600 font-medium mt-4">No hay diagnósticos registrados aún</p>
                  <p className="text-gray-500 text-sm mt-2">Completa algunos turnos para ver las estadísticas</p>
                </div>
              )}
            </div>

            {/* Tabla Detallada de Diagnósticos */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">📊 Detalle Completo de Diagnósticos</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Total: {diagnosisRecurrence.length} diagnósticos
                </span>
              </div>
              {diagnosisRecurrence.length === 0 ? (
                <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-4xl">⚠️</span>
                  <p className="text-yellow-800 font-medium mt-2">No se recibieron datos de diagnósticos del backend</p>
                  <p className="text-yellow-600 text-sm mt-1">Verifica la consola para más detalles</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Diagnóstico</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Casos</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Porcentaje</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Barra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosisRecurrence.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-gray-900">{item.diagnosis}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {item.count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium text-gray-700">
                            {item.percentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${item.percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-gray-900">Total</td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {diagnosisRecurrence.reduce((sum, item) => sum + item.count, 0)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">100%</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: MEDICAMENTOS */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowMedicamentos(!showMedicamentos)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">💊</span>
            Medicamentos (Controlados y Generales)
          </h2>
          <svg 
            className={`w-6 h-6 text-gray-600 transition-transform ${showMedicamentos ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMedicamentos && (
          <div className="space-y-6">
            {medicationUsage.length > 0 ? (
              <>
                {/* Estadísticas generales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-4 rounded-lg text-white">
                    <p className="text-sm opacity-90">Total de Usos</p>
                    <p className="text-3xl font-bold mt-1">{medicationUsage.length}</p>
                  </div>
                  <div className="bg-linear-to-br from-blue-500 to-cyan-600 p-4 rounded-lg text-white">
                    <p className="text-sm opacity-90">Medicamentos Diferentes</p>
                    <p className="text-3xl font-bold mt-1">{getMedicationUsageStats().length}</p>
                  </div>
                  <div className="bg-linear-to-br from-violet-500 to-pink-600 p-4 rounded-lg text-white">
                    <p className="text-sm opacity-90">Unidades Totales</p>
                    <p className="text-3xl font-bold mt-1">
                      {medicationUsage.reduce((sum, u) => sum + u.quantity, 0)}
                    </p>
                  </div>
                </div>

                {/* Gráficos de Torta: Dos tipos de medicamentos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Medicamentos Generales (USO DIRECTO) */}
                  <div className="bg-linear-to-br from-white to-cyan-50 rounded-xl p-6 border border-cyan-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">💊 Top 5 Medicamentos Generales Más Usados</h3>
                    <p className="text-sm text-gray-600 mb-4">Uso directo registrado por veterinarios</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getTopGeneralMedications()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) => {
                            return name && percent && percent > 0.1
                              ? `${name.substring(0, 15)}... ${(percent * 100).toFixed(0)}%`
                              : '';
                          }}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="total"
                        >
                          {getTopGeneralMedications().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value: any, name: any, props: any) => [
                            `${value} unidades`,
                            props.payload.name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Medicamentos Controlados */}
                  <div className="bg-linear-to-br from-white to-red-50 rounded-xl p-6 border border-red-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      🔴 Top 5 Medicamentos Controlados Más Solicitados
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Solicitudes aprobadas y entregadas</p>
                    {getTopControlledMedications().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getTopControlledMedications()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => {
                              return name && percent && percent > 0.1
                                ? `${name.substring(0, 15)}... ${(percent * 100).toFixed(0)}%`
                                : '';
                            }}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="total"
                          >
                            {getTopControlledMedications().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: any, name: any, props: any) => [
                              `${value} unidades (${props.payload.count} solicitudes)`,
                              props.payload.name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 bg-red-50 rounded-lg">
                        <span className="text-5xl">📋</span>
                        <p className="text-gray-600 font-medium mt-4">No hay solicitudes aprobadas aún</p>
                        <p className="text-gray-500 text-sm mt-2">Las solicitudes aprobadas aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gráfica de barras */}
                <div className="bg-linear-to-br from-slate-50 to-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📊 Medicamentos Más Utilizados (Todos)
                  </h3>
                  <div className="space-y-4">
                    {getMedicationUsageStats().map((stat, index) => {
                      const percentage = (stat.total / getMaxUsage()) * 100;
                      const colors = [
                        'from-indigo-500 to-purple-600',
                        'from-blue-500 to-indigo-600',
                        'from-cyan-500 to-blue-600',
                        'from-violet-500 to-purple-600',
                        'from-purple-500 to-pink-600'
                      ];
                      const barColor = colors[index % colors.length];
                      
                      return (
                        <div key={stat.name} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700 flex items-center gap-2">
                              <span className="text-lg">💊</span>
                              {stat.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">
                                {stat.count} uso{stat.count !== 1 ? 's' : ''}
                              </span>
                              <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">
                                {stat.total} unidades
                              </span>
                            </div>
                          </div>
                          <div className="relative h-10 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                            <div 
                              className={`absolute top-0 left-0 h-full bg-linear-to-r ${barColor} transition-all duration-500 flex items-center justify-end pr-3`}
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 15 && (
                                <span className="text-white font-bold text-sm">
                                  {percentage.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Listado detallado */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    📋 Registro Detallado (Últimos 20)
                  </h3>
                  <div className="space-y-3">
                    {medicationUsage.slice(0, 20).map((usage) => (
                      <div key={usage.id} className="p-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              💊 {usage.medicationName}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Cantidad usada: <span className="font-medium">{usage.quantity}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Veterinario: <span className="font-medium">{usage.veterinarianName}</span>
                            </p>
                            {usage.notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">
                                📝 {usage.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(usage.usedAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(usage.usedAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl">📊</span>
                <p className="text-gray-500 mt-4">
                  No hay registros de uso de medicamentos
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Los datos aparecerán aquí cuando se registren usos
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN 4: COMPRAS Y VENTAS */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowCompras(!showCompras)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">💰</span>
            Compras y Ventas
          </h2>
          <svg 
            className={`w-6 h-6 text-gray-600 transition-transform ${showCompras ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCompras && (
          <div className="space-y-6">
            {/* Métricas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <p className="text-sm text-gray-600 font-medium">Total Ingresos</p>
                <p className="text-3xl font-bold text-green-700">${getTotalRevenue().toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{Array.isArray(orders) ? orders.length : 0} órdenes</p>
              </div>
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200">
                <p className="text-sm text-gray-600 font-medium">Promedio por Orden</p>
                <p className="text-3xl font-bold text-blue-700">${getAverageRevenue()}</p>
                <p className="text-xs text-gray-500 mt-1">valor promedio</p>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                <p className="text-sm text-gray-600 font-medium">Productos Vendidos</p>
                <p className="text-3xl font-bold text-purple-700">
                  {Array.isArray(orders) ? orders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">unidades totales</p>
              </div>
            </div>

            {!Array.isArray(orders) || orders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <span className="text-6xl">🛒</span>
                <p className="text-gray-500 mt-4 font-medium">No hay órdenes registradas</p>
                <p className="text-gray-400 text-sm mt-2">Los datos de ventas aparecerán aquí cuando se realicen compras</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Línea de Tiempo de Ventas */}
                <div className="bg-linear-to-br from-white via-green-50/30 to-emerald-50/30 rounded-2xl shadow-xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <span className="text-2xl">📈</span>
                    Línea de Tiempo de Ventas
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Evolución de las ventas totales por fecha (últimas 15 entradas)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getSalesByDate()}>
                      <defs>
                        <linearGradient id="saleslinear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        style={{ fontSize: '11px', fontWeight: '500' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '11px', fontWeight: '500' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '2px solid #10b981',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`$${value}`, 'Ventas']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 2. Top 10 Productos Más Vendidos */}
                <div className="bg-linear-to-br from-white via-blue-50/30 to-cyan-50/30 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <span className="text-2xl">💰</span>
                    Top 10 Productos Más Vendidos
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Productos más vendidos por cantidad de unidades</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getTopProducts()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#6b7280" style={{ fontSize: '11px' }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        stroke="#6b7280"
                        style={{ fontSize: '10px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '2px solid #3b82f6',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any, name: any, props: any) => [
                          <div key="tooltip" className="space-y-1">
                            <div className="font-bold text-blue-600">{value} unidades</div>
                            <div className="text-sm text-gray-600">Ingresos: ${props.payload.revenue.toFixed(2)}</div>
                          </div>
                        ]}
                      />
                      <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 3. Distribución de Rangos de Precios */}
                <div className="bg-linear-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <span className="text-2xl">💵</span>
                    Distribución de Precios
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Cantidad de productos vendidos por rango de precio</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getPriceDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="range" 
                        stroke="#6b7280"
                        style={{ fontSize: '11px', fontWeight: '500' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '11px', fontWeight: '500' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '2px solid #8b5cf6',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`${value} productos`, 'Cantidad']}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {getPriceDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 4. Top Productos por Ingresos */}
                <div className="bg-linear-to-br from-white via-orange-50/30 to-amber-50/30 rounded-2xl shadow-xl p-6 border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏆</span>
                    Top Productos por Ingresos
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Productos que generaron más dinero en ventas</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getTopProductsByRevenue()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        stroke="#6b7280" 
                        style={{ fontSize: '11px' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        stroke="#6b7280"
                        style={{ fontSize: '10px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '2px solid #f59e0b',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Ingresos']}
                      />
                      <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 5. Tamaño Promedio del Carrito */}
                <div className="bg-linear-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-2xl shadow-xl p-6 border-2 border-teal-200">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <span className="text-2xl">🛒</span>
                    Tamaño del Carrito
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Cantidad promedio de productos por orden</p>
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="text-center">
                      <p className="text-6xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        {getAverageCartSize().toFixed(1)}
                      </p>
                      <p className="text-xl text-gray-600 mt-2">productos/orden</p>
                    </div>
                  </div>
                </div>

                {/* 6. Cantidad de Productos por Categoría */}
                <div className="bg-linear-to-br from-white via-indigo-50/30 to-violet-50/30 rounded-2xl shadow-xl p-6 border-2 border-indigo-200 lg:col-span-2">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <span className="text-2xl">📦</span>
                    Cantidad de Productos Vendidos por Categoría
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Volumen de ventas agrupado por tipo de producto</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getProductsByCategory()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="category" 
                        stroke="#6b7280"
                        style={{ fontSize: '11px', fontWeight: '500' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '11px', fontWeight: '500' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '2px solid #6366f1',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: any) => [`${value} unidades`, 'Cantidad']}
                      />
                      <Bar dataKey="quantity" radius={[8, 8, 0, 0]}>
                        {getProductsByCategory().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta de métrica
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <p className="text-4xl font-bold text-gray-800 mb-2">{value}</p>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} rounded-xl p-3 border`}>{icon}</div>
      </div>
    </div>
  );
}
