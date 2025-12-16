"use client";

import { useAuth } from '@/src/context/AuthContext';
import AdminMedicationRequests from '@/src/app/components/AdminMedicationRequests/AdminMedicationRequests';

export default function AdminControlledMedicationsPage() {
  const { userData } = useAuth();

  if (!userData || userData.user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold">
            ⚠️ Solo los administradores pueden acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">🔐 Gestión de Medicamentos Controlados</h1>
        <p className="text-white/90">
          Administra todas las solicitudes de medicamentos controlados de los veterinarios
        </p>
      </div>

      {/* Componente principal */}
      <AdminMedicationRequests />
    </div>
  );
}
