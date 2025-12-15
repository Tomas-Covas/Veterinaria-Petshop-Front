"use client"
import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { createConversation } from "@/src/services/messages.services";
import Image from "next/image";
import avatar from "@/src/assets/avatarHueso.png";

export default function NewVetConversationPage() {
    const { userData } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!userData?.user?.id || userData?.user?.role !== 'veterinarian') {
            router.push('/dashboard');
            return;
        }

        loadUsers();
    }, [userData?.user?.id]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            
            console.log('🔄 Cargando usuarios para mensajería...');
            
            let regularUsers: any[] = [];
            let vets: any[] = [];
            
            // Cargar usuarios regulares (clientes y admins)
            try {
                const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users`, {
                    credentials: 'include',
                });
                
                console.log('🔍 Respuesta /users - Status:', usersResponse.status, usersResponse.ok);
                
                if (usersResponse.ok) {
                    const rawText = await usersResponse.text();
                    console.log('📦 Body /users (raw):', rawText.substring(0, 500));
                    
                    const usersData = JSON.parse(rawText);
                    console.log('🔎 Tipo de datos:', Array.isArray(usersData) ? 'Array' : typeof usersData);
                    console.log('🔎 Estructura:', usersData);
                    
                    // Manejar diferentes formatos de respuesta
                    if (Array.isArray(usersData)) {
                        regularUsers = usersData;
                    } else if (usersData.data && Array.isArray(usersData.data)) {
                        regularUsers = usersData.data;
                    } else if (usersData.users && Array.isArray(usersData.users)) {
                        regularUsers = usersData.users;
                    }
                    
                    console.log('👥 Usuarios del endpoint /users:', regularUsers.length);
                    console.log('📊 Roles encontrados:', regularUsers.map((u: any) => u.role));
                    console.log('🛡️ Admins:', regularUsers.filter((u: any) => u.role === 'admin').length);
                    console.log('🐾 Clientes:', regularUsers.filter((u: any) => u.role === 'user').length);
                } else {
                    console.log('❌ Error en /users:', usersResponse.status, usersResponse.statusText);
                }
            } catch (err) {
                console.log('⚠️ No se pudieron cargar usuarios regulares:', err);
            }
            
            // Cargar veterinarios
            try {
                const vetsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/veterinarians`, {
                    credentials: 'include',
                });
                
                if (vetsResponse.ok) {
                    const vetsData = await vetsResponse.json();
                    // Puede venir como { data: [...] } o directamente [...]
                    if (Array.isArray(vetsData)) {
                        vets = vetsData;
                    } else if (vetsData.data && Array.isArray(vetsData.data)) {
                        vets = vetsData.data;
                    }
                    console.log('👨‍⚕️ Veterinarios:', vets.length);
                }
            } catch (err) {
                console.log('⚠️ No se pudieron cargar veterinarios');
            }

            // Combinar todos los usuarios
            const allUsers = [...regularUsers, ...vets];
            console.log('✅ Total usuarios combinados:', allUsers.length);

            // Filtrar: no incluir al usuario actual
            const filtered = allUsers.filter((u: any) => {
                // Excluir al usuario actual
                return u.id !== userData?.user?.id;
            });
            
            console.log('📋 Usuarios filtrados (sin actual):', filtered.length);
            console.log('🔍 Usuarios disponibles:', filtered.map((u: any) => ({ id: u.id, name: u.name, role: u.role })));
            
            setUsers(filtered);
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConversation = async (recipientId: string) => {
        try {
            setCreating(true);
            const conversation = await createConversation(recipientId);
            router.push(`/dashboard/messages/${conversation.id}`);
        } catch (error: any) {
            console.error('Error al crear conversación:', error);
            alert(error.message || 'Error al crear la conversación');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/dashboard/messages')}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Nueva Conversación</h1>
                                <p className="text-white/90 text-sm mt-1">Selecciona un usuario para comenzar a chatear</p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de usuarios */}
                    <div className="max-h-[600px] overflow-y-auto">
                        {users.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p>No hay usuarios disponibles</p>
                            </div>
                        ) : (
                            <>
                                {/* Administradores */}
                                {users.filter(u => u.role === 'admin').length > 0 && (
                                    <div>
                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 sticky top-0 z-10">
                                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                                <span>🛡️</span>
                                                Administradores
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {users.filter(u => u.role === 'admin').map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => !creating && handleCreateConversation(user.id)}
                                                    className="p-4 hover:bg-red-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Image
                                                            src={user.profileImageUrl || avatar}
                                                            alt={user.name || 'Usuario'}
                                                            width={56}
                                                            height={56}
                                                            className="rounded-full object-cover"
                                                        />
                                                        
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900">
                                                                🛡️ {user.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                            <p className="text-xs text-red-600 font-medium mt-1">Administrador</p>
                                                        </div>

                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Colegas Veterinarios */}
                                {users.filter(u => u.role === 'veterinarian').length > 0 && (
                                    <div>
                                        <div className="bg-gradient-to-r from-green-500 to-teal-500 px-4 py-2 sticky top-0 z-10">
                                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                                <span>👨‍⚕️</span>
                                                Colegas Veterinarios
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {users.filter(u => u.role === 'veterinarian').map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => !creating && handleCreateConversation(user.id)}
                                                    className="p-4 hover:bg-green-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Image
                                                            src={user.profileImageUrl || avatar}
                                                            alt={user.name || 'Usuario'}
                                                            width={56}
                                                            height={56}
                                                            className="rounded-full object-cover"
                                                        />
                                                        
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900">
                                                                👨‍⚕️ {user.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                            <p className="text-xs text-green-600 font-medium mt-1">
                                                                {user.matricula ? `Mat. ${user.matricula}` : 'Veterinario'}
                                                            </p>
                                                        </div>

                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Clientes */}
                                {users.filter(u => u.role === 'user').length > 0 && (
                                    <div>
                                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 sticky top-0 z-10">
                                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                                <span>🐾</span>
                                                Clientes
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {users.filter(u => u.role === 'user').map((user) => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => !creating && handleCreateConversation(user.id)}
                                                    className="p-4 hover:bg-orange-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Image
                                                            src={user.profileImageUrl || avatar}
                                                            alt={user.name || 'Usuario'}
                                                            width={56}
                                                            height={56}
                                                            className="rounded-full object-cover"
                                                        />
                                                        
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900">
                                                                🐾 {user.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">{user.email}</p>
                                                            <p className="text-xs text-orange-600 font-medium mt-1">Cliente</p>
                                                        </div>

                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
