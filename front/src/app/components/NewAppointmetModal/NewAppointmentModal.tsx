'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Select from 'react-select'
import { toast } from 'react-toastify'
import avatar from "@/src/assets/avatar.jpg"
import { Veterinarian } from '@/src/types'

interface Props {
    open: boolean
    onClose: () => void
    userId: string
    petId: string
    onSuccess: (newAppointment: any) => void
}

const APIURL = process.env.NEXT_PUBLIC_API_URL

// Genera intervalos de 30 min
const generateTimeSlots = (startHour: number, endHour: number) => {
    const slots: string[] = []
    for (let h = startHour; h < endHour; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`)
        slots.push(`${String(h).padStart(2, '0')}:30`)
    }
    return slots
}

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const minDate = tomorrow.toISOString().split('T')[0]

export default function NewAppointmentModal({ open, onClose, userId, petId, onSuccess }: Props) {
    const inputStyle =
        "w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"

    const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([])
    const [appointments, setAppointments] = useState<string[]>([])

    const [form, setForm] = useState({
        veterinarianId: '',
        date: '',
        time: '',
        detail: '',
    })

    useEffect(() => {
        if (open) {
            setForm({
                veterinarianId: '',
                date: '',
                time: '',
                detail: '',
            })
            setAppointments([])
        }
    }, [open])

    useEffect(() => {
        const fetchVeterinarians = async () => {
            const res = await fetch(`${APIURL}/veterinarians`, { credentials: 'include' })
            const { data } = await res.json()
            setVeterinarians(data)
        }
        if (open) fetchVeterinarians()
    }, [open])

    const normalizeTime = (time: string) => {
        const [h, m] = time.split(':').map(Number)
        if (m < 30) return `${String(h).padStart(2, '0')}:00`
        return `${String(h).padStart(2, '0')}:30`
    }

    // 🔹 Función reutilizable
    const fetchAppointments = async () => {
        if (!form.date || !form.veterinarianId) return
        const res = await fetch(`${APIURL}/veterinarians/${form.veterinarianId}`, {
            credentials: 'include',
        })
        const { data } = await res.json()
        const filtered = data.appointments
            .filter((appt: any) => appt.date === form.date)
            .map((appt: any) => normalizeTime(appt.time))
        setAppointments(filtered)
    }

    useEffect(() => {
        fetchAppointments()
    }, [form.date, form.veterinarianId])

    const customStyles = {
        control: (base: any) => ({
            ...base,
            backgroundColor: '#FFDCA8',
            borderRadius: '1rem',
            borderColor: '#0e7490',
            padding: '0.25rem',
            boxShadow: 'none',
            '&:hover': { borderColor: '#f97316' },
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#0e7490' : '#FFDCA8',
            borderRadius: state.isFocused ? '1rem' : '',
            color: '#1f2937',
        }),
    }

    const handleSubmit = async () => {
        const selectedDate = new Date(`${form.date}T${form.time}`)
        const now = new Date()

        if (selectedDate < now) {
            toast.error("No se puede agendar un turno en el pasado")
            return
        }

        const hour = selectedDate.getHours()
        if (hour < 8 || hour > 20) {
            toast.error("El horario debe estar entre las 08:00 y las 20:00")
            return
        }

        // Asegurar que el tiempo esté en formato HH:mm:ss
        const timeWithSeconds = form.time.includes(':') && form.time.split(':').length === 2 
            ? `${form.time}:00` 
            : form.time;

        const payload = {
            userId,
            petId,
            veterinarianId: form.veterinarianId,
            date: form.date,
            time: timeWithSeconds,
            detail: form.detail,
            status: true,
        }

        try {
            const res = await fetch(`${APIURL}/appointments/NewAppointment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Error al agendar el turno');
            }

            toast.success('Turno agendado correctamente');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('❌ Error al crear turno:', err);
            toast.error(err.message);
        }
    }

    if (!open) return null

    // rango dinámico según veterinario
    let selectedVet = veterinarians.find(v => v.id === form.veterinarianId)
    const startHour = selectedVet?.startHour ?? 8
    const endHour = selectedVet?.endHour ?? 20
    const slots = generateTimeSlots(startHour, endHour)

return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-cyan-700/40 backdrop-blur-sm" />
        <div className="relative bg-orange-200 p-6 rounded-2xl w-full max-w-4xl mx-4 shadow-lg z-10">
            <h2 className="text-xl font-bold mb-4">Agendar Turno</h2>

            <div className="flex flex-col gap-3">

                <label className="text-sm font-medium text-gray-700">Veterinario</label>

                <Select
                    options={veterinarians.map(v => ({ value: v.id, label: v.name }))}
                    value={selectedVet ? { value: selectedVet.id, label: selectedVet.name } : null}
                    onChange={(selected) => {
                        const vet = veterinarians.find(v => v.id === selected?.value)
                        if (vet) {
                            setForm({ ...form, veterinarianId: vet.id })
                            selectedVet = vet
                        }
                    }}
                    styles={customStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Seleccionar veterinario"
                />

                {/* Tarjeta del veterinario */}
                {selectedVet && (
                    <div className="flex items-center gap-4 mt-4 p-3 bg-orange-300 border border-cyan-700 rounded-lg shadow-md">
                        <Image
                            width={20} height={20}
                            src={selectedVet.profileImageUrl || avatar}
                            alt={selectedVet.name}
                            className="w-12 h-12 rounded-full object-cover "
                        />
                        <div>
                            <p className="text-md font-semibold text-gray-900">{selectedVet.name}</p>
                            <p className="text-sm text-gray-600">{selectedVet.description || 'Sin especialidad'}</p>
                        </div>
                    </div>
                )}

                <label className="text-sm font-medium text-gray-700">Fecha</label>
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    min={minDate}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputStyle}
                />

                {form.date && form.veterinarianId && (
                    <>
                        <label className="text-sm font-medium text-gray-700 mt-3">Horarios disponibles</label>
                        <div className="grid grid-cols-12 gap-2 mt-1">
                            {slots.map((slot) => {
                                const isTaken = appointments.includes(slot)
                                return (
                                    <button
                                        key={slot}
                                        disabled={isTaken}
                                        onClick={() => setForm({ ...form, time: slot })}
                                        className={`px-2 py-2 rounded-lg text-sm font-medium
        ${isTaken
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                : 'bg-orange-300 hover:bg-orange-400 cursor-pointer'}
        ${form.time === slot ? 'ring-2 ring-cyan-700' : ''}
      `}
                                    >
                                        {slot}
                                    </button>
                                )
                            })}

                        </div>
                    </>
                )}

                <label className="text-sm font-medium text-gray-700 mt-3">Detalle (opcional)</label>
                <textarea
                    name="detail"
                    value={form.detail}
                    onChange={(e) => setForm({ ...form, detail: e.target.value })}
                    className={inputStyle}
                    rows={1}
                />
            </div>

            <div className="flex justify-evenly mt-4">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-orange-300 hover:border hover:border-orange-400"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-cyan-700 cursor-pointer text-white rounded hover:bg-cyan-900 hover:border hover:border-cyan-950"
                >
                    Agendar
                </button>
            </div>
        </div>
    </div>
)
}
