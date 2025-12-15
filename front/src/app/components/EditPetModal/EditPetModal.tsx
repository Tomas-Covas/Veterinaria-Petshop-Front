'use client'
import { IPetUpdate } from '@/src/types'
import { useState } from 'react'
import Select from 'react-select'

const especieOptions = [
    { value: 'PERRO', label: 'Perro' },
    { value: 'GATO', label: 'Gato' },
    { value: 'AVE', label: 'Ave' },
    { value: 'ROEDOR', label: 'Roedor' },
    { value: 'REPTIL', label: 'Reptil' },
    { value: 'OTRO', label: 'Otro' },
]

const sexoOptions = [
    { value: 'MACHO', label: 'Macho' },
    { value: 'HEMBRA', label: 'Hembra' },
]

const tamanoOptions = [
    { value: 'PEQUENO', label: 'Pequeño' },
    { value: 'MEDIANO', label: 'Mediano' },
    { value: 'GRANDE', label: 'Grande' },
]

const esterilizadoOptions = [
    { value: 'SI', label: 'Sí' },
    { value: 'NO', label: 'No' },
]

const statusOptions = [
    { value: 'VIVO', label: 'Vivo' },
    { value: 'FALLECIDO', label: 'Fallecido' },
]

interface Props {
    open: boolean
    onClose: () => void
    pet: IPetUpdate
    onSave: (updatedData: IPetUpdate) => Promise<void>
}

export default function EditPetModal({ open, onClose, pet, onSave }: Props) {
    const inputStyle = "w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"

    const [form, setForm] = useState<IPetUpdate>({
        nombre: pet?.nombre ?? '',
        especie: pet?.especie ?? 'PERRO',
        sexo: pet?.sexo ?? 'MACHO',
        tamano: pet?.tamano ?? 'MEDIANO',
        esterilizado: pet?.esterilizado ?? 'SI',
        status: pet?.status ?? 'VIVO',
        fecha_nacimiento: pet?.fecha_nacimiento ?? '',
        fecha_fallecimiento: pet?.fecha_fallecimiento ?? null,
        breed: pet?.breed ?? ''
    });

    if (!open) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value as any });
    };

    const handleSubmit = async () => {
        await onSave(form);
    };

    const customStyles = {
        control: (base: any) => ({
            ...base,
            backgroundColor: '#FFDCA8',
            borderRadius: '1rem',
            borderColor: '#0e7490', // cyan-700
            padding: '0.25rem',
            boxShadow: 'none',
            '&:hover': { borderColor: '#f97316' }, // orange-500
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? '#0e7490' : '#FFDCA8', // amber-200
            borderRadius: state.isFocused ? '1rem' : '',
            color: '#1f2937', // gray-800
        }),
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-cyan-700/40 backdrop-blur-sm" />
            <div className="relative bg-orange-200 p-6 rounded-2xl w-full max-w-md mx-4 shadow-lg z-10">
                <h2 className="text-xl font-bold mb-4">Editar Mascota</h2>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                        className={inputStyle}
                    />

                    <div className='flex flex-row justify-between'>
                        <div className='w-full pr-1'>
                            <label className="text-sm font-medium text-gray-700 mt-1">Especie</label>
                            <Select
                                styles={customStyles}
                                options={especieOptions}
                                value={especieOptions.find(opt => opt.value === form.especie)}
                                onChange={(selected) => {
                                    if (selected) {
                                        setForm({ ...form, especie: selected.value })
                                    }
                                }}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Seleccionar especie"
                            />
                        </div>
                        <div className='w-full ps-1'>
                            <label className="text-sm font-medium text-gray-700 mt-1">Sexo</label>
                            <Select
                                options={sexoOptions}
                                value={sexoOptions.find(opt => opt.value === form.sexo)}
                                onChange={(selected) => {
                                    if (selected) {
                                        setForm({ ...form, sexo: selected.value })
                                    }
                                }}
                                styles={customStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Seleccionar sexo"
                            />
                        </div>
                    </div>
                    <label className="text-sm font-medium text-gray-700 mt-1">Tamaño</label>
                    <Select
                        options={tamanoOptions}
                        value={tamanoOptions.find(opt => opt.value === form.tamano)}
                        onChange={(selected) => {
                            if (selected) {
                                setForm({ ...form, tamano: selected.value })
                            }
                        }}
                        styles={customStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Seleccionar tamaño"
                    />

                    <div className='flex flex-row justify-between'>
                        <div className='w-full pr-1'>
                            <label className="text-sm font-medium text-gray-700 mt-1">Esterilizado</label>
                            <Select
                                options={esterilizadoOptions}
                                value={esterilizadoOptions.find(opt => opt.value === form.esterilizado)}
                                onChange={(selected) => {
                                    if (selected) {
                                        setForm({ ...form, esterilizado: selected.value })
                                    }
                                }}
                                styles={customStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="¿Está esterilizado?"
                            />
                        </div>
                        <div className='w-full ps-1'>
                            <label className="text-sm font-medium text-gray-700 mt-1">Estado</label>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(opt => opt.value === form.status)}
                                onChange={(selected) => {
                                    if (selected) {
                                        setForm({ ...form, status: selected.value })
                                    }
                                }}
                                styles={customStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Estado actual"
                            />
                        </div>
                    </div>

                    <label className="text-sm font-medium text-gray-700 mt-1">Fecha de nacimiento</label>
                    <input
                        type="date"
                        name="fecha_nacimiento"
                        value={form.fecha_nacimiento}
                        onChange={handleChange}
                        className={inputStyle}
                    />

                    <label className="text-sm font-medium text-gray-700 mt-1">Fecha de fallecimiento</label>
                    <input
                        type="date"
                        name="fecha_fallecimiento"
                        value={form.fecha_fallecimiento || ""}
                        onChange={handleChange}
                        className={inputStyle}
                    />

                    <label className="text-sm font-medium text-gray-700 mt-1">Raza</label>
                    <input
                        name="breed"
                        value={form.breed}
                        onChange={handleChange}
                        placeholder="Raza"
                        className={inputStyle}
                    />
                </div>

                <div className="flex justify-evenly mt-2">
                    <button onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded cursor-pointer
                    hover:bg-orange-300 hover:border hover:border-orange-400">
                        Cancelar</button>

                    <button onClick={handleSubmit}
                        className="px-4 py-2 bg-cyan-700 cursor-pointer text-white rounded
                    hover:bg-cyan-900 hover:border hover:border-cyan-950">
                        Guardar</button>
                </div>
            </div>
        </div>
    );
}
