"use client"
import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import avatar from "@/src/assets/avatarHueso.png";
import { createConversation } from "@/src/services/messages.services";
import { toast } from "react-toastify";

const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function NewConversationPage() {
    const { userData } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!userData?.user?.id) {
            router.push('/auth/login?redirect=/messages/new');
            return;
        }

        loadUsers();
    }, [userData?.user?.id]);

    const loadUsers = async () => {
        try {
            // Obtener veterinarios y admins
            const [vetsRes, adminsRes] = await Promise.all([
                fetch(`${APIURL}/veterinarians`, { credentials: 'include' }),
                fetch(`${APIURL}/users`, { credentials: 'include' })
            ]);

            const vetsData = await vetsRes.json();
            const adminsData = await adminsRes.json();

            const veterinarians = (vetsData.data || vetsData || []).map((v: any) => ({
                ...v,
                role: 'veterinarian'
            }));

            const admins = (adminsData.data || adminsData || [])
                .filter((u: any) => u.role === 'admin' && u.id !== userData?.user?.id)
                .map((u: any) => ({
                    ...u,
                    role: 'admin'
                }));

            setUsers([...veterinarians, ...admins]);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            toast.error('Error al cargar contactos');
        } finally {
            setLoading(false);
        }
    };

    const handleStartConversation = async (userId: string) => {
        setCreating(true);
        try {
            const conversation = await createConversation(userId);
            toast.success('Conversación iniciada');
            router.push(`/messages/${conversation.id}`);
        } catch (error: any) {
            toast.error(error.message || 'Error al crear conversación');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-linear-to-br from-purple-50 to-violet-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando contactos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-linear-to-br from-purple-50 to-violet-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-purple-500 to-violet-500 p-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/messages')}
                                className="p-2 hover:bg-white/20 rounded-full transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Nueva conversación</h1>
                                <p className="text-white/90 mt-1">Selecciona con quién quieres chatear</p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de usuarios */}
                    <div className="divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-500">No hay contactos disponibles</p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => !creating && handleStartConversation(user.id)}
                                    className="p-4 hover:bg-purple-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={user.profileImageUrl || avatar}
                                            alt={user.name}
                                            width={60}
                                            height={60}
                                            className="rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                {user.role === 'veterinarian' && '👨‍⚕️'}
                                                {user.role === 'admin' && '🛡️'}
                                                {user.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {user.role === 'veterinarian' ? 'Veterinario' : 'Administrador'}
                                            </p>
                                            {user.description && (
                                                <p className="text-xs text-gray-400 mt-1">{user.description}</p>
                                            )}
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
