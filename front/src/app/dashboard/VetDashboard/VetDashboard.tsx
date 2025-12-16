'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CompleteTurnModal, { MedicalRecordData } from '@/src/app/components/CompleteTurnModal/CompleteTurnModal'
import { addMedicalRecord } from '@/src/app/services/pet.services'
import { getAppointmentsByVetId, Appointment } from '@/src/services/appointment.services'

interface VetAppointment {
  id: string
  date: string
  time: string
  petName: string
  petOwner: string
  service: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  petId?: string
}

interface VetDashboardProps {
  veterinarian: {
    id?: string
    name: string
    email: string
    phone: string
    specialty: string
    license: string
    address: string
  }
}

export default function VetDashboard({ veterinarian }: VetDashboardProps) {
  const { userData } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<VetAppointment | null>(null);
  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showCancelled, setShowCancelled] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Primero obtener el veterinario asociado al usuario
        const userId = userData?.user?.id;
        const token = userData?.token || localStorage.getItem('authToken');

        if (!userId || !token) {
          console.error('❌ No hay ID de usuario o token');
          setLoading(false);
          return;
        }

        console.log('👤 ID del usuario logueado:', userId);
        console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');

        // Buscar el veterinario por userId
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/veterinarians`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener veterinarios');
        }

        const result = await response.json();
        const allVets = result.data || result;
        
        console.log('🏥 Todos los veterinarios:', allVets);
        
        // Encontrar el veterinario que coincide con el userId
        // El ID del veterinario puede ser igual al userId o estar en vet.userId o vet.user?.id
        const currentVet = allVets.find((vet: any) => 
          vet.id === userId || vet.userId === userId || vet.user?.id === userId
        );
        
        console.log('🔍 Veterinario buscado con userId:', userId);
        console.log('🩺 Veterinario encontrado:', currentVet);
        
        if (!currentVet) {
          console.error('❌ No se encontró veterinario para este usuario');
          setAppointments([]);
          setLoading(false);
          return;
        }

        const vetId = currentVet.id;
        console.log('🩺 ID del veterinario encontrado:', vetId);
        console.log('📅 Obteniendo turnos para veterinario:', vetId);
        
        const backendAppointments = await getAppointmentsByVetId(vetId, token);
        
        console.log('📊 Respuesta del backend - cantidad de turnos:', backendAppointments.length);
        console.log('📋 Turnos recibidos:', JSON.stringify(backendAppointments, null, 2));
        
        // Mapear los datos del backend al formato del componente
        const mappedAppointments: VetAppointment[] = backendAppointments.map((apt) => ({
          id: apt.id,
          date: apt.date,
          time: apt.time,
          petName: apt.pet?.nombre || 'Mascota sin nombre',
          petOwner: apt.pet?.owner?.name || 'Dueño sin nombre',
          service: 'Consulta general', // No hay campo detail en la respuesta
          status: apt.status ? 'pending' : 'cancelled', // status: true = activo/pending, false = cancelado
          notes: '',
          petId: apt.pet?.id
        }));
        
        console.log('✅ Turnos mapeados:', mappedAppointments);
        setAppointments(mappedAppointments);
      } catch (error) {
        console.error('❌ Error al cargar turnos:', error);
        // En caso de error, mostrar array vacío
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [veterinarian, userData]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Agregar días vacíos al principio
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(app => app.date === dateString);
  };

  const getAppointmentsForSelectedDate = () => {
    return getAppointmentsForDate(selectedDate);
  };

  const handleCompleteAppointment = (appointment: VetAppointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );
    }
  };

  const handleSubmitMedicalRecord = async (medicalData: MedicalRecordData) => {
    if (!selectedAppointment || !userData?.user?.id) return;

    const token = localStorage.getItem('authToken') || '';
    
    const recordData = {
      petId: selectedAppointment.petId || '',
      veterinarianId: userData.user.id,
      diagnosis: medicalData.diagnosis,
      treatment: medicalData.treatment,
      medications: medicalData.medications,
      observations: medicalData.observations,
      nextAppointment: medicalData.nextAppointment ? new Date(medicalData.nextAppointment).toISOString() : undefined,
      vaccinations: medicalData.vaccinations,
      weight: medicalData.weight ? parseFloat(medicalData.weight) : undefined,
      temperature: medicalData.temperature ? parseFloat(medicalData.temperature) : undefined,
      medicationsUsed: medicalData.medicationsUsed || [],
    };
    
    console.log('📝 Guardando registro para appointment:', selectedAppointment.id);
    console.log('💊 Medicamentos usados:', medicalData.medicationsUsed);

    const result = await addMedicalRecord(recordData, token);
    
    if (result.message) {
      // Mostrar resumen de medicamentos usados
      if (result.data?.medicationsUsed && result.data.medicationsUsed.length > 0) {
        console.log('✅ Medicamentos descontados del stock:');
        result.data.medicationsUsed.forEach(med => {
          console.log(`  - ${med.name}: ${med.quantity} unidades, stock restante: ${med.remainingStock}`);
        });
      }
      
      // Actualizar estado del turno
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: 'completed' as const }
            : apt
        )
      );
      
      // Cerrar el modal
      setIsModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-gray-50 pt-20 min-h-screen">
      <div className="pt-6 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Mi Calendario de Turnos
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestiona tus citas y consultas veterinarias
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/messages"
                className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-xl">💬</span>
                <span>Mensajería</span>
              </Link>
              <Link
                href="/dashboard/general-medications"
                className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-xl">💊</span>
                <span>Medicamentos</span>
              </Link>
              <Link
                href="/dashboard/controlled-medications"
                className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                <span className="text-xl">🔐</span>
                <span>Controlados</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CALENDARIO MENSUAL */}
              <div className="bg-white rounded-lg shadow-lg p-4 lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  <div className="flex gap-1">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        setCurrentMonth(new Date());
                        setSelectedDate(new Date());
                      }}
                      className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300 text-xs"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => changeMonth(1)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Nombres de días */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-[10px] font-semibold text-gray-600 py-0.5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-0.5">
                  {getDaysInMonth(currentMonth).map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const dayAppointments = getAppointmentsForDate(day);
                    const hasAppointments = dayAppointments.length > 0;

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`aspect-square p-0.5 rounded text-center transition-all relative ${
                          isSelected(day)
                            ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-400'
                            : isToday(day)
                            ? 'bg-blue-50 text-blue-900 border border-blue-400'
                            : hasAppointments
                            ? 'bg-orange-100 border border-orange-400 hover:bg-orange-200 font-bold'
                            : 'bg-white border border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className={`text-xs font-semibold ${
                          isSelected(day) 
                            ? 'text-white' 
                            : hasAppointments 
                            ? 'text-orange-700' 
                            : 'text-gray-700'
                        }`}>
                          {day.getDate()}
                        </div>
                        {hasAppointments && (
                          <div className={`text-[9px] leading-none ${isSelected(day) ? 'text-white' : 'text-orange-700'} font-bold`}>
                            {dayAppointments.length}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TURNOS DEL DÍA SELECCIONADO */}
              <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Turnos del {selectedDate.toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </h2>
                
                <div className="space-y-4">
                  {getAppointmentsForSelectedDate().length > 0 ? (
                    <>
                      {/* PENDIENTES */}
                      {getAppointmentsForSelectedDate().filter(apt => apt.status === 'pending').length > 0 && (
                        <div className="mb-6">
                          <button
                            onClick={() => setShowPending(!showPending)}
                            className="w-full text-left text-sm font-bold text-orange-600 uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-orange-700 transition-colors"
                          >
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            Pendientes ({getAppointmentsForSelectedDate().filter(apt => apt.status === 'pending').length})
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
                          {showPending && <div className="space-y-3">
                            {getAppointmentsForSelectedDate()
                              .filter(apt => apt.status === 'pending')
                              .map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="bg-orange-50 rounded-lg p-5 border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                          {appointment.petName}
                                        </h3>
                                        <span className="text-sm font-medium text-orange-600">
                                          {appointment.time}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Dueño: {appointment.petOwner}
                                      </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      Pendiente
                                    </span>
                                  </div>

                                  <div className="border-t border-orange-200 pt-3 space-y-2">
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Servicio:</span> {appointment.service}
                                    </p>
                                    {appointment.notes && (
                                      <p className="text-sm text-gray-600 italic mt-2 p-2 bg-white rounded">
                                        <span className="font-medium">Notas:</span> {appointment.notes}
                                      </p>
                                    )}
                                  </div>

                                  <div className="mt-4 flex space-x-3">
                                    <button 
                                      onClick={() => handleCompleteAppointment(appointment)}
                                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                                    >
                                      ✓ Completar Consulta
                                    </button>
                                    <button 
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                                    >
                                      ✕ Cancelar
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>}
                        </div>
                      )}

                      {/* COMPLETADOS */}
                      {getAppointmentsForSelectedDate().filter(apt => apt.status === 'completed').length > 0 && (
                        <div className="mb-6">
                          <button
                            onClick={() => setShowCompleted(!showCompleted)}
                            className="w-full text-left text-sm font-bold text-green-600 uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-green-700 transition-colors"
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Completados ({getAppointmentsForSelectedDate().filter(apt => apt.status === 'completed').length})
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
                          {showCompleted && <div className="space-y-3">
                            {getAppointmentsForSelectedDate()
                              .filter(apt => apt.status === 'completed')
                              .map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="bg-green-50 rounded-lg p-5 border-2 border-green-300"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                          {appointment.petName}
                                        </h3>
                                        <span className="text-sm font-medium text-green-600">
                                          {appointment.time}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Dueño: {appointment.petOwner}
                                      </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      ✓ Completado
                                    </span>
                                  </div>

                                  <div className="border-t border-green-200 pt-3 space-y-2">
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Servicio:</span> {appointment.service}
                                    </p>
                                    {appointment.notes && (
                                      <p className="text-sm text-gray-600 italic mt-2 p-2 bg-white rounded">
                                        <span className="font-medium">Notas:</span> {appointment.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>}
                        </div>
                      )}

                      {/* CANCELADOS */}
                      {getAppointmentsForSelectedDate().filter(apt => apt.status === 'cancelled').length > 0 && (
                        <div>
                          <button
                            onClick={() => setShowCancelled(!showCancelled)}
                            className="w-full text-left text-sm font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2 hover:text-red-700 transition-colors"
                          >
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Cancelados ({getAppointmentsForSelectedDate().filter(apt => apt.status === 'cancelled').length})
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 ml-auto transition-transform ${showCancelled ? 'rotate-180' : ''}`}
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showCancelled && <div className="space-y-3">
                            {getAppointmentsForSelectedDate()
                              .filter(apt => apt.status === 'cancelled')
                              .map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className="bg-red-50 rounded-lg p-5 border-2 border-red-300 opacity-75"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-semibold text-gray-900 line-through">
                                          {appointment.petName}
                                        </h3>
                                        <span className="text-sm font-medium text-red-600">
                                          {appointment.time}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        Dueño: {appointment.petOwner}
                                      </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      ✕ Cancelado
                                    </span>
                                  </div>

                                  <div className="border-t border-red-200 pt-3 space-y-2">
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Servicio:</span> {appointment.service}
                                    </p>
                                    {appointment.notes && (
                                      <p className="text-sm text-gray-600 italic mt-2 p-2 bg-white rounded">
                                        <span className="font-medium">Notas:</span> {appointment.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay turnos programados para esta fecha
                    </p>
                  )}
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Modal para completar consulta */}
      {selectedAppointment && (
        <CompleteTurnModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleSubmitMedicalRecord}
          appointment={{
            id: selectedAppointment.id,
            petName: selectedAppointment.petName,
            petOwner: selectedAppointment.petOwner,
            service: selectedAppointment.service,
            date: new Date(selectedAppointment.date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            time: selectedAppointment.time
          }}
        />
      )}
    </div>
  )
}
