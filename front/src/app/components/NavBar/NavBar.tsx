"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Huellitas3 from "@/src/assets/Huellitas3.png";
import perrocompras from "@/src/assets/perrocompras.png";

import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { useRole } from "@/src/hooks/useRole";
import { navItems } from "../../helpers/navItems";
import { PATHROUTES } from "../../helpers/pathRoutes";
import LocationButton from "../LocationButton/LocationButton";
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
      <nav className="w-full mx-auto flex justify-end md:items-center md:justify-center lg:justify-between  px-4 sm:px-4 lg:px-6 h-20">

        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center cursor-pointer z-50 shrink-0">
          <Image
            src={Huellitas3}
            alt="Huellitas Pet"
            width={120}
            className="transition-all duration-300 size-3/4 ms-5"
            loading="eager"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex md:flex-row md:justify-center md:items-center
         text-[12px] lg:text-[16px] xl:text-[20px] font-medium text-gray-700">

          {/* Navegación general */}
          <div className="flex gap-6 items-center">
            {navItems
              .filter(() => {
                if (isVeterinarian()) return false;
                if (isAdmin()) return false;
                return true;
              })
              .map((item) => (
                <Link
                  key={item.id}
                  href={item.route}
                  className="hover:text-orange-500 transition whitespace-nowrap"
                >
                  {item.nameToRender}
                </Link>
              ))}

            {/* Admin */}
            {isAdmin() && (
              <Link
                href="/admin/veterinarians"
                className="hover:text-orange-500 transition whitespace-nowrap text-amber-600 font-semibold"
              >
                <span className="hidden lg:inline">🔧 Gestión Veterinarios</span>
                <span className="lg:hidden">🔧 Veterinarios</span>
              </Link>
            )}
          </div>

          {/* Texto de usuario */}
          {userData?.user?.name && (
            <span className="text-gray-700 whitespace-nowrap ml-3 text-[12px] lg:text-[16px] xl:text-[20px]
             font-medium">
              {isVeterinarian() ? (
                <>Hola <span className="font-semibold">Doc. {userData.user.name.split(" ")[0]}</span></>
              ) : isAdmin() ? (
                <Link href="/dashboard" className="font-semibold text-amber-600 hover:text-orange-500 transition">
                  <span className="hidden xl:inline">Panel de Administración</span>
                  <span className="xl:hidden">Panel Admin</span>
                </Link>
              ) : (
                <>Hola <span className="font-semibold">{userData.user.name.split(" ")[0]}</span>, accedé a tu{" "}
                  <Link href={PATHROUTES.PERFIL} className="text-orange-500 hover:text-orange-600 font-semibold">
                    perfil
                  </Link>
                </>
              )}
            </span>
          )}

          {/* Veterinario */}
          {isVeterinarian() && (
            <div className="flex gap-4 items-center ml-6">
              <Link href="/dashboard/vet-profile" className="text-orange-500 hover:text-orange-600 font-semibold">
                Perfil
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/dashboard" className="text-orange-500 hover:text-orange-600 font-semibold">
                Calendario
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/dashboard/pet-history" className="text-orange-500 hover:text-orange-600 font-semibold">
                Historiales
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Right Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">

          {!isAdmin() && <LocationButton />}
          <MessagesButton />

          {/* Login / Logout */}
          {userData?.user ? (
            <>
              <button
                onClick={() => setShowConfirm(true)}
                className="rounded-md bg-linear-to-r from-orange-500
                 to-amber-500 text-white hover:from-orange-600
                  hover:to-amber-600 hover:text-black px-4 py-2
                   transition-colors duration-200 whitespace-nowrap text-sm lg:text-base font-medium"
              >
                Cerrar sesión
              </button>

              {showConfirm && (
                <ConfirmModal
                  message="¿Seguro que quieres cerrar sesión?"
                  onConfirm={async () => {
                    await logout();
                    setShowConfirm(false);
                  }}
                  onCancel={() => setShowConfirm(false)}
                />
              )}
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md bg-linear-to-r from-orange-500 to-amber-500
               text-white hover:from-orange-600 hover:to-amber-600 hover:text-black
                px-4 py-2 transition-colors duration-200 whitespace-nowrap text-sm lg:text-base font-medium"
            >
              Iniciar Sesión
            </Link>
          )}

          {/* Carrito */}
          {!isVeterinarian() && !isAdmin() && (
            <div className="relative w-[60px] h-[60px] md:w-[90px] md:h-[90px]">
              <Link href="/cart">
                <Image
                  src={perrocompras}
                  alt="cart"
                  width={70}
                  height={70}
                  className="object-contain w-full h-full"
                />
              </Link>

              {itemsCount > 0 && (
                <span className="absolute top-[20px] right-[12px] md:top-[30px] md:right-[18px] animate-bounce bg-amber-700
                 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {itemsCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mobile User Greeting - visible outside hamburger menu */}
        <div className="md:hidden flex items-center gap-1 mr-auto ml-4 overflow-hidden">
          {userData?.user?.name && (
            <span className="text-gray-700 text-[10px] font-medium whitespace-nowrap">
              {isVeterinarian() ? (
                <>Hola <span className="font-semibold">Doc. {userData.user.name.split(" ")[0]}</span></>
              ) : isAdmin() ? (
                <Link href="/dashboard" className="font-semibold text-amber-600 hover:text-orange-500 transition">
                  Panel de Administración
                </Link>
              ) : (
                <>Hola <span className="font-semibold">{userData.user.name.split(" ")[0]}</span>, accedé a tu{" "}
                  <Link href={PATHROUTES.PERFIL} className="text-orange-500 hover:text-orange-600 font-semibold">
                    perfil
                  </Link>
                </>
              )}
            </span>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-center items-center z-50 shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col justify-center items-center w-8 h-8 focus:outline-none"
          >
            <span className={`bg-gray-700 block transition-all duration-300 h-0.5 w-6 rounded-sm ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`} />
            <span className={`bg-gray-700 block transition-all duration-300 h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`bg-gray-700 block transition-all duration-300 h-0.5 w-6 rounded-sm ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-20 left-0 right-0 bg-[#f5f5f5] 
        shadow-lg transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-screen opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="px-4 py-6 space-y-4">

          {/* Navegación general */}
          <Link href={"/"} className="block text-gray-700 hover:text-orange-500 transition text-base font-medium">Inicio</Link>
          {navItems
            .filter(() => !isAdmin())
            .map((item) => (
              <Link
                key={item.id}
                href={item.route}
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-700 hover:text-orange-500 transition text-base font-medium"
              >
                {item.nameToRender}
              </Link>
            ))}
          
          {!isAdmin() && <LocationButton />}
          <MessagesButton />
          <br></br>

          {/* Admin */}
          {isAdmin() && (
            <Link
              href="/admin/veterinarians"
              onClick={() => setIsMenuOpen(false)}
              className="block text-amber-600 hover:text-orange-500 transition py-2 text-sm font-semibold"
            >
              🔧 Gestión Veterinarios
            </Link>
          )}

          {/* Carrito */}
          {!isVeterinarian() && !isAdmin() && (
            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-700 hover:text-orange-500 transition py-2 text-base 
              font-medium pt-8"
            >
              🛒 Mi Carrito {itemsCount > 0 && `(${itemsCount})`}
            </Link>
          )}

          {/* Login / Logout */}
          <div className="pt-2">
            {!userData?.user ? (
              <Link
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-700 hover:text-orange-500 transition py-2 text-base font-medium"
              >
                Iniciar Sesión
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowConfirm(true);
                }}
                className="block w-full text-left cursor-pointer text-gray-700 hover:text-orange-500 transition py-2 text-base font-medium"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
