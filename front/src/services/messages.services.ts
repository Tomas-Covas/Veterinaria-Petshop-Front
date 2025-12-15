const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Obtener todas las conversaciones del usuario
export const getConversations = async () => {
    try {
        const response = await fetch(`${APIURL}/chat/conversations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // Si es 404, el backend no tiene el endpoint todavía
            if (response.status === 404) {
                console.log('ℹ️ Endpoint de conversaciones no disponible aún');
                return [];
            }
            throw new Error('Error al obtener conversaciones');
        }

        return await response.json();
    } catch (error: any) {
        // Si es error de red (backend no está corriendo), retornar array vacío silenciosamente
        if (error.message.includes('fetch') || error.name === 'TypeError') {
            console.log('ℹ️ Backend no disponible - conversaciones vacías');
            return [];
        }
        console.error('Error en getConversations:', error);
        throw error;
    }
};

// Obtener mensajes de una conversación
export const getMessages = async (conversationId: string, page = 1, limit = 50) => {
    try {
        const response = await fetch(`${APIURL}/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Error al obtener mensajes');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error en getMessages:', error);
        throw error;
    }
};

// Enviar un mensaje
export const sendMessage = async (conversationId: string, content: string) => {
    try {
        const response = await fetch(`${APIURL}/chat/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error('Error al enviar mensaje');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error en sendMessage:', error);
        throw error;
    }
};

// Crear nueva conversación
export const createConversation = async (participantId: string) => {
    try {
        const response = await fetch(`${APIURL}/chat/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ participantId }),
        });

        if (!response.ok) {
            throw new Error('Error al crear conversación');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error en createConversation:', error);
        throw error;
    }
};

// Obtener cantidad de mensajes sin leer
export const getUnreadCount = async () => {
    try {
        const response = await fetch(`${APIURL}/chat/conversations/unread-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // Si es 404, el backend no tiene el endpoint todavía
            if (response.status === 404) {
                return { count: 0 };
            }
            throw new Error('Error al obtener mensajes sin leer');
        }

        return await response.json();
    } catch (error: any) {
        // Si es error de red (backend no está corriendo), retornar 0 silenciosamente
        if (error.message.includes('fetch') || error.name === 'TypeError') {
            return { count: 0 };
        }
        console.error('Error en getUnreadCount:', error);
        throw error;
    }
};

// Marcar conversación como leída
export const markAsRead = async (conversationId: string) => {
    try {
        const response = await fetch(`${APIURL}/chat/conversations/${conversationId}/read`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Error al marcar conversación como leída');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error en markAsRead:', error);
        throw error;
    }
};
