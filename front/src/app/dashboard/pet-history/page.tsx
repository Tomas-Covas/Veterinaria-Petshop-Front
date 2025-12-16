'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PetSearchBar from '@/src/app/components/PetSearchBar/PetSearchBar';
import { Pet, getPetMedicalHistory } from '@/src/app/services/pet.services';

export default function PetMedicalHistoryPage() {
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const handlePetSelect = async (pet: Pet) => {
    setSelectedPet(pet);
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken') || '';
      
      const petAppointments = pet.appointments || [];
      
      const updatedPet = {
        ...pet,
        appointments: petAppointments
      };
      
      setSelectedPet(updatedPet);
      
      const history = await getPetMedicalHistory(pet.id, token);
      setMedicalHistory(history);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedPet(null);
    setMedicalHistory(null);
    setSelectedRecord(null);
  };

  const handleViewRecord = async (appointmentId: string) => {
    if (!selectedPet) return;
    
    setLoadingRecord(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      
      const appointment = selectedPet.appointments?.find((apt: any) => apt.id === appointmentId);
      
      if (!appointment) {
        setLoadingRecord(false);
        return;
      }
      
      // Obtener todos los registros médicos de la mascota
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-records-pet/pet/${selectedPet.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        alert('No se pudo cargar el registro médico de esta consulta');
        setLoadingRecord(false);
        return;
      }
      
      const result = await response.json();
      const records = result.data || result.records || result.medicalRecords || result || [];
      
      if (!Array.isArray(records) || records.length === 0) {
        alert('Esta mascota aún no tiene registros médicos');
        setLoadingRecord(false);
        return;
      }
      
      let matchedRecord = null;
      
      // 1. Intentar match por appointment ID
      matchedRecord = records.find((r: any) => r.appointmentId === appointmentId);
      
      // 2. Si no hay match directo, intentar por veterinario y fecha
      if (!matchedRecord && appointment.veterinarian && appointment.date) {
        const vetId = appointment.veterinarian?.id || appointment.veterinarian;
        const appointmentDate = appointment.date.split('T')[0];
        
        matchedRecord = records.find((r: any) => {
          const recordVetId = r.veterinarian?.id || r.veterinarianId;
          const recordDate = (r.consultationDate || r.createdAt || '').split('T')[0];
          return recordVetId === vetId && recordDate === appointmentDate;
        });
      }
      
      // 3. Fallback: mostrar el registro más reciente
      if (!matchedRecord && records.length > 0) {
        const sortedRecords = [...records].sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.consultationDate || 0).getTime();
          const dateB = new Date(b.createdAt || b.consultationDate || 0).getTime();
          return dateB - dateA;
        });
        matchedRecord = sortedRecords[0];
      }
      
      if (matchedRecord) {
        setSelectedRecord(matchedRecord);
      } else {
        alert('No se pudo cargar el registro médico');
        setLoadingRecord(false);
      }
    } catch (error) {
      alert('Error al cargar el registro médico');
    } finally {
      setLoadingRecord(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'scheduled':
        return 'Programado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="bg-gray-50 pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-orange-500 hover:text-orange-600 font-semibold mb-4 flex items-center gap-2"
          >
            ← Volver al Calendario
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Historial Médico de Mascotas</h1>
          <p className="text-gray-600 mt-2">Busca una mascota para ver su historial médico completo</p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-8">
          <PetSearchBar onSelectPet={handlePetSelect} />
        </div>

        {/* Mascota seleccionada */}
        {selectedPet && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header con info de la mascota */}
            <div className="bg-linear-to-r from-orange-400 to-orange-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-orange-600 overflow-hidden">
                    {((selectedPet as any).image || selectedPet.image) ? (
                      <img 
                        src={(selectedPet as any).image || selectedPet.image} 
                        alt={(selectedPet as any).nombre || selectedPet.name || 'Mascota'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{((selectedPet as any).nombre || selectedPet.name || 'P').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-1">{(selectedPet as any).nombre || selectedPet.name || 'Mascota'}</h2>
                    <div className="flex flex-wrap gap-2 text-orange-100">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {(selectedPet as any).especie || selectedPet.species || 'N/A'}
                      </span>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedPet.breed || 'Raza no especificada'}
                      </span>
                      {selectedPet.age && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedPet.age} años
                        </span>
                      )}
                      {(selectedPet as any).sexo && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {(selectedPet as any).sexo === 'MACHO' ? '♂ Macho' : '♀ Hembra'}
                        </span>
                      )}
                      {(selectedPet as any).tamano && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          Tamaño: {(selectedPet as any).tamano.toLowerCase()}
                        </span>
                      )}
                      {(selectedPet as any).esterilizado && (
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {(selectedPet as any).esterilizado === 'SI' ? '✓ Esterilizado' : 'No esterilizado'}
                        </span>
                      )}
                    </div>
                    {(selectedPet as any).fecha_nacimiento && (
                      <p className="text-orange-100 text-sm mt-2">
                        📅 Fecha de nacimiento: {new Date((selectedPet as any).fecha_nacimiento).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Buscar otra mascota
                </button>
              </div>
            </div>

            {/* Historial médico */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando historial médico...</p>
                  </div>
                </div>
              ) : medicalHistory ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Consultas y Tratamientos</h3>
                  
                  {selectedPet.appointments && selectedPet.appointments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPet.appointments.map((appointment, index) => (
                        <div
                          key={appointment.id || index}
                          onClick={() => handleViewRecord(appointment.id)}
                          className="bg-gray-50 rounded-lg p-5 border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {appointment.service || 'Consulta veterinaria'}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Veterinario: {typeof appointment.veterinarian === 'string' 
                                  ? appointment.veterinarian 
                                  : (appointment.veterinarian?.name || 'No especificado')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>

                          <div className="border-t border-gray-300 pt-3">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Fecha:</span>{' '}
                              {new Date(appointment.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No hay consultas registradas para esta mascota</p>
                    </div>
                  )}

                  {/* Información adicional del historial */}
                  {medicalHistory?.vaccinations && medicalHistory.vaccinations.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Vacunaciones</h3>
                      <div className="space-y-2">
                        {medicalHistory.vaccinations.map((vaccine: any, index: number) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{vaccine.name}</p>
                                <p className="text-sm text-gray-600">
                                  Aplicada: {new Date(vaccine.date).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              {vaccine.nextDue && (
                                <div className="text-sm bg-blue-100 px-3 py-1 rounded-full">
                                  <span className="text-blue-800 font-medium">
                                    Próxima: {new Date(vaccine.nextDue).toLocaleDateString('es-ES')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {medicalHistory?.allergies && medicalHistory.allergies.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Alergias</h3>
                      <div className="flex flex-wrap gap-2">
                        {medicalHistory.allergies.map((allergy: string, index: number) => (
                          <span key={index} className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-medium">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {medicalHistory?.medications && medicalHistory.medications.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">💊 Medicamentos Actuales</h3>
                      <div className="space-y-3">
                        {medicalHistory.medications.map((medication: any, index: number) => (
                          <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="font-medium text-gray-900 mb-1">{medication.name}</p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Dosis:</span> {medication.dosage}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Duración:</span> {medication.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {medicalHistory?.notes && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Notas Clínicas</h3>
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <p className="text-gray-700 leading-relaxed">{medicalHistory.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No se pudo cargar el historial médico</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedPet && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              Busca una mascota para ver su historial médico completo
            </p>
          </div>
        )}

        {/* Modal de detalle del registro médico */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-linear-to-br from-amber-900/40 via-orange-900/40 to-amber-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="sticky top-0 bg-linear-to-r from-orange-400 to-orange-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Detalle del Registro Médico</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-white hover:bg-orange-500 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 space-y-6">
                {loadingRecord ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando registro médico...</p>
                  </div>
                ) : (
                  <>
                    {/* Diagnóstico */}
                    {selectedRecord.diagnosis && (
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h3 className="font-semibold text-gray-900 mb-2">🩺 Diagnóstico</h3>
                        <p className="text-gray-700">{selectedRecord.diagnosis}</p>
                      </div>
                    )}

                    {/* Tratamiento */}
                    {selectedRecord.treatment && (
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <h3 className="font-semibold text-gray-900 mb-2">💊 Tratamiento</h3>
                        <p className="text-gray-700">{selectedRecord.treatment}</p>
                      </div>
                    )}

                    {/* Medicaciones */}
                    {selectedRecord.medications && (
                      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <h3 className="font-semibold text-gray-900 mb-2">💉 Medicaciones</h3>
                        <p className="text-gray-700">{selectedRecord.medications}</p>
                      </div>
                    )}

                    {/* Observaciones */}
                    {selectedRecord.observations && (
                      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                        <h3 className="font-semibold text-gray-900 mb-2">📋 Observaciones</h3>
                        <p className="text-gray-700">{selectedRecord.observations}</p>
                      </div>
                    )}

                    {/* Vacunaciones */}
                    {selectedRecord.vaccinations && (
                      <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <h3 className="font-semibold text-gray-900 mb-2">💉 Vacunaciones</h3>
                        <p className="text-gray-700">{selectedRecord.vaccinations}</p>
                      </div>
                    )}

                    {/* Datos vitales */}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRecord.weight && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">⚖️ Peso</h3>
                          <p className="text-2xl font-bold text-gray-700">{selectedRecord.weight} kg</p>
                        </div>
                      )}
                      {selectedRecord.temperature && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">🌡️ Temperatura</h3>
                          <p className="text-2xl font-bold text-gray-700">{selectedRecord.temperature}°C</p>
                        </div>
                      )}
                    </div>

                    {/* Próxima cita */}
                    {selectedRecord.nextAppointment && (
                      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <h3 className="font-semibold text-gray-900 mb-2">📅 Próxima Cita</h3>
                        <p className="text-gray-700">{new Date(selectedRecord.nextAppointment).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
