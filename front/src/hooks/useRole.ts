"use client";

import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type UserRole = "admin" | "veterinarian" | "user";

export const useRole = () => {
  const { userData } = useAuth();

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!userData?.user?.role) return false;

    const userRole = (userData.user.role  || '').toLowerCase() as UserRole;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  };

  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  const isVeterinarian = (): boolean => {
    return hasRole("veterinarian");
  };

  const canManageVeterinarians = (): boolean => {
    return hasRole("admin");
  };

  const canManageUsers = (): boolean => {
    return hasRole("admin");
  };

  return {
    userRole: userData?.user?.role as UserRole | undefined,
    hasRole,
    isAdmin,
    isVeterinarian,
    canManageVeterinarians,
    canManageUsers,
  };
};

// Hook para proteger rutas
export const useRequireRole = (requiredRole: UserRole | UserRole[]) => {
  const { userData, isLoading } = useAuth();
  const { hasRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !userData) {
      router.push("/auth/login");
    } else if (!isLoading && userData && !hasRole(requiredRole)) {
      router.push("/");
    }
  }, [isLoading, userData, hasRole, requiredRole, router]);

  return { isLoading, hasAccess: hasRole(requiredRole) };
};
