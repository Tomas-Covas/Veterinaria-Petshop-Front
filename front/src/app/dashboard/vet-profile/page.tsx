'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getVeterinarianById } from '@/src/services/veterinarian.admin.services';

export default function VetProfilePage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [veterinarianData, setVeterinarianData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (userData?.user?.id) {
        setLoading(true);
        try {
          const token = localStorage.getItem('authToken') || '';
          const response = await getVeterinarianById(userData.user.id, token);
          console.log('Datos del veterinario recargados:', response);
          const dataToSet = response.data || response;
          console.log('Datos a guardar en estado:', dataToSet);
          setVeterinarianData(dataToSet);
        } catch (error) {
          console.error('Error al cargar datos:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [userData?.user?.id, refreshKey]);

  console.log('Estado actual veterinarianData:', veterinarianData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil Profesional</h1>
          <p className="text-gray-600 mt-2">Información de tu cuenta veterinaria</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header con foto */}
          <div className="bg-linear-to-r from-orange-400 to-orange-600 h-32"></div>
          
          <div className="px-8 pb-8">
            {/* Foto de perfil */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600 shadow-lg">
                {veterinarianData?.profileImageUrl ? (
                  <img 
                    src={veterinarianData.profileImageUrl} 
                    alt="Perfil" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  veterinarianData?.name?.charAt(0) || 'V'
                )}
              </div>
            </div>

            {/* Información personal */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Nombre Completo
                  </label>
                  <p className="mt-2 text-lg text-gray-900">
                    {veterinarianData?.name || userData?.user?.name || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Matrícula Profesional
                  </label>
                  <p className="mt-2 text-lg text-gray-900 font-semibold text-orange-600">
                    {veterinarianData?.matricula || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </label>
                  <p className="mt-2 text-lg text-gray-900">
                    {veterinarianData?.email || userData?.user?.email || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Teléfono
                  </label>
                  <p className="mt-2 text-lg text-gray-900">
                    {veterinarianData?.phone || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Especialidad
                  </label>
                  <p className="mt-2 text-lg text-gray-900">
                    {veterinarianData?.specialty || 'No especificada'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Dirección del Consultorio
                  </label>
                  <p className="mt-2 text-lg text-gray-900">
                    {veterinarianData?.address || 'No especificada'}
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {veterinarianData?.description && (
                <div className="border-t pt-6">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Sobre mí
                  </label>
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    {veterinarianData.description}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => router.push('/dashboard/edit-profile')}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Editar Perfil
                </button>
                <button
                  onClick={() => router.push('/change-password')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
