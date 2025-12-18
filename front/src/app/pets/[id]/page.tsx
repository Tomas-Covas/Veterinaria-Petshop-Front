"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import img from "@/src/assets/avatar.jpg"
import EditPetModal from "../../components/EditPetModal/EditPetModal";
import NewAppointmentModal from "../../components/NewAppointmetModal/NewAppointmentModal";
import { useAuth } from "@/src/context/AuthContext";
import avatar from "@/src/assets/avatarHueso.png";
import {
  deletePet,
  updatePet,
  updatePetImage,
} from "../../services/pet.services";
import Link from "next/link";
import { IPet, IAppointment } from "@/src/types";
import ConfirmModal from "../../components/ConfirmCancel/ConfirmModal";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { userData } = useAuth();
  const [pet, setPet] = useState<IPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [openAppointment, setOpenAppointment] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  useEffect(() => {
    console.log("ID desde useParams:", id);

    const fetchPet = async () => {
      try {
        const res = await fetch(`${APIURL}/pets/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener la mascota");
        const { data } = await res.json();
        setPet(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPet();
  }, [id]);

  const refreshPet = async () => {
    try {
      const res = await fetch(`${APIURL}/pets/${id}`, {
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Error al obtener la mascota");
      const { data } = await res.json();
      setPet(data);
      setImageKey(Date.now());
      return data;
    } catch (err: any) {
      toast.error("Error actualizando la mascota");
      throw err;
    }
  };


  const handleDeletePet = async (id: string) => {
    try {
      await deletePet(id);
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando información de la mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Mascota no encontrada</p>
      </div>
    );
  }

  const getPetAge = () => {
    const start = new Date(pet.fecha_nacimiento + "T00:00:00").getTime();
    const end = pet.fecha_fallecimiento
      ? new Date(pet.fecha_fallecimiento).getTime()
      : Date.now();
    return Math.floor((end - start) / (1000 * 60 * 60 * 24 * 365.25));
  };

  // Filtrar solo turnos futuros
  const upcomingAppointments = pet.appointments.filter((appt: IAppointment) => {
    const apptDate = new Date(`${appt.date}T${appt.time}`);
    const todayMinusOne = new Date();
    todayMinusOne.setDate(todayMinusOne.getDate() - 1);
    return apptDate >= todayMinusOne;
  });

  return (
    <div className="pt-23 flex flex-col justify-center items-center">

      <Link
        href={"/dashboard"}
        className="text-orange-400 pt-3 text-lg font-bold self-start md:ml-30 ml-15 hover:text-orange-600"
      >
        Volver a Mascotas
      </Link>

      <div className="flex flex-col md:flex-row md:items-stretch items-center gap-4">

        {/* Columna izquierda: info mascota */}
        <div className="bg-linear-to-br from-orange-100 via-orange-200 w-full to-orange-300
         rounded-lg shadow-md p-6 border border-amber-600">
          <h1 className="text-3xl font-bold flex justify-center text-gray-900 mb-4">
            {pet.nombre}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center md:justify-evenly  gap-6">

            <div className="relative w-[200px] h-[200px] self-start">
              <Image
                src={pet.image ? `${pet.image}?t=${imageKey}` : avatar}
                width={200}
                height={200}
                alt="mascota"
                className="rounded-full bg-gray-400 object-cover"
                key={imageKey}
                unoptimized={!!pet.image}
                priority
              />
              <label
                htmlFor="pet-image-upload"
                className="absolute bottom-10 right-0 bg-orange-500 p-3 rounded-full shadow-lg
                 cursor-pointer hover:bg-orange-600 transition-all hover:scale-110"
                title="Cambiar imagen"
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
                id="pet-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (!e.target.files || e.target.files.length === 0) return;
                  const file = e.target.files[0];

                  try {
                    const response = await updatePetImage(id, file);
                    const updatedPet = response.data || response.updatedPet;
                    
                    if (updatedPet) {
                      const petWithAppointments = {
                        ...updatedPet,
                        appointments: updatedPet.appointments || pet?.appointments || []
                      };
                      setPet(petWithAppointments);
                      setImageKey(Date.now());
                      toast.success("Imagen actualizada correctamente");
                    } else {
                      await refreshPet();
                      toast.success("Imagen actualizada correctamente");
                    }
                  } catch (err: any) {
                    toast.error(err.message || "Error al actualizar la imagen");
                  }
                }}
              />
            </div>
            <div>
              <p className="text-gray-700 mb-2 mt-25 md:mt-0">
                <span className="font-semibold">Especie:</span> {pet.especie}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Raza:</span>{" "}
                {pet.breed || "No especificada"}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Sexo:</span> {pet.sexo}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Tamaño:</span> {pet.tamano}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Esterilizado:</span>{" "}
                {pet.esterilizado}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Estado:</span> {pet.status}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Edad:</span> {getPetAge()} años
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Fecha de nacimiento:</span>{" "}
                {new Date(pet.fecha_nacimiento + "T00:00:00").toLocaleDateString("es-ES")}
              </p>
            </div>

          </div>

          {/* Botones */}
          <div className="flex mb-4 space-x-4 mt-6">
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Eliminar Mascota
            </button>

            {showConfirm && (
              <ConfirmModal
                message="¿Seguro que quieres eliminar a la mascota?"
                onConfirm={async () => {
                  await handleDeletePet(pet.id);
                  setShowConfirm(false);
                }}
                onCancel={() => setShowConfirm(false)}
              />
            )}



            <button
              onClick={() => setOpenEdit(true)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Modificar Mascota
            </button>
            <EditPetModal
              open={openEdit}
              onClose={() => setOpenEdit(false)}
              pet={pet}
              onSave={async (updatedData) => {
                try {
                  setLoading(true);
                  const { data } = await updatePet(id, updatedData);
                  setPet(data);
                  toast.success("Mascota modificada con éxito");
                  setOpenEdit(false);
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000); /*  TODO: ver com funciona */
                } catch (err: any) {
                  toast.error(err.message);
                  setLoading(false);
                }
              }}
            />
          </div>

          <button
            onClick={() => setOpenAppointment(true)}
            className="rounded-md bg-linear-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:text-black px-4 py-2 transition-colors duration-200 whitespace-nowrap text-sm lg:text-base font-medium w-full"
            disabled={!userData?.user?.id}
          >
            Agendar Turno
          </button>
          <NewAppointmentModal
            open={openAppointment}
            onClose={() => setOpenAppointment(false)}
            userId={userData!.user.id}
            petId={id}
            onSuccess={refreshPet}
          />
        </div>

        {/* Columna derecha: turnos futuros */}
        <div className="bg-linear-to-br from-orange-100 via-orange-200 w-full  to-orange-300
         rounded-lg shadow-md p-6 border border-amber-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Próximos Turnos
          </h2>

          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">No hay turnos futuros agendados</p>
          ) : (
            [...upcomingAppointments]
              .sort(
                (a, b) =>
                  new Date(`${a.date}T${a.time}`).getTime() -
                  new Date(`${b.date}T${b.time}`).getTime()
              )
              .map((appt) => {
                const apptDate = new Date(`${appt.date}T${appt.time}`);
                const dayName = apptDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                });
                const formattedDate = apptDate.toLocaleDateString("es-ES");
                const formattedTime = apptDate.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const handleCancel = async () => {
                  try {
                    const res = await fetch(
                      `${APIURL}/appointments/${appt.id}`,
                      {
                        method: "PUT",
                        credentials: "include",
                      }
                    );
                    if (!res.ok) throw new Error("Error al cancelar el turno");
                    toast.success("Turno cancelado");
                    setPet((prev: IPet | null) =>
                      prev
                        ? {
                            ...prev,
                            appointments: prev.appointments.filter(
                              (a: any) => a.id !== appt.id
                            ),
                          }
                        : prev
                    );
                  } catch (err: any) {
                    toast.error(err.message);
                  }
                };
                return (
                  <div
                    key={appt.id}
                    className="p-4 rounded-lg mt-2 shadow-md border border-cyan-700
                                     flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={appt.veterinarian.profileImageUrl || img}
                        width={60}
                        height={60}
                        alt={appt.veterinarian.name}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {appt.veterinarian.name}
                        </p>
                        <p className="text-md text-gray-600">
                          {dayName}, {formattedDate} - {formattedTime}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 
                      rounded hover:bg-red-500 hover:text-black cursor-pointer"
                    >
                      Cancelar
                    </button>

                    {showConfirm && (
                      <ConfirmModal
                        message="¿Seguro que querés cancelar este turno?"
                        onConfirm={async () => {
                          await handleCancel();
                          setShowConfirm(false);
                        }}
                        onCancel={() => setShowConfirm(false)}
                      />
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>

  );
}
