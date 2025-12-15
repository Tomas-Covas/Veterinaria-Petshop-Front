'use client';

import { useState } from 'react';

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
    id?: string;
    name: string;
    specialty?: string;
  };
  status: string;
  reason?: string;
}

interface VeterinarianManagementProps {
  appointments: Appointment[];
  loading: boolean;
}

export default function VeterinarianManagement({ appointments, loading }: VeterinarianManagementProps) {
  const [expandedVetGroups, setExpandedVetGroups] = useState<Record<string, boolean>>({});

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    }
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'completado') {
      return 'bg-green-100 text-green-800';
    } else if (statusLower === 'pending' || statusLower === 'pendiente') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'cancelled' || statusLower === 'cancelado') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const toggleVetGroup = (vetId: string) => {
    setExpandedVetGroups(prev => ({
      ...prev,
      [vetId]: !prev[vetId]
    }));
  };

  const groupAppointmentsByVet = (appointments: Appointment[]) => {
    const vetGroups: Record<string, { vet: any; appointments: Appointment[] }> = {};

    appointments.forEach(appointment => {
      const vetId = appointment.veterinarian?.id || 'unknown';
      const vetName = appointment.veterinarian?.name || 'Sin veterinario asignado';
      
      if (!vetGroups[vetId]) {
        vetGroups[vetId] = {
          vet: {
            id: vetId,
            name: vetName,
            specialty: appointment.veterinarian?.specialty
          },
          appointments: []
        };
      }
      
      vetGroups[vetId].appointments.push(appointment);
    });

    // Ordenar citas por fecha dentro de cada grupo
    Object.values(vetGroups).forEach(group => {
      group.appointments.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA.getTime() - dateB.getTime();
      });
    });

    return Object.values(vetGroups);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Turnos de Veterinarios</h2>
          <p className="text-sm text-gray-500 mt-1">
            {appointments.length} {appointments.length === 1 ? 'turno' : 'turnos'} agendados
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-8 text-gray-500">
            No hay turnos registrados
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupAppointmentsByVet(appointments).map((group) => {
            const isExpanded = expandedVetGroups[group.vet.id] ?? true;

            return (
              <div key={group.vet.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Header del veterinario */}
                <button
                  onClick={() => toggleVetGroup(group.vet.id)}
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
                        <h3 className="text-lg font-bold text-gray-900">{group.vet.name}</h3>
                        <p className="text-sm text-gray-600">
                          {group.appointments.length} {group.appointments.length === 1 ? 'turno' : 'turnos'}
                          {group.vet.specialty && ` · ${group.vet.specialty}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🩺</span>
                    </div>
                  </div>
                </button>

                {/* Contenido: turnos del veterinario */}
                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {group.appointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          {/* Fecha y hora */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="shrink-0">
                              <div className="bg-amber-100 rounded-lg p-3 text-center min-w-[70px]">
                                <p className="text-xs text-amber-700 font-medium uppercase">
                                  {new Date(appointment.date).toLocaleDateString('es-AR', { month: 'short' })}
                                </p>
                                <p className="text-2xl font-bold text-amber-900">
                                  {new Date(appointment.date).getDate()}
                                </p>
                                <p className="text-xs text-amber-600 font-medium">
                                  {appointment.time}
                                </p>
                              </div>
                            </div>
                            
                            {/* Información del turno */}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">🐾</span>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {appointment.pet?.name || 'No especificado'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs">👤</span>
                                    <p className="text-xs text-gray-600">
                                      {appointment.pet?.user?.name || 'No especificado'}
                                    </p>
                                  </div>
                                  {appointment.reason && (
                                    <div className="mt-2 bg-gray-50 rounded p-2">
                                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Motivo</p>
                                      <p className="text-sm text-gray-700">{appointment.reason}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Estado */}
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                                  {typeof appointment.status === 'boolean' 
                                    ? (appointment.status ? 'Pendiente' : 'Cancelado')
                                    : appointment.status
                                  }
                                </span>
                              </div>
                            </div>
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
