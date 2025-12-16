import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Especifica el entorno de ejecución
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, userId } = body;

    // Resto de tu código sin cambios...
    
    // Crea líneas de productos para Stripe
    const lineItems = items.map((item: any) => ({
      price_data:{
        currency: "ars",
        product_data:{
          name: item.name,
          description: item.description || undefined,
          images: item.imageUrl ? [item.imageUrl] : undefined,
        },
        unit_amount: Math.round(Number(item.price) * 100), // Stripe usa centavos
      },
      quantity: item.quantity || 1,
    }));

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/failure`,
      metadata:{
        userId,
      },
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creando sesión de Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Asegura que TypeScript reconozca este archivo como un módulo
export const config = {
  api: {
    bodyParser: false,
  },
};