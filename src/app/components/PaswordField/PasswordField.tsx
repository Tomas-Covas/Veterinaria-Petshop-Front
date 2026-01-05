"use client";
import { useState } from "react";
import { useField } from "formik";

export default function PasswordFieldFormik({ label, nameField, type, placeholder }:
    { label: string, nameField: string, type: string, placeholder: string }) {
    const [field, meta] = useField(nameField);
    const [showRules, setShowRules] = useState(false);

    const password = field.value || "";

    const rules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };

    return (
        <div className="flex flex-col items-center text-black">
            <div className="relative w-full">
                <label className="font-bold mr-3 ml-2 flex mt-2 w-fit
                 bg-white rounded-2xl p-1 backdrop-blur-sm">{label}</label>
                <input
                    {...field}
                    type={type}
                    placeholder={placeholder}
                    className={`border-2 border-black p-2 bg-white rounded-2xl w-full
        focus:ring-2 focus:ring-orange-400 focus:border-orange-400
        ${meta.error && meta.touched ? "border-red-500" : ""}`}
                    onFocus={() => setShowRules(true)}
                    onBlur={() => setShowRules(false)}
                />

                {/* Cartel flotante */}
                {showRules && (
                    <div
                        className="absolute mt-2 w-full
                        bottom-full h-fit
                        lg:top-0 lg:right-full lg:bottom-0 lg:mr-2 lg:mt-0 
                        p-4 border rounded-xl bg-white shadow-lg z-50 text-sm"
                    >
                        <p className="mb-2 text-gray-700">La contraseña debe contener como mínimo:</p>
                        <ul className="grid grid-cols-2 gap-1 lg:text-[12px]">
                            <Rule ok={rules.length} text="8 caracteres" />
                            <Rule ok={rules.uppercase} text="1 mayúscula" />
                            <Rule ok={rules.lowercase} text="1 minúscula" />
                            <Rule ok={rules.number} text="1 número" />
                            <Rule ok={rules.symbol} text="1 carácter especial" />
                        </ul>
                    </div>
                )}
            </div>

            {meta.touched && meta.error && (
                <span className="text-red-500 text-xs mt-1">{meta.error}</span>
            )}
        </div>

    );
}

function Rule({ ok, text }: { ok: boolean, text: string }) {
    return (
        <li
            className={`flex items-center gap-2 ${ok ? "text-orange-500" : "text-gray-600"
                }`}
        >
            <span
                className={`w-2 h-2 rounded-full border ${ok ? "bg-orange-600 border-orange-500" : "border-gray-500"
                    }`}
            ></span>
            {text}
        </li>
    );
}
