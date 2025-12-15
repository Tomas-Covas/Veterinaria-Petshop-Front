"use client"
import { useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { getMessages, sendMessage, markAsRead } from "@/src/services/messages.services";
import Image from "next/image";
import avatar from "@/src/assets/avatarHueso.png";

const QUICK_MESSAGES = {
    veterinarian: [
        "Buenos días, ¿cómo está su mascota?",
        "Recuerde traer los análisis previos a la consulta",
        "La medicación debe administrarse cada 8 horas",
        "Es importante que su mascota esté en ayunas para el procedimiento",
        "Por favor confirme su asistencia al turno"
    ]
};

export default function VetConversationPage() {
    const { userData } = useAuth();
    const router = useRouter();
    const params = useParams();
    const conversationId = params?.conversationId as string;
    
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [showQuickMessages, setShowQuickMessages] = useState(false);

    const quickMessages = QUICK_MESSAGES.veterinarian;

    useEffect(() => {
        if (!userData?.user?.id || userData?.user?.role !== 'veterinarian') {
            router.push('/dashboard');
            return;
        }

        if (!conversationId) {
            router.push('/dashboard/messages');
            return;
        }

        loadMessages();
        
        // Polling cada 5 segundos
        const interval = setInterval(() => {
            loadMessages(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [conversationId, userData?.user?.id]);

    const loadMessages = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            
            const data = await getMessages(conversationId);
            setMessages(data.messages || []);
            
            // Obtener el otro participante
            if (data.conversation?.participants) {
                const other = data.conversation.participants.find(
                    (p: any) => p.id !== userData?.user?.id
                );
                setOtherUser(other);
            }

            // Marcar como leídos
            await markAsRead(conversationId);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        try {
            setSending(true);
            await sendMessage(conversationId, newMessage);
            setNewMessage("");
            await loadMessages(true);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error al enviar el mensaje');
        } finally {
            setSending(false);
        }
    };

    const handleQuickMessage = (msg: string) => {
        setNewMessage(msg);
        setShowQuickMessages(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando conversación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-6 bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 flex items-center gap-3">
                        <button
                            onClick={() => router.push('/dashboard/messages')}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        
                        <Image
                            src={otherUser?.profileImageUrl || avatar}
                            alt={otherUser?.name || 'Usuario'}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                        />
                        
                        <div className="flex-1">
                            <h2 className="text-white font-bold text-lg">
                                {otherUser?.role === 'veterinarian' && '👨‍⚕️ '}
                                {otherUser?.role === 'admin' && '🛡️ '}
                                {otherUser?.role === 'user' && '🐾 '}
                                {otherUser?.name || 'Usuario'}
                            </h2>
                            <p className="text-white/80 text-sm">
                                {otherUser?.role === 'veterinarian' && 'Veterinario'}
                                {otherUser?.role === 'admin' && 'Administrador'}
                                {otherUser?.role === 'user' && 'Cliente'}
                            </p>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <p>No hay mensajes aún</p>
                                <p className="text-sm mt-2">Envía el primer mensaje para comenzar la conversación</p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isMine = message.senderId === userData?.user?.id;
                                return (
                                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 ${
                                            isMine 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-100 text-gray-900'
                                        }`}>
                                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                            <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                                                {new Date(message.createdAt).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t p-4 bg-gray-50">
                        {/* Mensajes rápidos */}
                        {showQuickMessages && (
                            <div className="mb-3 bg-white rounded-lg shadow-md p-3 space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-gray-700">Mensajes rápidos:</p>
                                    <button
                                        onClick={() => setShowQuickMessages(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {quickMessages.map((msg, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickMessage(msg)}
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        {msg}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowQuickMessages(!showQuickMessages)}
                                className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Mensajes rápidos"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </button>

                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={sending}
                            />

                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim() || sending}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold"
                            >
                                {sending ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
