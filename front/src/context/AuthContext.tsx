'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { IUserSession } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL

export interface IAuthContextProps {
    userData: IUserSession | null,
    setUserData: (userData: IUserSession | null) => void
    logout: () => void
    isLoading: boolean
    activeTab: 'profile' | 'pets' | 'orders',
    setActiveTab: (tab: 'profile' | 'pets' | 'orders') => void
}

export const AuthContext = createContext<IAuthContextProps>({
    userData: null,
    setUserData: () => { },
    logout: () => { },
    isLoading: true,
    activeTab: 'profile',
    setActiveTab: () => { }
});

interface AuthProviderProps {
    children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [userData, setUserData] = useState<IUserSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTabState] = useState<'profile' | 'pets' | 'orders'>('profile')

    useEffect(() => {
        const savedTab = localStorage.getItem("activeTab") as 'profile' | 'pets' | 'orders' | null;
        if (savedTab) {
            setActiveTab(savedTab);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("activeTab", activeTab);
    }, [activeTab]);

    const setActiveTab = (tab: 'profile' | 'pets' | 'orders') => {
        setActiveTabState(tab);
    };

    useEffect(() => {
        const checkSession = async () => {

            try {
                const token = localStorage.getItem('authToken') || '';

                const headers: HeadersInit = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                    console.log('🔑 Enviando token en Authorization header');
                }

                const res = await fetch(`${API}/auth/me`, {
                    credentials: "include",
                    headers: headers
                });

                if (!res.ok) {
                    console.log('❌ No hay sesión activa desde API (status:', res.status, ')');

                    // ⚠️ WORKAROUND TEMPORAL: Si hay token en localStorage, intentar mantener una sesión básica
                    const storedToken = localStorage.getItem('authToken');
                    const storedUser = localStorage.getItem('userData');

                    if (storedToken && storedUser) {
                        console.warn('⚠️ Token expirado pero recuperando sesión desde localStorage');
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            setUserData({
                                user: parsedUser,
                                token: storedToken
                            });
                            console.log('✅ Sesión recuperada desde localStorage');
                            return;
                        } catch (e) {
                            console.error('Error al parsear userData desde localStorage');
                        }
                    }

                    setUserData(null);
                    // localStorage.removeItem('authToken'); // Comentado para debugging
                    console.warn('⚠️ El backend debe extender la expiración del token JWT.');
                    return;
                }

                const user = await res.json();

                const formattedUser: IUserSession = {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || null,
                        address: user.address || null,
                        role: user.role,
                        uid: user,
                        user: user.user,
                        country: user.country,
                        city: user.city,
                        isDeleted: user.isDeleted,
                        deletedAt: user.deletedAt,
                        pets: user.pets,
                        buyerSaleOrders: user.buyerSaleOrders,
                        profileImageUrl: user.profileImageUrl
                    },
                    token: token
                };

                // Guardar datos del usuario en localStorage para recuperación
                localStorage.setItem('userData', JSON.stringify(formattedUser.user));

                setUserData(formattedUser);
            } catch (err) {
                setUserData(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    // Log para debug cuando userData cambia
    useEffect(() => {
        console.log("🔄 userData cambió a:", userData);
    }, [userData]);

    const logout = async () => {
        try {
            await fetch(`${API}/auth/signout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
        } finally {
            localStorage.removeItem('authToken');
            setUserData(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('requirePasswordChange');
            localStorage.clear();

            document.cookie = "role=; path=/; max-age=0";
            document.cookie = "requirePasswordChange=; path=/; max-age=0";
            window.location.href = "/"
        }
    };

    return (
        <AuthContext.Provider value={{ userData, setUserData, logout, isLoading, activeTab, setActiveTab }}>
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando sesión...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}