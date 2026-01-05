import { StaticImageData } from 'next/image';

export interface IProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string | StaticImageData;
    imgUrl?: string; // URL de la imagen desde el backend
    images?: (string | StaticImageData)[]; // Galería de imágenes adicionales
    categoryId: number;
} 