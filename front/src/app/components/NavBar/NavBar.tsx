"use client";

import { useState } from "react";
import Image from "next/image";
import Huellitas3 from '../../../assets/Huellitas3-2.png'
import perrocompras from '../../../assets/perrocompras.png'
import Link from "next/link";
import { navItems } from "../../helpers/navItems";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { PATHROUTES } from "../../helpers/pathRoutes";
import { useRole } from "@/src/hooks/useRole";
import MessagesButton from "../MessagesButton/MessagesButton";
import ConfirmModal from "../ConfirmCancel/ConfirmModal";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { getItemsCount } = useCart();
  const itemsCount = getItemsCount();
  const { userData, logout } = useAuth();
  const { isAdmin, isVeterinarian } = useRole();

  return (
    <header className="fixed top-0 left-0 w-full bg-[#f5f5f5] shadow-sm z-50 transition-all duration-300">
      <nav className="w-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">

        {/* Logo */}
        <Link href="/" className="flex items-center cursor-pointer mr-3 z-50 shrink-0">
          <Image
            src={Huellitas3}
            alt="Huellitas Pet"
            width={120}
            className=" transition-all duration-300"
            loading="eager"
          />
        </Link>

        {/* Links Desktop - Hidden en mobile */}
        <div className="hidden md:flex md:flex-row md:justify-center md:items-center
          gap- lg:gap-8 text-[16px] lg:text-[20px] lg:flex-row font-medium text-gray-700">
          <div className="flex gap-4 lg:gap-8 items-center">
            {navItems
              .filter(() => {
                // Veterinario no ve nada del nav (sin Store, Historia, Equipo)
                if (isVeterinarian()) {
                  return false;
                }
                // Admin no ve Store, Historia ni Nuestro equipo
                if (isAdmin()) {
                  return false;
                }
                return true; // Otros usuarios ven todo
              })
              .map((navigationItem) => (
                <Link
                  key={navigationItem.id}
                  href={navigationItem.route}
                  className="hover:text-orange-500 transition whitespace-nowrap"
                >
                  {navigationItem.nameToRender}
                </Link>
              ))}

            {/* Link de Admin solo para admin */}
            {isAdmin() && (
              <Link
                href="/admin/veterinarians"
                className="hover:text-orange-500 transition whitespace-nowrap text-amber-600 font-semibold"
              >
                🔧 Gestión Veterinarios
              </Link>
            )}
          </div>

          {userData && userData.user && userData.user.name && (
            <span className="text-gray-700 whitespace-nowrap ml-3 text-[16px] lg:text-[20px] font-medium">
              {isVeterinarian() ? (
                <>
                  Hola <span className="font-semibold">Doc. {userData.user.name.split(" ")[0]}</span>
                </>
              ) : isAdmin() ? (
                <>
                  <Link href="/dashboard" className="font-semibold text-amber-600 hover:text-orange-500 transition">
                    Panel de Administración
                  </Link>
                </>
              ) : (
                <>
                  Hola <span className="font-semibold">{userData.user.name.split(" ")[0]}
                  </span>, accedé a tu <Link href={PATHROUTES.PERFIL}
                    className="text-orange-500 hover:text-orange-600 font-semibold">perfil</Link>
                </>
              )}
            </span>
          )}

          {/* Links adicionales para veterinarios */}
          {isVeterinarian() && (
            <div className="flex gap-4 items-center">
              <Link href="/dashboard/vet-profile" className="text-orange-500 hover:text-orange-600 font-semibold text-[16px] lg:text-[20px]">
                Perfil
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-600 font-semibold text-[16px] lg:text-[20px]">
                Calendario
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/dashboard/pet-history" className="text-orange-500 hover:text-orange-600 font-semibold text-[16px] lg:text-[20px]">
                Historiales
              </Link>
            </div>
          )}
        </div>

        {/* Botón Cerrar Sesión y Carrito - Desktop */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Botón de mensajes */}
          <MessagesButton />
          
          {userData && userData.user ? (
            <div>
              <button
                onClick={() => setShowConfirm(true)}
                className="
              rounded-md bg-linear-to-r from-orange-500 to-amber-500 text-white
                hover:bg-linear-to-r hover:from-orange-600 hover:to-amber-600 hover:text-black
              px-4 py-2 transition-colors duration-200 ml-4
               whitespace-nowrap text-sm lg:text-base font-medium"
              >
                Cerrar sesión
              </button>

              {showConfirm && (
                <ConfirmModal
                  message="¿Seguro que quieres cerrar sesion?"
                  onConfirm={async () => {
                    await logout();
                    setShowConfirm(false);
                  }}
                  onCancel={() => setShowConfirm(false)}
                />
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md bg-linear-to-r from-orange-500 to-amber-500 text-white
                hover:bg-linear-to-r hover:from-orange-600 hover:to-amber-600 hover:text-black
              px-4 py-2 transition-colors duration-200 whitespace-nowrap
               text-sm lg:text-base font-medium"
            >
              Iniciar Sesión
            </Link>
          )}

          {/* Carrito - Solo para no veterinarios y no admin */}
          {!isVeterinarian() && !isAdmin() && (
            <>
              <Link href="/cart" className="cursor-pointer">
                <Image
                  src={perrocompras}
                  alt='cart'
                  width={90}
                  height={90}
                />
              </Link>
              {itemsCount > 0 && (
                <span
                  className="absolute md:top-5 md:right-12 animate-bounce bg-amber-700 text-white text-xs font-bold 
                     w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {itemsCount}
                </span>
              )}
            </>
          )}
        </div>

        {/* Botón Hamburguesa - Solo en Mobile */}
        <div className="md:hidden flex items-center z-50 shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col justify-center items-center w-8 h-8 focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`} />
            <span className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`} />
          </button>
        </div>

      </nav>

      {/* Menú Mobile - Desplegable */}
      <div
        className={`md:hidden fixed top-20 left-0 right-0 bg-[#f5f5f5] shadow-lg transition-all duration-300 ease-in-out ${isMenuOpen
          ? 'max-h-screen opacity-100'
          : 'max-h-0 opacity-0 overflow-hidden'
          }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navItems
            .filter(() => {
              // Admin no ve nada del nav en mobile
              if (isAdmin()) {
                return false;
              }
              return true; // Otros usuarios ven todo
            })
            .map((navigationItem) => (
              <Link
                key={navigationItem.id}
                href={navigationItem.route}
                className="block text-gray-700 hover:text-orange-500 transition py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {navigationItem.nameToRender}
              </Link>
            ))}
          {userData?.user?.name && (
            <Link
              href={PATHROUTES.PERFIL}
              onClick={() => setIsMenuOpen(false)}
              className="md:inline lg:hidden text-orange-500 hover:text-orange-600
               font-semibold whitespace-nowrap text-[16px]"
            >
              {userData.user.name.split(" ")[0]}
            </Link>
          )}

          {/* Link de Admin para admin en mobile */}
          {isAdmin() && (
            <Link
              href="/admin/veterinarians"
              className="block text-amber-600 hover:text-orange-500 transition py-2 text-base font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              🔧 Gestión Veterinarios
            </Link>
          )}

          {/* Carrito en el menú mobile - Solo para no veterinarios y no admin */}
          {!isVeterinarian() && !isAdmin() && (
            <Link
              href="/cart"
              className="block text-gray-700 hover:text-orange-500 transition py-2 text-base font-medium border-t border-gray-300 pt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              🛒 Mi Carrito {itemsCount > 0 && `(${itemsCount})`}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}