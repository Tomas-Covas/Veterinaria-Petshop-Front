'use client';

import React, { useEffect, useState } from 'react'
import ClientDashboard from './ClientDashboard/ClientDashboard'
import VetDashboard from './VetDashboard/VetDashboard'
import AdminDashboard from './AdminDashboard/AdminDashboard'
import { useRole } from '@/src/hooks/useRole'
import { useAuth } from '@/src/context/AuthContext'
import { getVeterinarianById } from '@/src/services/veterinarian.admin.services'
import { toast } from 'sonner'

function Page() {
    const { isAdmin, isVeterinarian } = useRole();
    const { userData } = useAuth();
    const [veterinarianData, setVeterinarianData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshOrders, setRefreshOrders] = useState(0); // Para forzar recarga de órdenes
    
    // Detectar parámetros de pago de MercadoPago
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const payment = urlParams.get('payment');
        
        if (payment === 'success') {
            toast.success('¡Pago realizado exitosamente!', {
                description: 'Tu orden ha sido procesada correctamente',
                duration: 5000
            });
            // Limpiar el parámetro de la URL
            window.history.replaceState({}, '', '/dashboard');
            // Forzar recarga de órdenes
            setRefreshOrders(prev => prev + 1);
        } else if (payment === 'pending') {
            toast.info('Tu pago está siendo procesado', {
                description: 'Te notificaremos cuando se confirme',
                duration: 5000
            });
            window.history.replaceState({}, '', '/dashboard');
            // Forzar recarga de órdenes
            setRefreshOrders(prev => prev + 1);
        } else if (payment === 'failure') {
            toast.error('El pago no pudo ser procesado', {
                description: 'Por favor, intenta nuevamente',
                duration: 5000
            });
            window.history.replaceState({}, '', '/dashboard');
        }
    }, []);
    
    useEffect(() => {
        const fetchVeterinarianData = async () => {
            if (isVeterinarian() && userData?.user?.id) {
                try {
                    const token = localStorage.getItem('authToken') || '';
                    const response = await getVeterinarianById(userData.user.id, token);
                    console.log('📋 Datos del veterinario desde backend:', response);
                    setVeterinarianData(response);
                } catch (error) {
                    console.error('Error al obtener datos del veterinario:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchVeterinarianData();
    }, [userData?.user?.id]); // Solo depende del ID del usuario
    
    // Renderizar según el rol del usuario
    if (isAdmin()) {
        return <AdminDashboard />
    }
    
    if (isVeterinarian()) {
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando perfil...</p>
                    </div>
                </div>
            );
        }

        const formattedVeterinarian = {
            name: veterinarianData?.data?.name || veterinarianData?.name || userData?.user?.name || 'Veterinario',
            email: veterinarianData?.data?.email || veterinarianData?.email || userData?.user?.email || '',
            phone: veterinarianData?.data?.phone || veterinarianData?.phone || '',
            specialty: veterinarianData?.data?.specialty || veterinarianData?.specialty || 'No especificada',
            license: veterinarianData?.data?.matricula || veterinarianData?.matricula || 'N/A',
            address: veterinarianData?.data?.address || veterinarianData?.address || 'No especificada'
        };

        return <VetDashboard veterinarian={formattedVeterinarian} />
    }
    
    if (isAdmin()) return <AdminDashboard />
    
    return <ClientDashboard refreshOrders={refreshOrders} />
}

export default Page
