"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import ControlledMedicationsForm from '@/src/app/components/ControlledMedicationsForm/ControlledMedicationsForm';
import MyMedicationRequests from '@/src/app/components/MyMedicationRequests/MyMedicationRequests';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ControlledMedicationsPage() {
  const { userData } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [veterinarianId, setVeterinarianId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.user?.id) {
      fetchVeterinarianId();
    }
  }, [userData]);

  const fetchVeterinarianId = async () => {
    try {
      setLoading(true);
      const userId = userData?.user?.id;
      
      // Buscar el veterinario por userId
      const response = await fetch(`${API_URL}/veterinarians`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener veterinarios');
      }

      const result = await response.json();
      const allVets = result.data || result;
      
      // Encontrar el veterinario que coincide con el userId
      const currentVet = allVets.find((vet: any) => 
        vet.id === userId || vet.userId === userId || vet.user?.id === userId
      );
      
      if (currentVet) {
        console.log('🩺 ID del veterinario encontrado:', currentVet.id);
        setVeterinarianId(currentVet.id);
      } else {
        console.error('❌ No se encontró veterinario para este usuario');
      }
    } catch (error) {
      console.error('Error buscando ID del veterinario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Refrescar la lista de solicitudes
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!userData || userData.user.role !== 'veterinarian') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">
            ⚠️ Solo los veterinarios pueden acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!veterinarianId) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">
            ⚠️ No se encontró el perfil de veterinario asociado a tu cuenta
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 space-y-8">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🔐 Medicamentos Controlados</h1>
        <p className="text-white/90">
          Sistema de solicitud y gestión de medicamentos controlados
        </p>
      </div>

      {/* Formulario de solicitud */}
      <ControlledMedicationsForm
        veterinarianId={veterinarianId}
        onSuccess={handleSuccess}
      />

      {/* Mis solicitudes */}
      <MyMedicationRequests
        veterinarianId={veterinarianId}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
