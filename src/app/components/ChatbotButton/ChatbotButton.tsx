"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mensajes rápidos predefinidos
const QUICK_MESSAGES = [
    { id: 1, icon: "📅", text: "¿Cómo agendar un turno?" },
    { id: 2, icon: "🕐", text: "Horarios de atención" },
    { id: 3, icon: "📦", text: "¿Hacen envíos?" },
    { id: 4, icon: "💳", text: "Formas de pago" },
    { id: 5, icon: "🚨", text: "Emergencias veterinarias" },
    { id: 6, icon: "💬", text: "Hablar con un veterinario" },
];

export default function ChatbotButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [showQuickMessages, setShowQuickMessages] = useState(true);
    const [botResponse, setBotResponse] = useState("");
    const router = useRouter();

    const handleQuickMessage = (message: typeof QUICK_MESSAGES[0]) => {
        setShowQuickMessages(false);

        // Respuestas según el mensaje seleccionado
        let response = "";
        switch (message.id) {
            case 1:
                response = "Para agendar un turno:\n\n1. Ingresá a tu panel de usuario\n2. Seleccioná 'Mis Mascotas'\n3. Elegí la mascota y hacé clic en 'Nuevo Turno'\n\n¿Necesitás ayuda personalizada?";
                break;
            case 2:
                response = "📅 Horarios de atención:\n\nLunes a Viernes: 9:00 - 20:00\nSábados: 9:00 - 14:00\nDomingos: Cerrado\n\n🚨 Emergencias 24hs: (011) 4567-8900";
                break;
            case 3:
                response = "¡Sí! Hacemos envíos a todo el país 📦\n\n• CABA y GBA: 24-48hs\n• Interior: 3-5 días hábiles\n• Envío gratis en compras +$15.000\n\nPodés calcular el costo ingresando tu código postal en el carrito.";
                break;
            case 4:
                response = "Aceptamos:\n\n💳 Tarjetas de crédito/débito\n💰 Efectivo\n🏦 Transferencia bancaria\n📱 Mercado Pago\n\nPagos en cuotas disponibles con tarjeta de crédito.";
                break;
            case 5:
                response = "🚨 EMERGENCIAS 24HS:\n\nTeléfono: (011) 4567-8900\nWhatsApp: +54 9 11 2345-6789\n\nDirección:\nAv. Veterinaria 1234, CABA\n\n⚠️ Si tu mascota tiene una urgencia, contactanos inmediatamente.";
                break;
            case 6:
                response = "¡Perfecto! Te conectamos con nuestro equipo.\n\nPodés chatear directamente con veterinarios y recibir atención personalizada.";
                setTimeout(() => {
                    setIsOpen(false);
                    router.push("/messages");
                }, 2000);
                break;
        }

        // Actualizar el estado con la respuesta
        setTimeout(() => {
            setBotResponse(response);
        }, 300);
    };

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110"
                    aria-label="Abrir chatbot"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                </button>
            )}

            {/* Modal del chatbot */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-blue-200">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Asistente Virtual</h3>
                                <p className="text-xs text-blue-100">En línea</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-blue-700 p-1 rounded-full transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {showQuickMessages ? (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 text-center mb-4">
                                    Seleccioná una pregunta frecuente:
                                </p>
                                {QUICK_MESSAGES.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => handleQuickMessage(msg)}
                                        className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50 rounded-xl shadow-sm transition-all hover:shadow-md border border-gray-100 hover:border-blue-200"
                                    >
                                        <span className="text-lg mr-2">{msg.icon}</span>
                                        <span className="text-sm text-gray-700">{msg.text}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                                    <p id="bot-response" className="text-sm text-gray-800 whitespace-pre-line">
                                        Cargando...
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowQuickMessages(true)}
                                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
                                >
                                    ← Volver a preguntas frecuentes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <p className="text-xs text-gray-400 text-center">
                            🤖 Asistente automático • Respuestas instantáneas
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
