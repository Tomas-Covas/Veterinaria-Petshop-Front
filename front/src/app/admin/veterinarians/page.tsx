"use client";

import { useRequireRole } from "@/src/hooks/useRole";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import {
  createVeterinarian,
  getAllVeterinariansAdmin,
  deleteVeterinarian,
  ICreateVeterinarian,
} from "@/src/services/veterinarian.admin.services";
import { IVeterinarian } from "@/src/types";
import { toast } from "react-toastify";

export default function VeterinarianManagement() {
  const { isLoading, hasAccess } = useRequireRole("admin");
  const { userData } = useAuth();
  const [veterinarians, setVeterinarians] = useState<IVeterinarian[]>([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<ICreateVeterinarian>({
    name: "",
    email: "",
    matricula: "",
    description: "",
    phone: "",
    time: "",
    horario_atencion: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{
    phone?: string;
    email?: string; 
    matricula?: string;
    name?: string;
    description?: string;
    scheduleStart?: string;
    scheduleEnd?: string;
}>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vetToDelete, setVetToDelete] = useState<{ id: string; name: string } | null>(null);

  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const phoneRegex = /^(\+54)?[0-9]{10,13}$/;
  const matriculaRegex = /^[0-9]{3,6}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (userData?.token) {
      loadVeterinarians();
    }
  }, [userData]);

  const loadVeterinarians = async () => {
    try {
      setLoadingVets(true);
      const data = await getAllVeterinariansAdmin(userData?.token || "");
      console.log('Datos recibidos en loadVeterinarians:', data);

      // El backend puede devolver {message, data: [...]} o directamente [...]
      const vetsArray = data?.data || data;
      console.log('Array de veterinarios a guardar:', vetsArray);

      // Asegurarse de que data sea un array
      setVeterinarians(Array.isArray(vetsArray) ? vetsArray : []);
    } catch (error) {
      console.error("Error al cargar veterinarios:", error);
      setVeterinarians([]); // Set vacío en caso de error
    } finally {
      setLoadingVets(false);
    }
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Ingresá un email válido";
    }

    if (!formData.matricula || !matriculaRegex.test(formData.matricula)) {
      errors.matricula = "La matrícula debe tener entre 3 y 6 números";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone || !phoneRegex.test(cleanPhone)) {
      errors.phone = "Ingresá un teléfono válido (10 a 13 dígitos)";
    }

    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres";
    }

    if (!scheduleStart) {
      errors.scheduleStart = "Seleccioná un horario de inicio";
    }

    if (!scheduleEnd) {
      errors.scheduleEnd = "Seleccioná un horario de fin";
    }

    if (scheduleStart && scheduleEnd && scheduleStart >= scheduleEnd) {
      errors.scheduleEnd = "El horario de fin debe ser posterior al de inicio";
    }

    return errors;
  };


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    try {
      // Crear fecha actual para time (debe ser fecha ISO: "2025-12-11")
      const today = new Date().toISOString().split('T')[0];

      // Crear horario_atencion como ISO datetime usando el horario de inicio
      const [hours, minutes] = scheduleStart.split(':');
      const horarioDate = new Date();
      horarioDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const dataToSend: ICreateVeterinarian = {
        ...formData,
        time: today, // Fecha ISO: "2025-12-11"
        horario_atencion: horarioDate.toISOString(), // Datetime completo: "2025-12-11T09:00:00Z"
        isActive: true,
      };
      const result = await createVeterinarian(dataToSend, userData?.token || "");

      // Extraer contraseña del message
      let tempPassword = result.temporaryPassword || 
                        result.password || 
                        result.data?.temporaryPassword;
      
      // Si no está en los campos, extraerla del message
      if (!tempPassword && result.message) {
        const match = result.message.match(/contraseña temporal es:\s*(.+?)(?:\.|$)/i);
        if (match) {
          tempPassword = match[1].trim();
        }
      }

      if (tempPassword) {
        setPasswordData({
          email: formData.email,
          password: tempPassword,
          name: formData.name
        });
        setShowPasswordModal(true);
      }

      setShowCreateForm(false);
      setFormData({
        name: "",
        email: "",
        matricula: "",
        description: "",
        phone: "",
        time: "",
        horario_atencion: "",
        isActive: true,
      });
      setScheduleStart("");
      setScheduleEnd("");
      setErrors({});
      loadVeterinarians();
    } catch (error: any) {
      toast.error('❌ ' + (error.message || "Error al crear veterinario"));
    }
  };



  const handleDelete = (id: string, name: string) => {
    setVetToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!vetToDelete) return;

    try {
      await deleteVeterinarian(vetToDelete.id, userData?.token || "");
      setShowDeleteModal(false);
      setVetToDelete(null);
      loadVeterinarians();
    } catch (error: any) {
      console.error("Error al eliminar:", error);
    }
  };





  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col min-[415px]:flex-row justify-between items-start min-[415px]:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Gestión de Veterinarios
          </h1>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setFormData({
                name: "",
                email: "",
                matricula: "",
                description: "",
                phone: "",
                time: "",
              });
            }}
            className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all w-full min-[415px]:w-auto"
          >
            {showCreateForm ? "Cancelar" : "Crear Veterinario"}
          </button>
        </div>

        {/* Formulario de creación */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Crear Nuevo Veterinario
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, name: value });
                      
                      if (value.trim().length < 3 && value.length > 0) {
                        setErrors((prev) => ({ ...prev, name: "El nombre debe tener al menos 3 caracteres" }));
                      } else {
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.name ? "border-red-500" : "border-amber-300"
                    }`}
                    placeholder="Ej: Dr. Juan Pérez"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData({ ...formData, email: value });

                      if (!emailRegex.test(value)) {
                        setErrors((prev) => ({
                          ...prev,
                          email: "Formato invalido de email. Formato valido xxx@xx.xxx"
                        }));
                      } else {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                  className={`w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500
                    ${errors.email ? "border-red-500" : "border-amber-300"}`}
                  required
                  />
                  {errors.matricula && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Matricula */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData({ ...formData, matricula: value });

                      if (!matriculaRegex.test(value)) {
                        setErrors((prev) => ({
                          ...prev,
                          matricula: "La matrícula debe tener entre 3 y 6 números"
                        }));
                      } else {
                        setErrors((prev) => ({ ...prev, matricula: undefined }));
                      }
                    }}
                    className={`w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                     ${errors.matricula ? "border-red-500" : "border-amber-300"}`}
                    placeholder="Ej: 12345"
                    required
                  />
                  {errors.matricula && (
                    <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>
                  )}
                </div>

                {/* Telefono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData({ ...formData, phone: value });

                      if (!phoneRegex.test(value)) {
                        setErrors((prev) => ({
                          ...prev,
                          phone: "El telefono debe tener entre 10 y 13 números"
                        }));
                      } else {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    className={`w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500
                      ${errors.phone ? "border-red-500" : "border-amber-300"}`}
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horario de Inicio
                    </label>
                    <select
                      value={scheduleStart}
                      onChange={(e) => {
                        const value = e.target.value;
                        setScheduleStart(value);
                        setErrors((prev) => ({ ...prev, scheduleStart: undefined }));
                      }}
                      className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.scheduleStart ? "border-red-500" : "border-amber-300"
                      }`}
                      required
                    >
                      <option value="">Seleccionar hora</option>
                      {Array.from({ length: 48 }, (_, i) => {
                        const hour = Math.floor(i / 2).toString().padStart(2, '0');
                        const minute = i % 2 === 0 ? '00' : '30';
                        return `${hour}:${minute}`;
                      }).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.scheduleStart && (
                      <p className="text-red-600 text-sm mt-1">{errors.scheduleStart}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horario de Fin
                    </label>
                    <select
                      value={scheduleEnd}
                      onChange={(e) => {
                        const value = e.target.value;
                        setScheduleEnd(value);
                        
                        if (scheduleStart && value && scheduleStart >= value) {
                          setErrors((prev) => ({ ...prev, scheduleEnd: "El horario de fin debe ser posterior al de inicio" }));
                        } else {
                          setErrors((prev) => ({ ...prev, scheduleEnd: undefined }));
                        }
                      }}
                      className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.scheduleEnd ? "border-red-500" : "border-amber-300"
                      }`}
                      required
                    >
                      <option value="">Seleccionar hora</option>
                      {Array.from({ length: 48 }, (_, i) => {
                        const hour = Math.floor(i / 2).toString().padStart(2, '0');
                        const minute = i % 2 === 0 ? '00' : '30';
                        return `${hour}:${minute}`;
                      }).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.scheduleEnd && (
                      <p className="text-red-600 text-sm mt-1">{errors.scheduleEnd}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                {errors.description && (
                  <p className="text-red-600 text-sm mb-1">{errors.description}</p>
                )}
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({
                      name: "",
                      email: "",
                      matricula: "",
                      description: "",
                      phone: "",
                      time: "",
                      horario_atencion: "",
                      isActive: true,
                    });
                    setScheduleStart("");
                    setScheduleEnd("");
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de veterinarios */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Veterinarios Registrados
          </h2>
          {loadingVets ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
            </div>
          ) : veterinarians.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No hay veterinarios registrados
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Matrícula
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Teléfono
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {veterinarians.map((vet) => (
                    <tr key={vet.id} className="hover:bg-amber-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{vet.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vet.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vet.matricula}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{vet.phone}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDelete(vet.id, vet.name)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Contraseña Temporal */}
      {showPasswordModal && passwordData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">¡Veterinario Creado!</h3>
              <p className="text-gray-600 mt-2">Credenciales generadas exitosamente</p>
            </div>

            {/* Info */}
            <div className="space-y-4 mb-6">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 mb-1">Importante</p>
                    <p className="text-sm text-amber-800">Guarda esta contraseña. El veterinario debe cambiarla en su primer inicio de sesión.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
                  <p className="text-gray-900 font-semibold">{passwordData.name}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email (enviado por correo)</p>
                  <p className="text-gray-900 font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {passwordData.email}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contraseña Temporal</p>
                  <div className="bg-white border-2 border-amber-300 rounded-lg p-3 font-mono text-lg text-center text-gray-900 font-bold">
                    {passwordData.password}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Se ha enviado un email a <strong>{passwordData.email}</strong> con las credenciales de acceso.</span>
                </p>
              </div>
            </div>

            {/* Botón */}
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData(null);
              }}
              className="w-full bg-linear-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && vetToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">¿Eliminar Veterinario?</h3>
              <p className="text-gray-600 mt-2">Esta acción no se puede deshacer</p>
            </div>

            {/* Info del veterinario */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Veterinario a eliminar:</p>
              <p className="text-lg font-semibold text-gray-900">{vetToDelete.name}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-800 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Al eliminar este veterinario se perderán todos sus datos, turnos y registros asociados.</span>
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVetToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
