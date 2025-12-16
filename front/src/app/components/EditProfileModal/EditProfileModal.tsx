"use client";
import { useState } from "react";

interface UserProfile {
  id: string;
  name: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  image: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedData: any) => Promise<void>;
}

export default function EditProfileModal({
  open,
  onClose,
  user,
  onSave
}: Props) {

  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    country: user.country ?? "",
    address: user.address ?? "",
    city: user.city ?? ""
  });

  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      console.error(err);
      /* toast.error("Error al guardar los cambios"); */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-linear-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md flex items-center justify-center z-50">
      {/* Fondo translúcido con blur */}
      <div className="absolute inset-0 bg-cyan-700/40 backdrop-blur-sm" />

      <div className="relative bg-orange-200 p-6 rounded-2xl w-full max-w-md mx-4 shadow-lg z-10">

        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>

        <div className="flex flex-col gap-3">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ps-1">Nombre</label>
            <input
              name="name"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <input
              name="country"
              placeholder="País"
              value={form.country}
              onChange={handleChange}
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              name="address"
              placeholder="Dirección"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input
              name="city"
              placeholder="Ciudad"
              value={form.city}
              onChange={handleChange}
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex justify-evenly mt-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded cursor-pointer
                    hover:bg-orange-300 hover:border hover:border-orange-400"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 bg-cyan-700 cursor-pointer text-white rounded
                    hover:bg-cyan-900 hover:border hover:border-cyan-950"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}