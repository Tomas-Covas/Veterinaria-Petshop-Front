"use client"
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { IProduct } from "../types";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import { addToCartBackend, removeFromCartBackend, clearCartBackend, getCart, updateCartQuantity } from "../services/order.services";

// Map global para rastrear operaciones en progreso (fuera del componente)
const addToCartInProgress = new Map<string, Promise<void>>();

interface CartContextProps {
    cartItems: IProduct[];
    addToCart: (product: IProduct) => Promise<void>;
    removeFromCart: (productId: number | string) => Promise<void>;
    updateQuantity: (productId: number | string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getTotal: () => number;
    getIdItems: () => (number | string)[];
    getItemsCount: () => number;
    loadCartFromBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextProps>({
    cartItems: [],
    addToCart: async () => { },
    removeFromCart: async () => { },
    updateQuantity: async () => { },
    clearCart: async () => { },
    getTotal: () => 0,
    getIdItems: () => [],
    getItemsCount: () => 0,
    loadCartFromBackend: async () => { },
});

interface CartProvider {
    children: React.ReactElement;
};

export const CartProvider: React.FC<CartProvider> = ({ children }) => {
    const [cartItems, setCartItems] = useState<IProduct[]>([]);
    const { userData } = useAuth();

    // Cargar carrito desde el backend cuando el usuario inicia sesión
    useEffect(() => {
        if (userData?.user?.id && userData?.token) {
            loadCartFromBackend();
        }
    }, [userData?.user?.id]);

    // Guardar en localStorage solo como backup
    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cartItems));
        }
    }, [cartItems]);

    // Cargar desde localStorage solo si no hay usuario autenticado
    useEffect(() => {
        if (!userData?.user?.id && typeof window !== 'undefined' && window.localStorage) {
            const dataFromLocalStorage = localStorage.getItem('cart');
            if (dataFromLocalStorage) {
                setCartItems(JSON.parse(dataFromLocalStorage));
            }
        }
    }, [userData?.user?.id]);

    const loadCartFromBackend = async () => {
        if (!userData?.user?.id) return;

        try {
            const cartData = await getCart(String(userData.user.id));
            // Backend retorna: { id, buyer, items: [{product, quantity, unitPrice}], total, status, expiresAt }
            // O null si no hay carrito activo o si expiró
            if (cartData === null) {
                // Carrito vencido o no existe
                setCartItems([]);
                localStorage.removeItem('cart');
                return;
            }

            if (cartData && cartData.items) {
                // Transformar items del backend al formato del frontend
                const transformedItems = cartData.items.map((item: any) => ({
                    ...item.product,
                    quantity: item.quantity
                }));
                setCartItems(transformedItems);
            } else {
                setCartItems([]);
            }
        } catch (error: any) {
            console.error('Error al cargar el carrito desde el backend:', error);
            
            // Si el error indica carrito vencido, limpiar
            if (error.message && error.message.includes('expirado')) {
                setCartItems([]);
                localStorage.removeItem('cart');
                return;
            }

            // Fallback a localStorage solo si no es error de expiración
            const dataFromLocalStorage = localStorage.getItem('cart');
            if (dataFromLocalStorage) {
                setCartItems(JSON.parse(dataFromLocalStorage));
            }
        }
    };

    const addToCart = async (product: IProduct) => {
        // Verificar si ya hay una operación en progreso para este producto
        const existingPromise = addToCartInProgress.get(String(product.id));
        if (existingPromise) {
            console.log('⏸️ Ya se está agregando este producto, esperando a que termine...');
            return existingPromise; // Retornar la misma promesa en vez de crear otra
        }
        
        // Crear la promesa y guardarla en el Map
        const addPromise = (async () => {
            try {
                // Si hay usuario autenticado, sincronizar con el backend
                if (userData?.user?.id) {
                    // PRIMERO verificar si ya está en el carrito del backend
                    const backendCart = await getCart(String(userData.user.id));
                    const existsInBackend = backendCart?.items?.some((item: any) => item.product.id === product.id);
                    
                    if (existsInBackend) {
                        console.log('⚠️ Producto ya existe en el carrito del backend');
                        toast.error("El producto ya está en el carrito");
                        return;
                    }
                    
                    await addToCartBackend(
                        String(userData.user.id),
                        product.id,
                        1, // Cantidad por defecto
                        userData.token || ''
                    );
                    // Recargar el carrito desde el backend después de agregar
                    await loadCartFromBackend();
                    toast.success("El producto se agregó al carrito");
                } else {
                    // Si no hay usuario, verificar localStorage
                    const existingProduct = cartItems.some(item => item.id === product.id);
                    if (existingProduct) {
                        toast.error("El producto ya está en el carrito");
                        return;
                    }
                    
                    // Solo guardar en localStorage
                    setCartItems((prevItems) => [...prevItems, product]);
                    toast.success("El producto se agregó al carrito");
                }
            } catch (error: any) {
                console.error('Error al agregar al carrito:', error);
                // Si el error es porque ya está en el carrito, no mostrar error
                const errorMsg = error?.response?.data?.message || error?.message || '';
                if (!errorMsg.toLowerCase().includes('already') && !errorMsg.toLowerCase().includes('ya está')) {
                    toast.error("No se pudo agregar el producto al carrito");
                }
            } finally {
                // Quitar del Map después de completar
                setTimeout(() => {
                    addToCartInProgress.delete(String(product.id));
                }, 2000);
            }
        })();
        
        addToCartInProgress.set(String(product.id), addPromise);
        return addPromise;
    };

    const removeFromCart = async (productId: number | string) => {
        // Si hay usuario autenticado, sincronizar con el backend
        if (userData?.user?.id) {
            try {
                await removeFromCartBackend(
                    String(userData.user.id),
                    productId,
                    userData.token || ''
                );
                // Recargar el carrito desde el backend después de eliminar
                await loadCartFromBackend();
            } catch (error) {
                console.error('Error al eliminar del carrito:', error);
                toast.error("No se pudo eliminar el producto del carrito");
            }
        } else {
            // Si no hay usuario, solo actualizar el estado local
            setCartItems((prevItems) => prevItems.filter(item => item.id.toString() !== productId.toString()));
        }
    };

    const updateQuantity = async (productId: number | string, quantity: number) => {
        // Si hay usuario autenticado, sincronizar con el backend
        if (userData?.user?.id) {
            try {
                await updateCartQuantity(
                    String(userData.user.id),
                    productId,
                    quantity,
                    userData.token || ''
                );
                // Recargar el carrito desde el backend después de actualizar
                await loadCartFromBackend();
            } catch (error) {
                console.error('Error al actualizar cantidad:', error);
                alert("Error al actualizar la cantidad del producto");
            }
        } else {
            // Si no hay usuario, actualizar solo el estado local
            setCartItems((prevItems) => 
                prevItems.map(item => 
                    item.id.toString() === productId.toString() 
                        ? { ...item, quantity: quantity }
                        : item
                )
            );
        }
    };

    const clearCart = async () => {
        // Si hay usuario autenticado, sincronizar con el backend
        if (userData?.user?.id) {
            try {
                await clearCartBackend(String(userData.user.id), userData.token || '');
                setCartItems([]);
            } catch (error) {
                console.error('Error al vaciar el carrito:', error);
                toast.error("Error al vaciar el carrito");
            }
        } else {
            // Si no hay usuario, solo limpiar el estado local
            setCartItems([]);
        }
        
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('cart');
        }
    };
    
    const getTotal = (): number => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.price);
            const quantity = Number(item.quantity) || 1;
            
            if (isNaN(price)) {
                console.warn(`Producto ${item.name} (id: ${item.id}) tiene precio inválido:`, item.price);
                return total;
            }
            
            return total + (price * quantity);
        }, 0);
    };

    const getIdItems = () => {
        return cartItems.map(item => item.id);
    };
    
    const getItemsCount = () => {
        return cartItems.length;
    };

    return (
        <CartContext.Provider value={{
            cartItems, 
            addToCart, 
            removeFromCart,
            updateQuantity,
            clearCart, 
            getTotal, 
            getIdItems, 
            getItemsCount, 
            loadCartFromBackend 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);