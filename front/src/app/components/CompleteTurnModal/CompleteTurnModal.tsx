'use client';

import { Formik, Form, Field } from 'formik';
import { DIAGNOSIS_OPTIONS } from '@/src/types/diagnosis';

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

export interface MedicalRecordData {
  diagnosis: string;
  treatment: string;
  medications: string;
  observations: string;
  nextAppointment?: string;
  vaccinations?: string;
  weight?: string;
  temperature?: string;
}

export default function CompleteTurnModal({ isOpen, onClose, onSubmit, appointment }: CompleteTurnModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (values: MedicalRecordData) => {
    onSubmit(values);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-6 sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Completar Consulta</h2>
              <p className="text-orange-100 mt-1">
                {appointment.petName} - {appointment.service}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-500 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <Formik
          initialValues={{
            diagnosis: '',
            treatment: '',
            medications: '',
            observations: '',
            nextAppointment: '',
            vaccinations: '',
            weight: '',
            temperature: '',
          }}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="p-6 space-y-6">
              {/* Información del turno */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Información del Turno</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Mascota:</span>
                    <span className="ml-2 font-medium">{appointment.petName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dueño:</span>
                    <span className="ml-2 font-medium">{appointment.petOwner}</span>
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
                <h3 className="font-semibold text-gray-900 mb-3">Signos Vitales</h3>
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  <option value="">Selecciona un diagnóstico</option>
                  {DIAGNOSIS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona el diagnóstico principal de la consulta. Estos diagnósticos están disponibles automáticamente desde el backend.
                </p>
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
                  required
                  placeholder="Describe el tratamiento aplicado o recomendado..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Medicamentos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamentos Recetados
                </label>
                <Field
                  as="textarea"
                  name="medications"
                  rows={3}
                  placeholder="Lista de medicamentos, dosis y duración del tratamiento..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
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
