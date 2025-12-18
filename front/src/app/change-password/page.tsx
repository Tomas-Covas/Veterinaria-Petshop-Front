"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { changeVeterinarianPassword } from "@/src/services/veterinarian.admin.services";
import { toast } from "react-toastify";

export default function ChangePasswordPage() {
  const { userData, setUserData } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.warning("Las contraseñas no coinciden");
      return;
    }

    if (!newPassword || newPassword.trim() === "") {
      toast.warning("La contraseña no puede estar vacía");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const email = userData?.user?.email;
      if (!email) {
        throw new Error("No se pudo obtener el email del usuario");
      }

      const result = await changeVeterinarianPassword(
        email,
        currentPassword,
        newPassword,
        confirmPassword,
        token
      );

      // Si el backend devuelve un nuevo token, guardarlo
      if (result.token) {
        localStorage.setItem("authToken", result.token);
      }

      toast.success('Contraseña cambiada exitosamente');
      setUserData({
        ...userData!,
        user: {
          ...userData!.user,
          requirePasswordChange: false
        }
      });

      localStorage.setItem('requirePasswordChange', 'false');
      document.cookie = "requirePasswordChange=false; path=/";

      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar contraseña");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const mustChange = userData?.user.requirePasswordChange;
    if (!mustChange) router.push("/dashboard");
  }, [userData]);

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 pt-24 pb-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-amber-200">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cambiar Contraseña
            </h1>
            <p className="text-gray-600">
              Por seguridad, debes cambiar tu contraseña temporal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña Actual (Temporal)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {isSubmitting ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
