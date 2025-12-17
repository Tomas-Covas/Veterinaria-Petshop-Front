"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { createPet, getUserPets, NewPetData } from "@/src/app/services/pet.services";
import { IPet, Order } from "@/src/types";
import CardPet from "../../components/CardPet/CardPet";
import NewPetModal from "../../components/NewPetModal/NewPetModal";
import EditProfileModal from "../../components/EditProfileModal/EditProfileModal";
import OrderList from "../../components/OrderList/OrderList";
import { toast } from "react-toastify";
import { updateUserProfile } from "@/src/services/user.services";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getUserOrders } from "@/src/services/order.services";

interface ClientDashboardProps {
  refreshOrders: number;
}

export default function ClientDashboard({ refreshOrders }: ClientDashboardProps) {
  const { userData, setUserData, activeTab, setActiveTab } = useAuth();
  const [pets, setPets] = useState<IPet[]>([]);
  const [showNewPetModal, setShowNewPetModal] = useState(false);
  const [creatingPet, setCreatingPet] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Paginación para mascotas
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 6; // Número de mascotas por página

  //Paginacion para ordenes
  const [currentPageOrder, setCurrentPageOrder] = useState(1);
  const ordersPerPage = 5;

  const handleSaveProfile = async (data: any) => {
    try {
      const updated = await updateUserProfile(userData!.user.id, data);
      // Actualizar el estado global con los nuevos datos
      if (updated) {
        setUserData({
          ...userData!,
          user: {
            ...userData!.user,
            ...updated,
          },
        });
      }
      if (updated) {
        toast.success("Perfil actualizado correctamente");
        setOpenEdit(false);
      }
    } catch (err) {
      throw err
      toast.error("Error al intentar editar perfil: Intentelo más tarde");
    }
  };

  const [newPetForm, setNewPetForm] = useState<NewPetData>({
    nombre: "",
    especie: "PERRO",
    sexo: "MACHO",
    tamano: "MEDIANO",
    esterilizado: "SI",
    status: "VIVO",
    fecha_nacimiento: "2020-01-15",
    breed: "",
    ownerId: userData?.user?.id || "",
  });

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPet(true);

    try {
      const newPet = await createPet(newPetForm, userData!.user!.id);

      if (!newPet) {
        toast.error("No se pudo crear la mascota");
        return null;
      }

      setPets((prev) => [...prev, newPet]);

      toast.success("Mascota creada correctamente");
      setShowNewPetModal(false);
      window.location.reload()
    } catch (error) {
      toast.error("Error al crear mascota");
      throw error;

    } finally {
      setCreatingPet(false);
    }
  };

  useEffect(() => {
    if (!userData?.user?.id) return ;

    const fetchOrders = async () => {
      try {
        const response = await getUserOrders(userData.user.id);
        setOrders(response || []); //antes response.data
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [userData?.user?.id]);

  useEffect(() => {
    if (!userData?.user?.id) return ;

    const fetchPets = async () => {
      try {
        const data = await getUserPets(userData.user.id);
        setPets(data);
      } catch (err) {
        console.error("Error fetching pets:", err);
        setPets([]);
      }
    };

    fetchPets();
  }, [userData?.user?.id]);


  //Cuentas para paginacion de mascotas
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = (pets || []).slice(indexOfFirstPet, indexOfLastPet);
  const totalPages = Math.ceil((pets || []).length / petsPerPage);

  //Cuentas para paginacion de ordenes
  const indexOfLastOrder = currentPageOrder * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = Array.isArray(orders)
    ? orders.slice(indexOfFirstOrder, indexOfLastOrder)
    : [];
  const totalPagesOrders = Array.isArray(orders)
    ? Math.ceil(orders.length / ordersPerPage)
    : 1;


  const router = useRouter()

  if (!userData) {
    router.push("/")
    return null

  }

  return (
    <div className="pt-20 min-h-screen bg-orange-200">
      <div className="pt-6 pb-16">
        <div className="mx-auto  px-4 sm:px-6 md:px-8">
          {/* Header del Dashboard */}
          <div className="">
            <p className="mt-2 text-3xl text-black">
              Bienvenido, {userData.user.name}
            </p>
          </div>

          {/* Tabs de navegación */}
          <div className="border-b border-cyan-700 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`${activeTab === "profile"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab("pets")}
                className={`${activeTab === "pets"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Mis Mascotas
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`${activeTab === "orders"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Mis Compras
              </button>
            </nav>
          </div>

          {/* Contenido según el tab activo */}
          <div className="md:grid md:grid-cols-3  md:gap-x-8">
            {/* PERFIL */}
            {activeTab === "profile" && (
              <div className="md:col-span-2">
                <div className="bg-white border border-cyan-700 rounded-xl shadow-lg overflow-hidden">
                  <div className="px-8 pb-8">
                    {/* Foto de perfil */}
                    <div className="relative  mb-6">
                      <div className="w-32 h-32 rounded-full flex items-center justify-center 
                      mt-3 text-4xl font-bold text-gray-600 shadow-lg">
                        {userData.user.profileImageUrl ? (
                          <Image
                            src={userData.user.profileImageUrl}
                            width={128}
                            height={128}
                            alt="ProfilePicture"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          userData.user.name?.charAt(0) || "C"
                        )}
                      </div>

                      {/* Botón lápiz */}
                      <label
                        htmlFor="profileImageUpload"
                        className="absolute bottom-2 left-25 bg-orange-500 p-2
                         rounded-full shadow-md cursor-pointer hover:bg-orange-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536M9 11l6.232-6.232a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-1.414.586H9v-2z"
                          />
                        </svg>
                      </label>

                      <input
                        id="profileImageUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0)
                            return;
                          const file = e.target.files[0];
                          await handleSaveProfile({ profileImage: file });
                        }}
                      />
                    </div>

                    {/* Información personal */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Nombre Completo
                          </label>
                          <p className="mt-2 text-lg text-gray-900">
                            {userData.user.name}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Email
                          </label>
                          <p className="mt-2 text-lg text-gray-900">
                            {userData.user.email}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Teléfono
                          </label>
                          <p className="mt-2 text-lg text-gray-900">
                            {userData.user.phone || "No especificado"}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Dirección
                          </label>
                          <p className="mt-2 text-lg text-gray-900">
                            {userData.user.address || "No especificada"}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Ciudad
                          </label>
                          <p className="mt-2 text-lg text-gray-900">
                            {userData.user.country && userData.user.city
                              ? `${userData.user.country} - ${userData.user.city}`
                              : "No especificada"}
                          </p>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-4 pt-6 border-t">
                        <button
                          onClick={() => setOpenEdit(true)}
                          className="flex-1 px-4 py-2 cursor-pointer
                          rounded-md bg-linear-to-r from-orange-500 to-amber-500 text-white
                          hover:bg-linear-to-r hover:from-orange-600 hover:to-amber-600 hover:text-black
                           transition-colors"
                        >
                          Editar Perfil
                        </button>
                      </div>
                    </div>

                    {/* Modal de edición */}
                    <EditProfileModal
                      open={openEdit}
                      onClose={() => setOpenEdit(false)}
                      user={{
                        ...userData.user,
                        image: userData.user.profileImageUrl || "",
                      }}
                      onSave={handleSaveProfile}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MASCOTAS Y TURNOS */}
            {activeTab === "pets" && (
              <div className="md:col-span-2">
                {(pets || []).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No tienes mascotas registradas
                  </p>
                ) : (
                  <>
                    {/* Contador de resultados */}
                    {totalPages > 1 && (
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Mostrando{" "}
                          <span className="font-semibold">
                            {indexOfFirstPet + 1}-
                            {Math.min(indexOfLastPet, pets.length)}
                          </span>{" "}
                          de{" "}
                          <span className="font-semibold">{pets.length}</span>{" "}
                          mascotas
                        </p>
                        <p className="text-sm text-gray-600">
                          Página{" "}
                          <span className="font-semibold">{currentPage}</span>{" "}
                          de <span className="font-semibold">{totalPages}</span>
                        </p>
                      </div>
                    )}

                    {/* Grid de mascotas paginadas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {currentPets.map((pet) => (
                        <CardPet key={pet.id} {...pet} />
                      ))}
                    </div>

                    {/* Controles de paginación */}
                    {totalPages > 1 && (
                      <div className="mt-6 mb-6 flex justify-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>

                          <div className="flex gap-2">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => {
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 &&
                                  page <= currentPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-lg transition ${currentPage === page
                                      ? "bg-orange-600 text-white font-semibold"
                                      : "bg-white border border-gray-300 hover:bg-gray-50"
                                      }`}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                              ) {
                                return (
                                  <span key={page} className="px-2">
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>

                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <button
                  onClick={() => setShowNewPetModal(true)}
                  className=" px-4 py-3 ml-3
                  rounded-md bg-linear-to-r from-orange-500 to-amber-500 text-white
                hover:bg-linear-to-r hover:from-orange-600 hover:to-amber-600 hover:text-black
                   transition-colors 
                    cursor-pointer font-medium"
                >
                  Agregar Nueva Mascota
                </button>
              </div>
            )}

            <NewPetModal
              open={showNewPetModal}
              creating={creatingPet}
              form={newPetForm}
              setForm={(data) =>
                setNewPetForm({ ...data, ownerId: userData?.user?.id })
              }
              onClose={() => {
                setShowNewPetModal(false);
                setNewPetForm({
                  nombre: "",
                  especie: "PERRO",
                  sexo: "MACHO",
                  tamano: "MEDIANO",
                  esterilizado: "NO",
                  status: "VIVO",
                  fecha_nacimiento: "2020-01-15",
                  breed: "",
                  ownerId: "",
                });
              }}
              onSubmit={handleCreatePet}
            />

            {/* COMPRAS */}
            {activeTab === "orders" && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">Órdenes</h2>

                {loadingOrders ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {orders && orders.length > 0 ? (
                      <>
                        {totalPagesOrders > 1 && (
                          <p className="text-sm text-gray-600 mb-4">
                            Mostrando{" "}
                            <span className="font-semibold">
                              {indexOfFirstOrder + 1}-
                              {Math.min(indexOfLastOrder, orders.length)}
                            </span>{" "}
                            de{" "}
                            <span className="font-semibold">{orders.length}</span> órdenes
                          </p>
                        )}

                        <OrderList orders={currentOrders} />

                        {totalPagesOrders > 1 && (
                          <div className="mt-6 mb-6 flex justify-center">
                            <div className="flex items-center gap-2">
                              {/* Botón Anterior */}
                              <button
                                onClick={() =>
                                  setCurrentPageOrder((prev) => Math.max(1, prev - 1))
                                }
                                disabled={currentPageOrder === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Anterior
                              </button>

                              {/* Números */}
                              <div className="flex gap-2">
                                {Array.from({ length: totalPagesOrders }, (_, i) => i + 1).map(
                                  (page) => {
                                    if (
                                      page === 1 ||
                                      page === totalPagesOrders ||
                                      (page >= currentPageOrder - 1 &&
                                        page <= currentPageOrder + 1)
                                    ) {
                                      return (
                                        <button
                                          key={page}
                                          onClick={() => setCurrentPageOrder(page)}
                                          className={`w-10 h-10 rounded-lg transition ${currentPageOrder === page
                                            ? "bg-orange-600 text-white font-semibold"
                                            : "bg-white border border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                          {page}
                                        </button>
                                      );
                                    } else if (
                                      page === currentPageOrder - 2 ||
                                      page === currentPageOrder + 2
                                    ) {
                                      return (
                                        <span key={page} className="px-2">
                                          ...
                                        </span>
                                      );
                                    }
                                    return null;
                                  }
                                )}
                              </div>

                              {/* Botón Siguiente */}
                              <button
                                onClick={() =>
                                  setCurrentPageOrder((prev) =>
                                    Math.min(totalPagesOrders, prev + 1)
                                  )
                                }
                                disabled={currentPageOrder === totalPagesOrders}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Siguiente
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-6">
                        No tienes órdenes registradas.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}


            {/* Sidebar derecha - Resumen rápido */}
            <div className="mt-8 md:mt-0">
              <div
                className="bg-linear-to-br from-orange-100 via-orange-200
               to-orange-200 border border-gray-400  rounded-lg p-6 sticky top-24"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen
                </h3>

                <div className="space-y-4">
                  <div className="border-b border-cyan-700 pb-4">
                    <p className="text-sm text-gray-600">
                      Mascotas registradas
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(pets || []).length}
                    </p>
                  </div>
                  {/* TODO: fijarse por que devuelve mas de los que hay */}
                  <div className="border-b border-cyan-700 pb-4">
                    <p className="text-sm text-gray-600">Turnos programados para hoy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Array.isArray(pets)
                        ? pets.reduce(
                          (acc, pet) =>
                            acc +
                            (pet.appointments
                              ? pet.appointments.filter((app) => {
                                const appDate = new Date(app.date);
                                const today = new Date();

                                return (
                                  app.status === true &&
                                  appDate.getDate() === today.getDate() + 1 &&
                                  appDate.getMonth() === today.getMonth() &&
                                  appDate.getFullYear() === today.getFullYear()
                                );
                              }).length
                              : 0),
                          0
                        )
                        : 0}
                    </p>
                  </div>

                  <div className="border-b border-cyan-700 pb-4">
                    <p className="text-sm text-gray-600">Proximos turnos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Array.isArray(pets)
                        ? pets.reduce(
                          (acc, pet) =>
                            acc +
                            (pet.appointments
                              ? pet.appointments.filter(
                                (app) => app.status === true &&
                                  new Date(app.date) > new Date()
                              ).length
                              : 0),
                          0
                        )
                        : 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Compras activas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userData?.user?.buyerSaleOrders?.filter(
                        (order) => order.status === "ACTIVE"
                      ).length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
