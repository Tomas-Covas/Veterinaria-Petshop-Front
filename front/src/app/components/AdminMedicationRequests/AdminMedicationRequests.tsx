"use client";

import { useState, useEffect } from 'react';
import {
  getAllMedicationRequests,
  updateRequestStatus,
  MedicationRequest,
  UpdateStatusBody,
  getStatusColor,
  getUrgencyColor,
  formatDate,
} from '@/src/services/controlled-medications.services';

export default function AdminMedicationRequests() {
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedRequest, setSelectedRequest] = useState<MedicationRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllMedicationRequests();
      console.log('📋 Solicitudes recibidas del backend:', data.requests);
      
      // Asegurar que cada solicitud tenga requestIndex y veterinarianId
      const requestsWithIndex = data.requests.map((req: MedicationRequest, index: number) => ({
        ...req,
        requestIndex: req.requestIndex !== undefined ? req.requestIndex : index,
      }));
      
      console.log('📋 Solicitudes procesadas:', requestsWithIndex);
      setRequests(requestsWithIndex);
      setStats({
        total: data.total,
        pending: data.pending,
        approved: data.approved,
        rejected: data.rejected,
      });
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request: MedicationRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setShowModal(false);
  };

  const handleUpdateStatus = async (
    newStatus: 'pendiente' | 'aprobado' | 'rechazado' | 'entregado' | 'cancelado',
    comentario: string
  ) => {
    console.log('🔄 Actualizando solicitud:', selectedRequest);
    
    if (!selectedRequest || !selectedRequest.veterinarianId) {
      console.error('❌ Falta veterinarianId');
      alert('Error: No se encontró el ID del veterinario');
      return;
    }

    if (selectedRequest.requestIndex === undefined) {
      console.error('❌ Falta requestIndex');
      alert('Error: No se encontró el índice de la solicitud');
      return;
    }

    const updateData: UpdateStatusBody = {
      veterinarianId: selectedRequest.veterinarianId,
      requestIndex: selectedRequest.requestIndex,
      estado: newStatus,
      comentarioAdmin: comentario,
    };

    console.log('📤 Enviando actualización:', updateData);

    try {
      await updateRequestStatus(updateData);
      handleCloseModal();
      loadRequests();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'todos') return true;
    return req.estado === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Solicitudes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Aprobadas</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Rechazadas</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'todos'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pendiente'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('aprobado')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'aprobado'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprobados ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('rechazado')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'rechazado'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rechazados ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <p className="text-gray-500 text-lg">
              {filter === 'todos'
                ? '📭 No hay solicitudes'
                : `📭 No hay solicitudes en estado "${filter}"`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Veterinario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Medicamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Urgencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.veterinarioNombre}
                        </p>
                        <p className="text-xs text-gray-500">{request.veterinarioEmail}</p>
                        <p className="text-xs text-gray-400">Mat: {request.veterinarioMatricula}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{request.nombre}</p>
                      {request.justificacion && (
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                          {request.justificacion.substring(0, 60)}...
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {request.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getUrgencyColor(
                          request.urgencia
                        )}`}
                      >
                        {request.urgencia.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                          request.estado
                        )}`}
                      >
                        {request.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.fechaSolicitud)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(request)}
                        className="text-orange-600 hover:text-orange-900 font-semibold"
                      >
                        🔍 Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Revisión */}
      {showModal && selectedRequest && (
        <ReviewModal
          request={selectedRequest}
          onClose={handleCloseModal}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}

// Modal Component
interface ReviewModalProps {
  request: MedicationRequest;
  onClose: () => void;
  onUpdate: (status: 'pendiente' | 'aprobado' | 'rechazado' | 'entregado' | 'cancelado', comentario: string) => void;
}

function ReviewModal({ request, onClose, onUpdate }: ReviewModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'pendiente' | 'aprobado' | 'rechazado' | 'entregado' | 'cancelado'>(request.estado);
  const [comentario, setComentario] = useState(request.comentarioAdmin || '');

  const handleSubmit = () => {
    if (selectedStatus !== request.estado && !comentario.trim()) {
      alert('Por favor, agrega un comentario explicando tu decisión');
      return;
    }
    onUpdate(selectedStatus, comentario);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">🔍 Revisar Solicitud</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del Veterinario */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">👨‍⚕️ Veterinario Solicitante</h3>
            <p className="text-sm"><strong>Nombre:</strong> {request.veterinarioNombre}</p>
            <p className="text-sm"><strong>Email:</strong> {request.veterinarioEmail}</p>
            <p className="text-sm"><strong>Matrícula:</strong> {request.veterinarioMatricula}</p>
          </div>

          {/* Información del Medicamento */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">💊 Detalles de la Solicitud</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Medicamento</p>
                <p className="font-semibold text-gray-900">{request.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Cantidad</p>
                <p className="font-semibold text-gray-900">{request.cantidad}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Urgencia</p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getUrgencyColor(request.urgencia)}`}>
                  {request.urgencia.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha Solicitud</p>
                <p className="font-semibold text-gray-900 text-sm">{formatDate(request.fechaSolicitud)}</p>
              </div>
            </div>
          </div>

          {/* Justificación */}
          {request.justificacion && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📝 Justificación</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                {request.justificacion}
              </p>
            </div>
          )}

          {/* Cambiar Estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cambiar Estado <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedStatus === 'aprobado' ? 'bg-green-50 border-green-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="status"
                  value="aprobado"
                  checked={selectedStatus === 'aprobado'}
                  onChange={() => setSelectedStatus('aprobado')}
                  className="mr-2"
                />
                <span className="text-sm font-medium">✅ Aprobar</span>
              </label>

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedStatus === 'rechazado' ? 'bg-red-50 border-red-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="status"
                  value="rechazado"
                  checked={selectedStatus === 'rechazado'}
                  onChange={() => setSelectedStatus('rechazado')}
                  className="mr-2"
                />
                <span className="text-sm font-medium">❌ Rechazar</span>
              </label>

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedStatus === 'entregado' ? 'bg-blue-50 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="status"
                  value="entregado"
                  checked={selectedStatus === 'entregado'}
                  onChange={() => setSelectedStatus('entregado')}
                  className="mr-2"
                />
                <span className="text-sm font-medium">📦 Entregado</span>
              </label>

              <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${selectedStatus === 'cancelado' ? 'bg-gray-50 border-gray-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="status"
                  value="cancelado"
                  checked={selectedStatus === 'cancelado'}
                  onChange={() => setSelectedStatus('cancelado')}
                  className="mr-2"
                />
                <span className="text-sm font-medium">🚫 Cancelar</span>
              </label>
            </div>
          </div>

          {/* Comentario del Admin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Comentario para el Veterinario
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200"
              placeholder="Explica tu decisión o proporciona información adicional..."
            />
            <p className="text-xs text-gray-500 mt-1">
              El veterinario recibirá un email con tu respuesta
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              💾 Guardar Cambios
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
