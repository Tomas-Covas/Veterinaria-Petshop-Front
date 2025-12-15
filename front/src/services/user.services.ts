"use client";

import { ILoginProps, IRegister } from "@/src/types/index";
import { toast } from "react-toastify";

const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function register(userData: IRegister) {
  try {
    const response = await fetch(`${APIURL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Register failed");
    }

    const result = await response.json();
    
    // Si el backend genera contraseña aleatoria, mostrarla al usuario
    if (result.temporaryPassword || result.password) {
      toast.success(
        `✅ Usuario registrado. Contraseña temporal: ${result.temporaryPassword || result.password}`,
        { autoClose: 10000 }
      );
    } else {
      toast.success("Usuario registrado con éxito");
    }
    
    return result;
  } catch (error: any) {
    toast.error("Error al registrarse, intentelo nuevamente");
    throw error;
  }
}

export async function login(userData: ILoginProps) {
  try {
    const response = await fetch(`${APIURL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    console.log('📡 Respuesta status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      
      if (response.status === 401) {
        toast.error('Credenciales inválidas. Verifica tu email y contraseña.');
      } else {
        toast.error(error.message || 'Error al iniciar sesión');
      }
      
      throw new Error(error.message || "Fallo al ingresar");
    }

    toast.success("Se ha logueado con éxito");
    const result = await response.json();
    
    // Guardar el token en localStorage si viene en la respuesta
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    } else {
      console.warn('⚠️ WARNING: Backend no envió token en la respuesta');
    }
    
    return result;
  } catch (error: any) {
    console.error('💥 Error capturado en login():', error.message);
    throw error;
  }
}

export async function getGoogleAuthUrl() {
  try {
    const res = await fetch(`${APIURL}/auth/google/url`);
    if (!res.ok){
      toast.error("Error al intentar ingresar, intente nuevamente")
      throw new Error("Error solicitando URL de autenticación");
    } 
    return res.json();
  } catch (error) {
    throw error;
  }
}

export async function handleAuthCallback() {
  const code = new URLSearchParams(window.location.search).get("code");
  const hash = window.location.hash;

  let callbackUrl = `${APIURL}/auth/callback`;
  
  if (code) {
    callbackUrl += `?code=${code}`;
  } else if (hash) {
    callbackUrl += `?hash=${encodeURIComponent(hash)}`;
  } else {
    throw new Error("Información de autenticación no encontrada");
  }

  try {
    const response = await fetch(callbackUrl, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error de autenticación:", errorData);
      throw new Error("Error en la autenticación");
    }
    
    const response2 = await response.json();
    return response2;
  } catch (error) {
    throw error;
  }
}

export async function sendTokenToBackend(token: string) {
  try {
    const response = await fetch(`${APIURL}/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ access_token: token }),
    });

    if (!response.ok) {
      throw new Error("Failed to register user");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getUserById(id: string) {
  try {    
    const response = await fetch(`${APIURL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get user information");
    }

    const userData = await response.json();
    return { data: userData };
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(id:string, data: any) {
  const formData = new FormData();

  // Si hay imagen seleccionada
  if (data.profileImage) {
    formData.append("profileImage", data.profileImage);
  }

  // Si vienen campos de texto
  if (data.name) formData.append("name", data.name);
  if (data.phone) formData.append("phone", data.phone);
  if (data.country) formData.append("country", data.country);
  if (data.address) formData.append("address", data.address);
  if (data.city) formData.append("city", data.city);

  try {
    const res = await fetch(`${APIURL}/users/${id}`, {
      method: "PATCH",
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error del servidor:", errorText);
      toast.error("Error al intentar editar perfil");
    }

    return await res.json();

  } catch (err) {
    toast.error("Error al intentar editar perfil: Intentelo más tarde");
    throw err;
  }
};