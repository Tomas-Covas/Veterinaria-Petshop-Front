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
  
  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    especie: 'TODOS',
    estado: 'TODOS',
    tamano: 'TODOS',
    esterilizado: 'TODOS',
    fechaDesde: '',
    fechaHasta: '',
  });

  const handlePetSelect = async (pet: Pet) => {
    setSelectedPet(pet);
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken') || '';
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

  const handleClearFilters = () => {
    setFilters({
      especie: 'TODOS',
      estado: 'TODOS',
      tamano: 'TODOS',
      esterilizado: 'TODOS',
      fechaDesde: '',
      fechaHasta: '',
    });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleViewRecord = async (appointmentId: string) => {
    if (!selectedPet) return;
    
    setLoadingRecord(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      console.log('📋 Buscando registro médico para appointment:', appointmentId);
      console.log('🐾 Pet ID:', selectedPet.id);
      console.log('📅 Appointments de la mascota:', selectedPet.appointments);
      
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
        console.error('❌ Error al obtener registros médicos:', response.status);
        return;
      }
      
      const result = await response.json();
      console.log('✅ Registros médicos obtenidos:', result);
      
      // Extraer el array de registros
      const records = result.data || result.records || result.medicalRecords || result || [];
      console.log('📋 Total de registros:', Array.isArray(records) ? records.length : 0);
      
      if (!Array.isArray(records) || records.length === 0) {
        console.log('⚠️ No hay registros médicos para esta mascota');
        return;
      }
      
      // Buscar el registro que corresponde al appointment
      const appointment = selectedPet.appointments?.find((apt: any) => apt.id === appointmentId);
      console.log('🔎 Buscando registro para appointment:', appointment);
      console.log('📋 Registros disponibles:', records);
      
      // Si solo hay 1 registro y 1 appointment, hacer match directo
      if (records.length === 1) {
        console.log('✅ Solo hay 1 registro, mostrándolo');
        setSelectedRecord(records[0]);
      } else if (appointment) {
        // Intentar hacer match por veterinario y fecha
        const record = records.find((r: any) => {
          // Match por veterinario
          const vetMatch = r.veterinarian?.id === appointment.veterinarian?.id || 
                          r.veterinarianId === appointment.veterinarian?.id;
          
          // Match por fecha aproximada (mismo día)
          const recordDate = r.consultationDate || r.createdAt;
          const appointmentDate = appointment.date;
          const dateMatch = recordDate && appointmentDate && 
                           recordDate.split('T')[0] === appointmentDate.split('T')[0];
          
          return vetMatch && dateMatch;
        });
        
        if (record) {
          console.log('✅ Registro médico encontrado por veterinario y fecha:', record);
          setSelectedRecord(record);
        } else {
          console.log('⚠️ No se encontró registro específico, mostrando el primero');
          setSelectedRecord(records[0]);
        }
      } else {
        console.log('💡 Mostrando el primer registro como fallback');
        setSelectedRecord(records[0]);
      }
    } catch (error) {
      console.error('❌ Error al obtener registro médico:', error);
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
        <div className="mb-6">
          <PetSearchBar 
            onSelectPet={handlePetSelect}
            filters={filters}
          />
        </div>

        {/* Botón para mostrar/ocultar filtros */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium shadow-sm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            {(filters.especie !== 'TODOS' || filters.estado !== 'TODOS' || filters.tamano !== 'TODOS' || filters.esterilizado !== 'TODOS' || filters.fechaDesde || filters.fechaHasta) && (
              <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                Activo
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Filtros de búsqueda</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Especie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Especie
                </label>
                <select
                  value={filters.especie}
                  onChange={(e) => handleFilterChange('especie', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="TODOS">Todas las especies</option>
                  <option value="PERRO">🐕 Perro</option>
                  <option value="GATO">🐱 Gato</option>
                  <option value="AVE">🦜 Ave</option>
                  <option value="ROEDOR">🐹 Roedor</option>
                  <option value="REPTIL">🦎 Reptil</option>
                  <option value="OTRO">🐾 Otro</option>
                </select>
              </div>

              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="VIVO">✅ Vivo</option>
                  <option value="FALLECIDO">💔 Fallecido</option>
                </select>
              </div>

              {/* Filtro por Tamaño */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tamaño
                </label>
                <select
                  value={filters.tamano}
                  onChange={(e) => handleFilterChange('tamano', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="TODOS">Todos los tamaños</option>
                  <option value="PEQUENO">Pequeño</option>
                  <option value="MEDIANO">Mediano</option>
                  <option value="GRANDE">Grande</option>
                </select>
              </div>

              {/* Filtro por Esterilización */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Esterilización
                </label>
                <select
                  value={filters.esterilizado}
                  onChange={(e) => handleFilterChange('esterilizado', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="TODOS">Todos</option>
                  <option value="SI">✅ Esterilizado</option>
                  <option value="NO">❌ No esterilizado</option>
                </select>
              </div>

              {/* Filtro por Fecha Desde */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Filtro por Fecha Hasta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Resumen de filtros activos */}
            {(filters.especie !== 'TODOS' || filters.estado !== 'TODOS' || filters.tamano !== 'TODOS' || filters.esterilizado !== 'TODOS' || filters.fechaDesde || filters.fechaHasta) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Filtros activos:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {filters.especie !== 'TODOS' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Especie: {filters.especie}
                    </span>
                  )}
                  {filters.estado !== 'TODOS' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Estado: {filters.estado}
                    </span>
                  )}
                  {filters.tamano !== 'TODOS' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Tamaño: {filters.tamano}
                    </span>
                  )}
                  {filters.esterilizado !== 'TODOS' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Esterilizado: {filters.esterilizado}
                    </span>
                  )}
                  {filters.fechaDesde && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Desde: {new Date(filters.fechaDesde).toLocaleDateString('es-ES')}
                    </span>
                  )}
                  {filters.fechaHasta && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      Hasta: {new Date(filters.fechaHasta).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
