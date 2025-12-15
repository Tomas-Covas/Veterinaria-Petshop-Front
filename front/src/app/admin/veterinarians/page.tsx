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
    matricula?: string 
}>({});

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

    if (!emailRegex.test(formData.email)) {
      errors.email = "Ingresá un email válido";
    }

    /*     if (!matriculaRegex.test(formData.matricula)) {
          setErrors((prev) => ({ ...prev, matricula: "La matrícula debe tener entre 3 y 6 números" }));
        } else {
          setErrors((prev) => ({ ...prev, matricula: undefined }));
        } */

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      errors.phone = "Ingresá un teléfono válido (10 a 13 dígitos)";
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

      // Mostrar el mensaje completo del backend (incluye contraseña temporal)
      if (result.message) {
        alert(result.message);
      } else if (result.temporaryPassword || result.password) {
        const tempPassword = result.temporaryPassword || result.password;
        alert(
          `✅ Veterinario creado exitosamente\n\n` +
          `📧 Email: ${result.email || formData.email}\n` +
          `🔑 Contraseña temporal: ${tempPassword}\n\n` +
          `⚠️ IMPORTANTE: Guarda esta contraseña, el veterinario debe cambiarla al iniciar sesión.`
        );
      } else {
        alert("Veterinario creado exitosamente");
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
      loadVeterinarians();
    } catch (error: any) {
      alert(error.message || "Error al crear veterinario");
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este veterinario?")) return;

    try {
      await deleteVeterinarian(id, userData?.token || "");
      alert("Veterinario eliminado exitosamente");
      loadVeterinarians();
    } catch (error: any) {
      alert(error.message || "Error al eliminar veterinario");
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
        <div className="flex justify-between items-center mb-8">
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
            className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
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
                      onChange={(e) => setScheduleStart(e.target.value)}
                      className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horario de Fin
                    </label>
                    <select
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
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
                          onClick={() => handleDelete(vet.id)}
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
    </div>
  );
}
