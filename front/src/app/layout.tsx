import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/NavBar/NavBar";
import { AuthProvider } from "../context/AuthContext";
import Footer from "./components/Footer/Footer";
import { CartProvider } from "../context/CartContext";
import { ShippingProvider } from "../context/ShippingContext";
import { MessagesProvider } from "../context/MessagesContext";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import LandbotChat from "./components/ChatBot/LandbotChat";
import RequirePasswordChangeGuard from "./components/RequirePasswordChangeGuard.tsx/RequirePasswordChangeGuard";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huellitas",
  description: "Desarrollado por U5",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <RequirePasswordChangeGuard>
            <CartProvider>
              <ShippingProvider>
                <MessagesProvider>
                  <Navbar />
                  {children}
                  <Footer />
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                  />
                </MessagesProvider>
              </ShippingProvider>
            </CartProvider>
          </RequirePasswordChangeGuard>
        </AuthProvider>

{/* Chatbot fijo */}
  <LandbotChat />
      </body>
    </html>
  );
}
