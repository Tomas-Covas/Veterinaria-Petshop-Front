import { IProduct } from "@/src/types";

const APIURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Actualizar precio de producto (solo admin)
export const updateProductPrice = async (
    id: string | number,
    price: number,
    token: string
): Promise<IProduct> => {
    try {
        const res = await fetch(`${APIURL}/products/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ price }),
        });

        if (!res.ok) {
            throw new Error(`Error al actualizar precio: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error('updateProductPrice error:', error);
        throw error;
    }
};

// Actualizar producto completo (solo admin)
export const updateProduct = async (
    id: string | number,
    data: Partial<IProduct>,
    token: string
): Promise<IProduct> => {
    try {
        const res = await fetch(`${APIURL}/products/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error(`Error al actualizar producto: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error('updateProduct error:', error);
        throw error;
    }
};
