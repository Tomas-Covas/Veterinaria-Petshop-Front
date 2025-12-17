"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { getConversations, getUnreadCount } from "../services/messages.services";
import { useAuth } from "./AuthContext";

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface Conversation {
    id: string;
    participants: any[];
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
}

interface MessagesContextProps {
    conversations: Conversation[];
    unreadCount: number;
    loadConversations: () => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextProps>({
    conversations: [],
    unreadCount: 0,
    loadConversations: async () => {},
    refreshUnreadCount: async () => {},
});

interface MessagesProviderProps {
    children: React.ReactNode;
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({ children }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { userData } = useAuth();

    const loadConversations = async () => {
        if (!userData?.user?.id) return;
        
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            // No mostrar error al usuario, solo dejarlo en consola
            setConversations([]);
        }
    };

    const refreshUnreadCount = async () => {
        if (!userData?.user?.id) return;
        
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error('Error al obtener mensajes sin leer:', error);
            // No mostrar error al usuario, solo dejarlo en consola
            setUnreadCount(0);
        }
    };

    // Cargar conversaciones y contador al montar
    useEffect(() => {
        if (userData?.user?.id) {
            // Intentar cargar pero no bloquear si falla
            loadConversations().catch(() => {});
            refreshUnreadCount().catch(() => {});
            
            // Actualizar cada 30 segundos (polling básico)
            const interval = setInterval(() => {
                refreshUnreadCount().catch(() => {});
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [userData?.user?.id]);

    return (
        <MessagesContext.Provider value={{
            conversations,
            unreadCount,
            loadConversations,
            refreshUnreadCount
        }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => useContext(MessagesContext);
