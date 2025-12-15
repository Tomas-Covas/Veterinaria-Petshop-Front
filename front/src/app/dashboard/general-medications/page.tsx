"use client"
import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  getMedications, 
  requestMedicationRestock, 
  useMedication,
  getMedicationRequests,
  getMedicationUsageHistory,
  MedicationUsage,
  approveRequest,
  rejectRequest,
  completeRequest,
  cancelRequest
} from "../../../services/general-medications.services";
import { toast } from "react-toastify";

interface Medication {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
}

interface MedicationRequest {
  id: string;
  medicationId: string;
  medicationName: string;
  requestedBy: string;
  quantity: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
  veterinarianName?: string;
  updatedAt: string;
  approvedBy: string | null;
  approverName?: string | null;
  approvedAt: string | null;
  completedAt: string | null;
}

export default function GeneralMedicationsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [usageHistory, setUsageHistory] = useState<MedicationUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const [requestQuantity, setRequestQuantity] = useState<number>(0);
  const [useQuantity, setUseQuantity] = useState<number>(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showUseForm, setShowUseForm] = useState(false);
  const [selectedForUse, setSelectedForUse] = useState<string>("");
  const [showPending, setShowPending] = useState(true);
  const [showApproved, setShowApproved] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medsData, reqsData, usageData] = await Promise.all([
        getMedications(),
        getMedicationRequests(),
        getMedicationUsageHistory()
      ]);
      console.log('✅ Medicamentos cargados:', medsData);
      console.log('✅ Solicitudes cargadas:', reqsData);
      console.log('📊 Total solicitudes:', reqsData?.length || 0);
      console.log('📊 Solicitudes pendientes:', reqsData?.filter((r: any) => r.status === 'pending').length || 0);
      
      // Log detallado de cada solicitud
      if (reqsData && reqsData.length > 0) {
        console.log('🔍 DETALLE DE SOLICITUDES:');
        reqsData.forEach((req: any, index: number) => {
          console.log(`  Solicitud ${index + 1}:`, {
            id: req.id,
            medicationId: req.medicationId,
            medicationName: req.medicationName || '❌ FALTA medicationName',
            quantity: req.quantity,
            status: req.status,
            requestedBy: req.requestedBy,
            veterinarianName: req.veterinarianName || '❌ FALTA veterinarianName',
            createdAt: req.createdAt
          });
        });
      } else {
        console.log('⚠️ El backend devolvió un array vacío de solicitudes');
      }
      
      console.log('✅ Historial de uso:', usageData);
      console.log('👤 Usuario actual:', userData?.user?.name, '- Rol:', userData?.user?.role);
      setMedications(medsData || []);
      setRequests(reqsData || []);
      setUsageHistory(usageData || []);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      toast.error('Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData?.user?.id) {
      router.push('/auth/login');
      return;
    }

    if (userData?.user?.role !== 'veterinarian' && userData?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.user?.id, userData?.user?.role, router]);

  const handleRequestRestock = async () => {
    if (!selectedMedication || requestQuantity <= 0) {
      toast.error('Selecciona un medicamento y cantidad válida');
      return;
    }

    try {
      const result = await requestMedicationRestock(selectedMedication, requestQuantity);
      console.log('✅ Solicitud creada exitosamente:', result);
      toast.success('Solicitud de reposición enviada al administrador');
      setSelectedMedication("");
      setRequestQuantity(0);
      setShowRequestForm(false);
      loadData();
    } catch (error: any) {
      console.error('❌ Error al solicitar reposición:', error);
      console.error('Response del servidor:', error.message);
      toast.error(error.message || 'Error al solicitar reposición');
    }
  };

  const handleUseMedication = async () => {
    if (!selectedForUse || useQuantity <= 0) {
      toast.error('Selecciona un medicamento y cantidad válida');
      return;
    }

    try {
      await useMedication(selectedForUse, useQuantity);
      toast.success('Uso de medicamento registrado');
      setSelectedForUse("");
      setUseQuantity(0);
      setShowUseForm(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar uso');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveRequest(requestId);
      toast.success('Solicitud aprobada');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar solicitud');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      toast.success('Solicitud rechazada');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al rechazar solicitud');
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      await completeRequest(requestId);
      toast.success('Solicitud completada y stock actualizado');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al completar solicitud');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
      return;
    }
    try {
      await cancelRequest(requestId);
      toast.success('Solicitud cancelada');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar solicitud');
    }
  };

  const getLowStockMedications = () => {
    return medications.filter(m => m.stock <= m.minStock);
  };

  const getStockColor = (med: Medication) => {
    if (med.stock === 0) return 'text-red-600 bg-red-50';
    if (med.stock <= med.minStock) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockIcon = (med: Medication) => {
    if (med.stock === 0) return '🚫';
    if (med.stock <= med.minStock) return '⚠️';
    return '✅';
  };



  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">💊</span>
            Medicamentos Generales
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de stock y solicitudes de reposición
            {userData?.user?.role === 'admin' && (
              <span className="ml-2 text-indigo-600 font-semibold">- Panel de Administrador</span>
            )}
          </p>
        </div>

        {/* Alerta de solicitudes pendientes (para admin) */}
        {userData?.user?.role === 'admin' && requests.filter(r => r.status === 'pending').length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-6 mb-6">
            <div className="flex items-start">
              <span className="text-3xl mr-4">🔔</span>
              <div className="flex-1">
                <h3 className="text-orange-800 font-bold text-lg flex items-center gap-2">
                  Solicitudes Pendientes de Aprobación
                  <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                </h3>
                <p className="text-orange-700 mt-2">
                  Hay {requests.filter(r => r.status === 'pending').length} solicitud(es) de reposición esperando tu aprobación.
                  Revisa la sección "Solicitudes de Reposición" más abajo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alertas de stock bajo */}
        {getLowStockMedications().length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-6 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="text-orange-800 font-semibold">Stock Bajo</h3>
                <p className="text-orange-700 text-sm mt-1">
                  {getLowStockMedications().length} medicamento(s) necesitan reposición
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowUseForm(!showUseForm)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">💉</span>
            Registrar Uso
            <svg 
              className={`w-5 h-5 transition-transform ${showUseForm ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">📦</span>
            Solicitar Reposición
            <svg 
              className={`w-5 h-5 transition-transform ${showRequestForm ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Formulario de uso */}
        {showUseForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Uso de Medicamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamento
                </label>
                <select
                  value={selectedForUse}
                  onChange={(e) => setSelectedForUse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {medications.filter(m => m.stock > 0).map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} - Stock: {med.stock} {med.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Usada
                </label>
                <input
                  type="number"
                  min="0"
                  value={useQuantity}
                  onChange={(e) => setUseQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleUseMedication}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Confirmar Uso
              </button>
              <button
                onClick={() => {
                  setShowUseForm(false);
                  setSelectedForUse("");
                  setUseQuantity(0);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Formulario de solicitud */}
        {showRequestForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Solicitar Reposición</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamento
                </label>
                <select
                  value={selectedMedication}
                  onChange={(e) => setSelectedMedication(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={medications.length === 0}
                >
                  <option value="">
                    {medications.length === 0 ? 'No hay medicamentos disponibles' : 'Seleccionar...'}
                  </option>
                  {medications.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} - Stock actual: {med.stock} {med.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad a Solicitar
                </label>
                <input
                  type="number"
                  min="0"
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRequestRestock}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Enviar Solicitud
              </button>
              <button
                onClick={() => {
                  setShowRequestForm(false);
                  setSelectedMedication("");
                  setRequestQuantity(0);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Stock de medicamentos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              Stock de Medicamentos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    med.stock <= med.minStock ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getStockIcon(med)}</span>
                      <h3 className="font-semibold text-gray-900 flex-1">{med.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {med.category}
                    </p>
                    <div className={`px-3 py-2 rounded-lg text-center text-lg font-bold ${getStockColor(med)}`}>
                      {med.stock} {med.unit}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      Stock mínimo: {med.minStock} {med.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solicitudes de reposición */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📬</span>
              Solicitudes de Reposición
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Pendientes */}
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <div>
                  <button
                    onClick={() => setShowPending(!showPending)}
                    className="w-full text-left text-sm font-bold text-orange-600 uppercase tracking-wide mb-2 flex items-center gap-2 hover:text-orange-700 transition-colors"
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Pendientes ({requests.filter(r => r.status === 'pending').length})
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-auto transition-transform ${showPending ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showPending && (
                    <div className="space-y-2 mb-4">
                      {requests
                        .filter(r => r.status === 'pending')
                        .map((req) => (
                          <div key={req.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{req.medicationName}</h4>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {req.quantity}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Por: {req.veterinarianName || 'Veterinario'}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Pendiente
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(req.createdAt).toLocaleDateString('es-ES')}
                            </p>
                            {userData?.user?.role === 'admin' ? (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                >
                                  ✓ Aprobar
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req.id)}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                >
                                  ✗ Rechazar
                                </button>
                              </div>
                            ) : req.requestedBy === userData?.user?.id && (
                              <div className="mt-3">
                                <button
                                  onClick={() => handleCancelRequest(req.id)}
                                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                >
                                  🗑️ Cancelar Solicitud
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Aprobadas */}
              {requests.filter(r => r.status === 'approved').length > 0 && (
                <div>
                  <button
                    onClick={() => setShowApproved(!showApproved)}
                    className="w-full text-left text-sm font-bold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-2 hover:text-blue-700 transition-colors"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Aprobadas ({requests.filter(r => r.status === 'approved').length})
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-auto transition-transform ${showApproved ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showApproved && (
                    <div className="space-y-2 mb-4">
                      {requests
                        .filter(r => r.status === 'approved')
                        .map((req) => (
                          <div key={req.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{req.medicationName}</h4>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {req.quantity}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Por: {req.veterinarianName || 'Veterinario'}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Aprobada
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(req.createdAt).toLocaleDateString('es-ES')}
                            </p>
                            {userData?.user?.role === 'admin' && (
                              <div className="mt-3">
                                <button
                                  onClick={() => handleCompleteRequest(req.id)}
                                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                                >
                                  ✓ Completar (Stock recibido)
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Completadas */}
              {requests.filter(r => r.status === 'completed').length > 0 && (
                <div>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="w-full text-left text-sm font-bold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-2 hover:text-green-700 transition-colors"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Completadas ({requests.filter(r => r.status === 'completed').length})
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-auto transition-transform ${showCompleted ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCompleted && (
                    <div className="space-y-2">
                      {requests
                        .filter(r => r.status === 'completed')
                        .map((req) => (
                          <div key={req.id} className="p-3 bg-green-50 rounded-lg border border-green-200 opacity-75">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{req.medicationName}</h4>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {req.quantity}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Por: {req.veterinarianName || 'Veterinario'}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Completada
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(req.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {requests.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No hay solicitudes registradas
                </p>
              )}
            </div>
          </div>
        </div>



        {/* Botón volver */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
