"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleAuthCallback } from "@/src/services/user.services";
import { useAuth } from "@/src/context/AuthContext";
import { toast } from "react-toastify";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const {setUserData } = useAuth();

  useEffect(() => {
    async function processAuth() {
      try {
        setLoading(true);
        // Procesar el callback de autenticación
        const response = await handleAuthCallback();
        console.log(response);
        
        // Guardar información del usuario en el contexto
        setUserData({
          token: document.cookie.includes("access_token")
            ? "token-en-cookie"
            : "",
          user: {
            id: response.id || '',
            email: response.email || '',
            name: response.name || '',
            address: response.address || '',
            phone: response.phone || '',
            role: response.role || 'user',
            uid: response.uid || response.id || '',
            user: response.user || response.email || '',
            country: response.country || '',
            city: response.city || '',
            isDeleted: response.isDeleted || false,
            deletedAt: response.deletedAt || null,
            pets: response.pets || [],
            buyerSaleOrders: response.buyerSaleOrders,
            profileImageUrl: response.profileImageUrl
          },         
        });
        /* toast.success("Se ha logeado exitosamente") */
        window.location.href = '/'
      } catch (err) {
        console.error("Error de autenticación:", err);
        toast.error("Error al intentar ingresar")
        setError(
          "Hubo un problema al procesar la autenticación. Por favor, intenta de nuevo."
        );
      } finally {
        setLoading(false);
      }
    }

    processAuth();
  }, [router, setUserData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-200">
      {loading ? (
        <div className="text-center">
          <h2 className="text-2xl mb-4 text-black">
            Procesando autenticación...
          </h2>
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center">
          <h2 className="text-2xl mb-2 text-red-700">Error de autenticación</h2>
          <p className="text-red-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => router.push("/auth/login")}
          >
            Volver al inicio de sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}