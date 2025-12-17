"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DIAGNOSIS_OPTIONS } from "@/src/types/diagnosis";
import { useState, useEffect } from "react";
import { getMedications } from "@/src/services/general-medications.services";
import { getMedicationsCatalog } from "@/src/services/controlled-medications.services";
import { toast } from "react-toastify";

interface CompleteTurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medicalData: MedicalRecordData) => void;
  appointment: {
    id: string;
    petName: string;
    petOwner: string;
    service: string;
    date: string;
    time: string;
  };
}

export interface MedicationUsed {
  medicationId: string;
  medicationName: string;
  medicationType: "GENERAL" | "CONTROLLED";
  quantity: number;
  dosage: string;
  duration: string;
  prescriptionNotes?: string;
  currentStock?: number;
}

export interface MedicalRecordData {
  diagnosis: string;
  treatment: string;
  medications: string;
  observations: string;
  nextAppointment?: string;
  vaccinations?: string;
  weight?: string;
  temperature?: string;
  medicationsUsed?: MedicationUsed[];
}

export default function CompleteTurnModal({
  isOpen,
  onClose,
  onSubmit,
  appointment,
}: CompleteTurnModalProps) {
  const [generalMeds, setGeneralMeds] = useState<any[]>([]);
  const [controlledMeds, setControlledMeds] = useState<any[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<
    MedicationUsed[]
  >([]);
  const [loadingMeds, setLoadingMeds] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedications();
    }
  }, [isOpen]);

  const loadMedications = async () => {
    try {
      setLoadingMeds(true);
      const [general, controlled] = await Promise.all([
        getMedications(),
        getMedicationsCatalog(),
      ]);

      // Normalizar a arrays
      const generalArray = general; // siempre array
      const controlledArray = controlled.medications; // siempre array
      
      setGeneralMeds(generalArray);
      setControlledMeds(controlledArray);
    } catch (error) {
      throw error
      toast.error('Error al cargar medicamentos disponibles');
      setGeneralMeds([]);
      setControlledMeds([]);
    } finally {
      setLoadingMeds(false);
    }
  };

  const addMedication = () => {
    setSelectedMedications([
      ...selectedMedications,
      {
        medicationId: "",
        medicationName: "",
        medicationType: "GENERAL",
        quantity: 1,
        dosage: "",
        duration: "",
        prescriptionNotes: "",
      },
    ]);
  };

  const removeMedication = (index: number) => {
    setSelectedMedications(selectedMedications.filter((_, i) => i !== index));
  };

  const updateMedication = (
    index: number,
    field: keyof MedicationUsed,
    value: any
  ) => {
    const updated = [...selectedMedications];

    // Si cambia el medicamento, actualizar nombre y tipo
    if (field === "medicationId") {
      const allMeds = [...generalMeds, ...controlledMeds];
      const med = allMeds.find((m) => m.id === value);
      if (med) {
        updated[index].medicationName = med.name;
        updated[index].medicationType = generalMeds.find((m) => m.id === value)
          ? "GENERAL"
          : "CONTROLLED";
        updated[index].currentStock = med.stock;
      }
    }

    updated[index] = { ...updated[index], [field]: value };
    setSelectedMedications(updated);
  };

  if (!isOpen) return null;

  const handleSubmit = (values: MedicalRecordData) => {
    // Validar medicamentos si hay alguno seleccionado
    if (selectedMedications.length > 0) {
      const invalidMeds = selectedMedications.filter(m =>
        !m.medicationId || !m.dosage || !m.duration || m.quantity <= 0
      );

      if (invalidMeds.length > 0) {
        toast.error("Por favor completa todos los campos de los medicamentos");
        return;
      }

      // Validar stock
      const insufficientStock = selectedMedications.filter(m =>
        m.currentStock !== undefined && m.quantity > m.currentStock
      );

      if (insufficientStock.length > 0) {
        toast.error(
          `Stock insuficiente para: ${insufficientStock
            .map((m) => m.medicationName)
            .join(", ")}`
        );
        return;
      }
    }

    // Limpiar currentStock antes de enviar (campo solo para validación frontend)
    const medicationsToSend = selectedMedications.map(({ currentStock, ...med }) => med);

    // Enviar medicationsUsed al backend
    onSubmit({ ...values, medicationsUsed: medicationsToSend });
    setSelectedMedications([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-linear-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-400 to-orange-600 p-6 sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Completar Consulta
              </h2>
              <p className="text-orange-100 mt-1">
                {appointment.petName} - {appointment.service}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-500 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <Formik
          initialValues={{
            diagnosis: "",
            treatment: "",
            medications: "",
            observations: "",
            nextAppointment: "",
            vaccinations: "",
            weight: "",
            temperature: "",
          }}
          validationSchema={Yup.object({
            diagnosis: Yup.string().required(
              "⚠️ El diagnóstico es obligatorio"
            ),
            treatment: Yup.string()
              .required("⚠️ El tratamiento es obligatorio")
              .min(10, "⚠️ El tratamiento debe tener al menos 10 caracteres"),
            weight: Yup.number()
              .positive("⚠️ El peso debe ser un número positivo")
              .max(200, "⚠️ El peso parece demasiado alto"),
            temperature: Yup.number()
              .positive("⚠️ La temperatura debe ser un número positivo")
              .min(35, "⚠️ La temperatura parece muy baja")
              .max(45, "⚠️ La temperatura parece muy alta"),
          })}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="p-6 space-y-6">
              {/* Información del turno */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Información del Turno
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Mascota:</span>
                    <span className="ml-2 font-medium">
                      {appointment.petName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dueño:</span>
                    <span className="ml-2 font-medium">
                      {appointment.petOwner}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <span className="ml-2 font-medium">{appointment.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hora:</span>
                    <span className="ml-2 font-medium">{appointment.time}</span>
                  </div>
                </div>
              </div>

              {/* Signos Vitales */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Signos Vitales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (kg)
                    </label>
                    <Field
                      name="weight"
                      type="number"
                      step="0.1"
                      placeholder="Ej: 15.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <ErrorMessage name="weight">
                      {(msg) => (
                        <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                          <span>⚠️</span> {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperatura (°C)
                    </label>
                    <Field
                      name="temperature"
                      type="number"
                      step="0.1"
                      placeholder="Ej: 38.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <ErrorMessage name="temperature">
                      {(msg) => (
                        <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                          <span>⚠️</span> {msg}
                        </div>
                      )}
                    </ErrorMessage>
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico <span className="text-red-500">*</span>
                </label>
                <Field
                  as="select"
                  name="diagnosis"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecciona un diagnóstico</option>
                  {DIAGNOSIS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="diagnosis">
                  {(msg) => (
                    <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span>⚠️</span> {msg}
                    </div>
                  )}
                </ErrorMessage>
              </div>

              {/* Tratamiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tratamiento <span className="text-red-500">*</span>
                </label>
                <Field
                  as="textarea"
                  name="treatment"
                  rows={3}
                  placeholder="Describe el tratamiento aplicado o recomendado..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <ErrorMessage name="treatment">
                  {(msg) => (
                    <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span>⚠️</span> {msg}
                    </div>
                  )}
                </ErrorMessage>
              </div>

              {/* Medicamentos de Base de Datos */}
              <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-xl">💊</span>
                      Medicamentos Recetados (con descuento de stock)
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Selecciona medicamentos de la base de datos. El stock se
                      descontará automáticamente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMedication}
                    disabled={loadingMeds}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm flex items-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    Agregar Medicamento
                  </button>
                </div>

                {loadingMeds && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">
                      Cargando medicamentos...
                    </p>
                  </div>
                )}

                {!loadingMeds &&
                  (generalMeds.length > 0 || controlledMeds.length > 0) && (
                    <div className="text-xs text-gray-600 mb-3 bg-white p-2 rounded border border-gray-200">
                      📊 Disponibles: {generalMeds.length} generales,{" "}
                      {controlledMeds.length} controlados
                    </div>
                  )}

                {selectedMedications.length === 0 && !loadingMeds && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay medicamentos agregados</p>
                    <p className="text-xs mt-1">
                      Haz clic en "Agregar Medicamento" para comenzar
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedMedications.map((med, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        {/* Selector de Medicamento */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medicamento <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={med.medicationId}
                            onChange={(e) =>
                              updateMedication(
                                index,
                                "medicationId",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">Selecciona un medicamento</option>
                            {generalMeds.length > 0 && (
                              <optgroup
                                label={`Medicamentos Generales (${generalMeds.length})`}
                              >
                                {generalMeds.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} - Stock: {m.stock} {m.unit || ""}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {controlledMeds.length > 0 && (
                              <optgroup
                                label={`🔐 Medicamentos Controlados (${controlledMeds.length})`}
                              >
                                {controlledMeds.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} - Stock: {m.stock} {m.unit || ""}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {generalMeds.length === 0 &&
                              controlledMeds.length === 0 && (
                                <option disabled>
                                  No hay medicamentos disponibles
                                </option>
                              )}
                          </select>
                          {med.currentStock !== undefined && (
                            <p className="text-xs mt-1 text-gray-600">
                              Stock disponible:{" "}
                              <span className="font-semibold">
                                {med.currentStock}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={med.quantity || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateMedication(
                                index,
                                "quantity",
                                val === "" ? "" : parseInt(val)
                              );
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          {med.currentStock !== undefined &&
                            med.quantity > med.currentStock && (
                              <p className="text-xs text-red-600 mt-1">
                                ⚠️ Stock insuficiente
                              </p>
                            )}
                        </div>

                        {/* Dosificación */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosificación <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 1 comp. cada 12h"
                            value={med.dosage}
                            onChange={(e) =>
                              updateMedication(index, "dosage", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        {/* Duración */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duración <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 7 días"
                            value={med.duration}
                            onChange={(e) =>
                              updateMedication(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        {/* Notas (solo para controlados) */}
                        {med.medicationType === "CONTROLLED" && (
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notas de Prescripción
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Observaciones sobre efectos secundarios, precauciones..."
                              value={med.prescriptionNotes || ""}
                              onChange={(e) =>
                                updateMedication(
                                  index,
                                  "prescriptionNotes",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>

                      {med.medicationType === "CONTROLLED" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                          <p className="text-xs text-yellow-800 flex items-center gap-1">
                            <span>🔐</span>
                            Medicamento controlado - Se registrará en auditoría
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medicamentos Adicionales (texto libre) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamentos Adicionales (texto libre)
                </label>
                <Field
                  as="textarea"
                  name="medications"
                  rows={2}
                  placeholder="Otros medicamentos no registrados en la base de datos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa este campo solo para medicamentos que no estén en la base
                  de datos
                </p>
              </div>

              {/* Vacunaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vacunaciones Aplicadas
                </label>
                <Field
                  name="vaccinations"
                  type="text"
                  placeholder="Ej: Antirrábica, Triple Felina..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Adicionales
                </label>
                <Field
                  as="textarea"
                  name="observations"
                  rows={3}
                  placeholder="Notas adicionales, recomendaciones para el dueño, etc..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Próxima Cita */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próxima Cita Sugerida
                </label>
                <Field
                  name="nextAppointment"
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  ✓ Completar Consulta
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
