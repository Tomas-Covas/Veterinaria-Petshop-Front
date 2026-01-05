"use client"
import { useState } from "react";
import { useMessages } from "@/src/context/MessagesContext";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function MessagesButton() {
    const { unreadCount } = useMessages();
    const { userData } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    if (!userData?.user?.id) return null;

    return (
        <>
            <button
                onClick={() => router.push('/messages')}
                className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors"
                aria-label="Mensajes"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        </>
    );
}
