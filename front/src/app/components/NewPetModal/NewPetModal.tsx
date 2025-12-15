"use client";

import { IPetCreate } from "@/src/types";
import React from "react";
import Select from 'react-select'

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
  open: boolean;
  creating: boolean;
  form: IPetCreate;
  setForm: (data: IPetCreate) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function NewPetModal({
  open,
  creating,
  form,
  setForm,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      <div className="absolute inset-0 bg-cyan-700/40 backdrop-blur-sm" />
      <div className="relative bg-orange-200 p-6 rounded-2xl w-full max-w-md mx-4 shadow-lg z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Agregar Nueva Mascota
        </h3>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Especie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-1">Especie</label>
            <Select
              styles={customStyles}
              options={especieOptions}
              value={especieOptions.find(opt => opt.value === form.especie)}
              onChange={(selected) => {
                if (selected) setForm({ ...form, especie: selected.value as "PERRO" | "GATO" | "AVE" | "ROEDOR" | "REPTIL" | "OTRO" })
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Seleccionar especie"
            />
          </div>

          {/* Raza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
            <input
              type="text"
              required
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              placeholder="Raza"
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2
                 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-1">Sexo</label>
            <Select
              styles={customStyles}
              options={sexoOptions}
              value={sexoOptions.find(opt => opt.value === form.sexo)}
              onChange={(selected) => {
                if (selected) setForm({ ...form, sexo: selected.value as "MACHO" | "HEMBRA" })
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Seleccionar sexo"
            />
          </div>

          {/* Tamaño */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-1">Tamaño</label>
            <Select
              styles={customStyles}
              options={tamanoOptions}
              value={tamanoOptions.find(opt => opt.value === form.tamano)}
              onChange={(selected) => {
                if (selected) setForm({ ...form, tamano: selected.value as "PEQUENO" | "MEDIANO" | "GRANDE" })
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Seleccionar tamaño"
            />
          </div>

          <div className="flex justify-between">
            {/* Esterilizado */}
            <div className="w-full mr-1">
              <label className="block text-sm font-medium text-gray-700 mt-1">Esterilizado</label>
              <Select
                styles={customStyles}
                options={esterilizadoOptions}
                value={esterilizadoOptions.find(opt => opt.value === form.esterilizado)}
                onChange={(selected) => {
                  if (selected) setForm({ ...form, esterilizado: selected.value as "SI" | "NO" })
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="¿Está esterilizado?"
              />
            </div>

            {/* Estado */}
            <div className="w-full ml-1">
              <label className="block text-sm font-medium text-gray-700 mt-1">Estado</label>
              <Select
                styles={customStyles}
                options={statusOptions}
                value={statusOptions.find(opt => opt.value === form.status)}
                onChange={(selected) => {
                  if (selected) setForm({ ...form, status: selected.value as "VIVO" | "FALLECIDO" })
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Estado actual"
              />
            </div>
          </div>

          {/* Fecha nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              required
              value={form.fecha_nacimiento}
              onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value})}
              className="w-full border border-cyan-700 p-2 rounded-2xl focus:ring-2
                 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-evenly mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 bg-gray-200 rounded cursor-pointer
                    hover:bg-orange-300 hover:border hover:border-orange-400"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 
              bg-cyan-700 cursor-pointer text-white rounded
            hover:bg-cyan-900 hover:border hover:border-cyan-950"

            >
              {creating ? "Creando..." : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
