"use client"
import { createContext, useContext, useEffect, useState } from "react";

interface ShippingData {
    postalCode: string;
    address?: string;
    city?: string;
    province?: string;
    additionalInfo?: string;
}

interface ShippingContextProps {
    shippingData: ShippingData;
    setShippingData: (data: ShippingData) => void;
    updatePostalCode: (postalCode: string) => void;
    clearShippingData: () => void;
}

const ShippingContext = createContext<ShippingContextProps>({
    shippingData: { postalCode: "" },
    setShippingData: () => {},
    updatePostalCode: () => {},
    clearShippingData: () => {},
});

interface ShippingProviderProps {
    children: React.ReactNode;
}

export const ShippingProvider: React.FC<ShippingProviderProps> = ({ children }) => {
    const [shippingData, setShippingDataState] = useState<ShippingData>({
        postalCode: "",
        address: "",
        city: "",
        province: "",
        additionalInfo: ""
    });

    // Cargar datos de envío desde localStorage al montar
    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedData = localStorage.getItem('shippingData');
            if (savedData) {
                try {
                    setShippingDataState(JSON.parse(savedData));
                } catch (error) {
                    console.error('Error al cargar datos de envío:', error);
                }
            }
        }
    }, []);

    // Guardar en localStorage cuando cambian los datos
    const setShippingData = (data: ShippingData) => {
        setShippingDataState(data);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('shippingData', JSON.stringify(data));
        }
    };

    // Actualizar solo el código postal
    const updatePostalCode = (postalCode: string) => {
        const newData = { ...shippingData, postalCode };
        setShippingData(newData);
    };

    // Limpiar datos de envío
    const clearShippingData = () => {
        const emptyData: ShippingData = {
            postalCode: "",
            address: "",
            city: "",
            province: "",
            additionalInfo: ""
        };
        setShippingDataState(emptyData);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('shippingData');
        }
    };

    return (
        <ShippingContext.Provider value={{
            shippingData,
            setShippingData,
            updatePostalCode,
            clearShippingData
        }}>
            {children}
        </ShippingContext.Provider>
    );
};

export const useShipping = () => useContext(ShippingContext);
