"use client"
import React, { useState } from 'react'
import Image from "next/image"
import { useCart } from '../../../context/CartContext'
import { IProduct } from '@/src/types'
import cart2 from "@/src/assets/cart2.png"   

interface AddCartButtonProps {
    product: IProduct;
    variant?: "text" | "icon";
}

function AddCartButton({ product, variant = "text" }: AddCartButtonProps) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async () => {
        if (isAdding) return;

        setIsAdding(true);
        try {
            await addToCart(product);
        } finally {
            setTimeout(() => setIsAdding(false), 1000);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            type="button"
            disabled={isAdding}
            className={`cursor-pointer mt-10 flex w-auto items-center justify-center p-3 text-base 
                rounded-md bg-linear-to-r from-orange-500 to-amber-500 
                hover:from-orange-600 hover:to-amber-600
                font-medium text-white hover:text-black
                ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isAdding ? (
                "Agregando..."
            ) : variant === "icon" ? (
                <Image 
                    src={cart2}
                    alt="Agregar al carrito"
                    width={24}
                    height={24}
                    className="object-contain"
                />
            ) : (
                "Agregar al carrito"
            )}
        </button>
    )
}

export default AddCartButton
