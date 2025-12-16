import { IProduct, ICategoryBasic } from "@/src/types";
import alimento from "../../assets/alimento.jpg";
import juguete from "../../assets/juguete.jpg"
import shampoo from "../../assets/shampoo.jpg"
import collar from "../../assets/collar.jpg"
import cucha from "../../assets/cucha.jpg"
import trasladador from "../../assets/trasladador.jpg"
import { toast } from "react-toastify";
const APIURL = process.env.NEXT_PUBLIC_API_URL;

// Mapeo de imágenes por categoría para productos sin imagen
const getCategoryImage = (categoryId: number | string | undefined, name: string | null) => {
    // Intentar determinar la categoría por el nombre si no hay categoryId
    const productName = (name || '').toLowerCase();
    
    if (productName.includes('alimento') || productName.includes('balanceado') || 
        productName.includes('comida') || productName.includes('chow') || 
        productName.includes('whiskas') || productName.includes('pedigree') || 
        productName.includes('royal canin')) {
        return alimento;
    }
    if (productName.includes('collar') || productName.includes('arnés') || productName.includes('correa')) {
        return collar;
    }
    if (productName.includes('juguete') || productName.includes('pelota') || 
        productName.includes('hueso') || productName.includes('cuerda') || 
        productName.includes('peluche') || productName.includes('ratón')) {
        return juguete;
    }
    if (productName.includes('cama') || productName.includes('cucha') || productName.includes('rascador')) {
        return cucha;
    }
    if (productName.includes('shampoo') || productName.includes('acondicionador') || 
        productName.includes('limpiador') || productName.includes('toallitas') || 
        productName.includes('cepillo')) {
        return shampoo;
    }
    if (productName.includes('transportadora') || productName.includes('trasladador')) {
        return trasladador;
    }
    
    // Por categoryId si está disponible
    switch (categoryId) {
        case 1: return alimento;
        case 2: return collar;
        case 3: return juguete;
        case 4: return cucha;
        case 5: return shampoo;
        case 6: return trasladador;
        default: return alimento; // Default genérico
    }
};

export const getAllProducts = async (): Promise<IProduct[]> => {

    try {
        const res = await fetch(`${APIURL}/products`, { 
            method: 'GET',
            cache: 'no-store'
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`getAllProducts: fetch failed ${res.status} ${res.statusText} — ${text.substring(0,200)}`);
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error(`getAllProducts: expected JSON but got ${contentType} — ${text.substring(0,200)}`);
        }

        const result = await res.json();
        console.log('Respuesta del backend:', result)
        
        // El backend puede devolver {data: [...]} o directamente [...]
        let products = result.data || result;
        
        // Mapear las propiedades del backend al formato que espera el frontend
        products = products.map((product: any) => {
            // El backend devuelve:
            // - imgUrl: imagen principal
            // - images: array de objetos {id, imageUrl, order}
            
            const mainImage = product.imgUrl || product.image;
            const defaultImage = getCategoryImage(product.categoryId, product.name);
            
            // Convertir array de objetos images a array de strings
            let additionalImages: string[] = [];
            if (product.images && Array.isArray(product.images)) {
                additionalImages = product.images
                    .filter((img: any) => img.imageUrl) // Solo los que tengan imageUrl
                    .map((img: any) => img.imageUrl); // Extraer solo la URL
            }
            
            // Construir el array completo de imágenes: [imagen principal, ...imágenes adicionales]
            const allImages = mainImage 
                ? [mainImage, ...additionalImages]
                : [defaultImage];
            
            return {
                ...product,
                image: mainImage || defaultImage, // Imagen principal para mostrar en cards
                images: allImages, // Array completo para galería
                categoryId: product.category?.id || product.categoryId // Normalizar categoryId
            };
            
        });
        
        /* console.log(`✅ ${products.length} productos obtenidos del backend`); */
        return products;
    } catch (error: any) {
        console.error('getAllProducts error:', error);
    }
    return []
};

export const getProductById = async (id: string): Promise<IProduct> => {
    const allProducts = await getAllProducts();
    // Comparar como string y como number para soportar ambos formatos
    const product = allProducts.find((product) => 
        product.id.toString() === id || product.id === Number(id)
    );
    if (!product) {
        toast.error(`Producto no encontrado`);
        console.log('IDs disponibles:', allProducts.map(p => p.id));
        throw new Error('Product no encontrado');
    }
    return product;
};

export const getAllCategories = async (): Promise<ICategoryBasic[]> => {

    try {
        const res = await fetch(`${APIURL}/categories/basic`, { 
            method: 'GET',
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`getAllCategories: fetch failed ${res.status}`);
        }

        const result = await res.json();
        const categories = result.data || result;
        /* console.log(`✅ ${categories.length} categorías obtenidas del backend`); */
        return categories;
    } catch (error: any) {
        console.error('getAllCategories error:', error);
    }
    return []
};
