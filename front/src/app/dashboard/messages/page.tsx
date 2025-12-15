"use client"
import { useEffect, useState } from "react";
import { useMessages } from "@/src/context/MessagesContext";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import avatar from "@/src/assets/avatarHueso.png";

export default function VetMessagesPage() {
    const { conversations, loadConversations } = useMessages();
    const { userData } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('📬 VetMessagesPage montada');
        console.log('👤 userData:', userData?.user);
        console.log('🆔 userId:', userData?.user?.id);
        console.log('🎭 role:', userData?.user?.role);
        
        // Verificar que sea veterinario
        if (userData?.user?.role !== 'veterinarian') {
            console.log('❌ No es veterinario, redirigiendo');
            router.push('/dashboard');
            return;
        }
        
        if (userData?.user?.id) {
            console.log('✅ Veterinario encontrado, cargando conversaciones...');
            
            loadConversations()
                .then(() => {
                    console.log('✅ Conversaciones cargadas exitosamente');
                })
                .catch((err) => {
                    console.log('⚠️ Error al cargar conversaciones:', err);
                })
                .finally(() => {
                    console.log('✅ Carga completa');
                    setLoading(false);
                });
        } else {
            console.log('⏳ Esperando userData...');
            setLoading(false);
        }
    }, [userData?.user?.id, userData?.user?.role]);

    // Si no hay usuario después de cargar
    if (!userData?.user?.id) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                    <p className="text-gray-600">Debes iniciar sesión para ver tus mensajes</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando mensajes...</p>
                </div>
            </div>
        );
    }

    const getOtherParticipant = (conv: any) => {
        return conv.participants?.find((p: any) => p.id !== userData?.user?.id);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Mensajes Veterinario
                                </h1>
                                <p className="text-white/90 mt-2">Tus conversaciones con pacientes, veterinarios y administradores</p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/messages/new')}
                                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full font-semibold shadow-lg transition-all flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nueva conversación
                            </button>
                        </div>
                    </div>

                    {/* Lista de conversaciones */}
                    <div className="divide-y divide-gray-200">
                        {conversations.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-gray-500 text-lg">No tienes conversaciones aún</p>
                                <p className="text-gray-400 text-sm mt-2">Cuando inicies una conversación con un paciente o administrador aparecerá aquí</p>
                                <button
                                    onClick={() => router.push('/dashboard/messages/new')}
                                    className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all shadow-lg"
                                >
                                    Iniciar nueva conversación
                                </button>
                            </div>
                        ) : (
                            conversations.map((conversation) => {
                                const otherUser = getOtherParticipant(conversation);
                                const isUnread = conversation.unreadCount > 0;

                                return (
                                    <div
                                        key={conversation.id}
                                        onClick={() => router.push(`/dashboard/messages/${conversation.id}`)}
                                        className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${isUnread ? 'bg-cyan-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <Image
                                                    src={otherUser?.profileImageUrl || avatar}
                                                    alt={otherUser?.name || 'Usuario'}
                                                    width={56}
                                                    height={56}
                                                    className="rounded-full object-cover"
                                                />
                                                {isUnread && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-semibold text-gray-900 truncate ${isUnread ? 'text-blue-600' : ''}`}>
                                                        {otherUser?.role === 'veterinarian' && '👨‍⚕️ '}
                                                        {otherUser?.role === 'admin' && '🛡️ '}
                                                        {otherUser?.role === 'user' && '🐾 '}
                                                        {otherUser?.name || 'Usuario'}
                                                    </h3>
                                                    {conversation.lastMessageAt && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            {new Date(conversation.lastMessageAt).toLocaleDateString('es-ES', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-sm truncate ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                                    {conversation.lastMessage || 'Sin mensajes'}
                                                </p>
                                            </div>

                                            {/* Badge no leídos */}
                                            {isUnread && (
                                                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                </div>
                                            )}

                                            {/* Flecha */}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Botón volver */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 mx-auto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
