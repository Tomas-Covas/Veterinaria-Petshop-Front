'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getVeterinarianById, updateVeterinarianProfile } from '@/src/services/veterinarian.admin.services';
import { toast } from 'react-toastify';

export default function EditProfilePage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    phone: '',
    address: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (userData?.user?.id) {
        try {
          const token = localStorage.getItem('authToken') || '';
          const response = await getVeterinarianById(userData.user.id, token);
          
          // Extraer data si viene en formato {message, data}
          const vetData = response.data || response;
          
          setFormData({
            description: vetData.description || '',
            phone: vetData.phone || '',
            address: vetData.address || ''
          });
          
          // El campo de imagen se llama profileImageUrl
          if (vetData.profileImageUrl) {
            setImagePreview(vetData.profileImageUrl);
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
          toast.error('Error al cargar datos del perfil');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [userData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken') || '';
      const data = new FormData();
      
      if (formData.description) data.append('description', formData.description);
      if (formData.phone) data.append('phone', formData.phone);
      // address no se envía porque el backend no lo acepta en este endpoint
      if (imageFile) data.append('profileImage', imageFile);

      await updateVeterinarianProfile(userData!.user!.id, data, token);
      
      toast.success('Perfil actualizado exitosamente');
      
      // Pequeño delay para asegurar que el backend procesó el cambio
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push('/dashboard/vet-profile');
      router.refresh(); // Forzar recarga de la página
    } catch (error: any) {
      console.error('Error completo:', error);
      toast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-gray-600 mt-2">Actualiza tu información profesional</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Imagen de perfil */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción Profesional
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Cuéntanos sobre tu experiencia y especialización..."
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="+54 11 1234-5678"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
              >
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
