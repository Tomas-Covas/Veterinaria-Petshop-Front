"use client";

import { useState, useEffect } from 'react';
import {
  getMyMedicationRequests,
  deleteMyMedicationRequest,
  MedicationRequest,
  getStatusColor,
  getUrgencyColor,
  formatDate,
} from '@/src/services/controlled-medications.services';

interface MyMedicationRequestsProps {
  veterinarianId: string;
  refreshTrigger?: number;
}

export default function MyMedicationRequests({
  veterinarianId,
  refreshTrigger,
}: MyMedicationRequestsProps) {
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MedicationRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, [veterinarianId, refreshTrigger]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getMyMedicationRequests(veterinarianId);
      setRequests(data.requests);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestIndex: number) => {
    setRequestToDelete(requestIndex);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (requestToDelete === null) return;

    try {
      await deleteMyMedicationRequest(veterinarianId, requestToDelete);
      setShowDeleteModal(false);
      setRequestToDelete(null);
      loadRequests();
    } catch (error) {
      console.error('Error eliminando solicitud:', error);
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📋 Mis Solicitudes de Medicamentos
        </h2>
        <p className="text-gray-600 text-sm">
          Total de solicitudes: {requests.length}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'todos'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({requests.length})
        </button>
        <button
          onClick={() => setFilter('pendiente')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pendiente'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendientes ({requests.filter((r) => r.estado === 'pendiente').length})
        </button>
        <button
          onClick={() => setFilter('aprobado')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'aprobado'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Aprobados ({requests.filter((r) => r.estado === 'aprobado').length})
        </button>
        <button
          onClick={() => setFilter('rechazado')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'rechazado'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rechazados ({requests.filter((r) => r.estado === 'rechazado').length})
        </button>
      </div>

      {/* Tabla */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {filter === 'todos'
              ? '📭 No tienes solicitudes aún'
              : `📭 No tienes solicitudes en estado "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        {request.nombre}
                      </p>
                      {request.justificacion && (
                        <p className="text-xs text-gray-500 mt-1">
                          {request.justificacion.substring(0, 50)}...
                        </p>
                      )}
                    </div>
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        👁️ Ver
                      </button>
                      {request.estado === 'pendiente' && (
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Información de respuesta del admin */}
      {filteredRequests.some((r) => r.comentarioAdmin) && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-gray-800">💬 Respuestas del Administrador:</h3>
          {filteredRequests
            .filter((r) => r.comentarioAdmin)
            .map((request, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  request.estado === 'aprobado'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <p className="font-semibold text-sm">
                  {request.nombre} - {request.estado.toUpperCase()}
                </p>
                <p className="text-sm mt-1">{request.comentarioAdmin}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Respondido: {request.fechaRespuesta ? formatDate(request.fechaRespuesta) : 'N/A'}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-linear-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <span className="text-2xl">🗑️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Eliminar solicitud?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta solicitud?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRequestToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-linear-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                📋 Detalles de la Solicitud
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-semibold text-gray-600">Medicamento:</span>
                <p className="text-gray-900">{selectedRequest.nombre}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Cantidad:</span>
                <p className="text-gray-900">{selectedRequest.cantidad}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Urgencia:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(selectedRequest.urgencia)}`}>
                  {selectedRequest.urgencia.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Estado:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRequest.estado)}`}>
                  {selectedRequest.estado.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-600">Justificación:</span>
                <p className="text-gray-900">{selectedRequest.justificacion || 'N/A'}</p>
              </div>
              {selectedRequest.comentarioAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-sm font-semibold text-blue-900">Comentario del Admin:</span>
                  <p className="text-blue-800 mt-1">{selectedRequest.comentarioAdmin}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedRequest(null);
              }}
              className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
