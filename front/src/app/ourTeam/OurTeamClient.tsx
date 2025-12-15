'use client';

import { useState, useEffect } from "react";
import VeterinaryCard from "../components/VeterinaryCard/VeterinaryCard";
import { IVeterinarian } from "@/src/types";
import Image from "next/image";
import bannerourteam from "../../assets/bannerourteam.png";
import { useAuth } from "@/src/context/AuthContext";
import { useRole } from "@/src/hooks/useRole";
import {
  createVeterinarian,
  deleteVeterinarian,
  ICreateVeterinarian,
} from "@/src/services/veterinarian.admin.services";

interface OurTeamClientProps {
  initialVets: IVeterinarian[];
}

export default function OurTeamClient({ initialVets }: OurTeamClientProps) {
  const [vets, setVets] = useState<IVeterinarian[]>(initialVets);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<ICreateVeterinarian>({
    name: "",
    email: "",
    matricula: "",
    description: "",
    phone: "",
    time: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const { userData } = useAuth();
  const { isAdmin } = useRole();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.token) {
      alert("Debes iniciar sesión como admin");
      return;
    }

    setIsCreating(true);
    try {
      // El backend espera time en formato ISO 8601
      // Usamos una fecha arbitraria (hoy) como placeholder
      const timeISO = new Date().toISOString();
      
      const dataToSend: ICreateVeterinarian = {
        name: formData.name,
        email: formData.email,
        matricula: formData.matricula,
        description: formData.description,
        phone: formData.phone,
        time: timeISO, // Siempre enviar ISO 8601
      };
      
      const newVet = await createVeterinarian(dataToSend, userData.token);
      setVets([...vets, newVet]);
      setShowCreateForm(false);
      setFormData({
        name: "",
        email: "",
        matricula: "",
        description: "",
        phone: "",
        time: "",
      });
      
      // Mostrar el mensaje completo del backend (incluye contraseña temporal)
      if (newVet.message) {
        alert(newVet.message);
      } else if (newVet.temporaryPassword || newVet.password) {
        const tempPassword = newVet.temporaryPassword || newVet.password;
        alert(
          `✅ Veterinario creado exitosamente\n\n` +
          `📧 Email: ${newVet.email || formData.email}\n` +
          `🔑 Contraseña temporal: ${tempPassword}\n\n` +
          `⚠️ IMPORTANTE: Guarda esta contraseña, el veterinario debe cambiarla al iniciar sesión.`
        );
      } else {
        alert("Veterinario creado exitosamente");
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      alert(error.message || "Error al crear veterinario");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este veterinario?")) return;
    if (!userData?.token) {
      alert("Debes iniciar sesión como admin");
      return;
    }

    try {
      await deleteVeterinarian(id, userData.token);
      setVets(vets.filter((v) => v.id !== id));
      alert("Veterinario eliminado exitosamente");
    } catch (error: any) {
      alert(error.message || "Error al eliminar veterinario");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-orange-200 pt-20">
      {/* Banner con imagen y título */}
      <div className="relative h-[400px] w-full mb-12">
        <Image
          src={bannerourteam}
          alt="banner gato"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-orange-500/70 to-amber-500/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Nuestro Equipo</h1>
            <p className="text-xl md:text-2xl">
              Profesionales dedicados al cuidado de tu mascota
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-6 pb-12">
        {/* Botón de crear veterinario (solo admin) */}
        {isAdmin() && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
            >
              {showCreateForm ? "Cancelar" : "+ Crear Veterinario"}
            </button>
          </div>
        )}

        {/* Formulario de creación */}
        {isAdmin() && showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-amber-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Crear Nuevo Veterinario
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Horario (opcional - solo para referencia)
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="El sistema asignará automáticamente la fecha"
                    className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                {isCreating ? "Creando..." : "Crear Veterinario"}
              </button>
            </form>
          </div>
        )}

        {/* Grid de veterinarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vets.map((vet) => (
            <div key={vet.id} className="relative h-full min-h-[450px]">
              <VeterinaryCard veterinary={vet} disableLink={true} />
              {isAdmin() && (
                <button
                  onClick={() => handleDelete(vet.id)}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition z-10 font-bold text-lg"
                  title="Eliminar veterinario"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
