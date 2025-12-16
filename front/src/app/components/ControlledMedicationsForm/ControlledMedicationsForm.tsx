"use client";

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  createMedicationRequest,
  getMedicationsCatalog,
  MedicationCatalogItem,
  CreateMedicationRequestBody,
} from '@/src/services/controlled-medications.services';

interface ControlledMedicationsFormProps {
  veterinarianId: string;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  nombre: Yup.string().required('El medicamento es obligatorio'),
  cantidad: Yup.number()
    .min(1, 'La cantidad mínima es 1')
    .required('La cantidad es obligatoria'),
  urgencia: Yup.string()
    .oneOf(['baja', 'media', 'alta'], 'Selecciona un nivel de urgencia válido')
    .required('La urgencia es obligatoria'),
  justificacion: Yup.string().optional(),
});

export default function ControlledMedicationsForm({
  veterinarianId,
  onSuccess,
}: ControlledMedicationsFormProps) {
  const [catalog, setCatalog] = useState<MedicationCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMed, setSelectedMed] = useState<MedicationCatalogItem | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const data = await getMedicationsCatalog();
      console.log('📋 Catálogo recibido:', data);
      console.log('🔍 Primer medicamento:', data.medications[0]);
      
      // Normalizar datos: el backend puede devolver 'name' en vez de 'nombre'
      const normalized = data.medications.map(med => ({
        id: med.id,
        nombre: med.nombre || (med as any).name || 'Sin nombre',
        categoria: med.categoria || (med as any).category || 'General',
        descripcion: med.descripcion || (med as any).description || '',
        presentacion: med.presentacion || (med as any).presentation || (med as any).unit || '',
        requiereMatricula: med.requiereMatricula ?? (med as any).requiresPrescription ?? false,
        restricciones: med.restricciones || (med as any).restrictions || ''
      }));
      
      console.log('✅ Datos normalizados:', normalized);
      setCatalog(normalized);
    } catch (error) {
      console.error('Error cargando catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const initialValues: CreateMedicationRequestBody = {
    nombre: '',
    cantidad: 1,
    urgencia: 'media',
    justificacion: '',
  };

  const handleSubmit = async (
    values: CreateMedicationRequestBody,
    { resetForm }: any
  ) => {
    try {
      await createMedicationRequest(veterinarianId, values);
      resetForm();
      setSelectedMed(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creando solicitud:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔐 Solicitar Medicamento Controlado
        </h2>
        <p className="text-gray-600 text-sm">
          Complete el formulario para solicitar medicamentos controlados al administrador
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting, isValid }) => (
          <Form className="space-y-6">
            {/* Selector de Medicamento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medicamento <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="nombre"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const medName = e.target.value;
                  setFieldValue('nombre', medName);
                  const med = catalog.find((m) => m.nombre === medName);
                  setSelectedMed(med || null);
                }}
              >
                <option value="">Selecciona un medicamento</option>
                {catalog.map((med) => (
                  <option key={med.id} value={med.nombre}>
                    {med.nombre} - {med.categoria}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="nombre"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Información del medicamento seleccionado */}
            {selectedMed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📋 Información del Medicamento
                </h3>
                <p className="text-sm text-blue-800">
                  <strong>Categoría:</strong> {selectedMed.categoria}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Descripción:</strong> {selectedMed.descripcion}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Presentación:</strong> {selectedMed.presentacion}
                </p>
                {selectedMed.requiereMatricula && (
                  <p className="text-xs text-blue-600 mt-2 font-semibold">
                    ⚠️ Requiere matrícula profesional
                  </p>
                )}
                <p className="text-xs text-red-600 mt-1 font-semibold">
                  {selectedMed.restricciones}
                </p>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <Field
                type="number"
                name="cantidad"
                min="1"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200"
                placeholder="Ej: 5"
              />
              <ErrorMessage
                name="cantidad"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Urgencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nivel de Urgencia <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Field type="radio" name="urgencia" value="baja" className="mr-2" />
                  <span className="text-sm font-medium">
                    🟢 Baja
                  </span>
                </label>
                <label className="flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Field type="radio" name="urgencia" value="media" className="mr-2" />
                  <span className="text-sm font-medium">
                    🟡 Media
                  </span>
                </label>
                <label className="flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Field type="radio" name="urgencia" value="alta" className="mr-2" />
                  <span className="text-sm font-medium">
                    🔴 Alta
                  </span>
                </label>
              </div>
              <ErrorMessage
                name="urgencia"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            {/* Justificación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Justificación (Opcional)
              </label>
              <Field
                as="textarea"
                name="justificacion"
                rows={4}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200"
                placeholder="Explica por qué necesitas este medicamento..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Proporcionar una justificación detallada ayuda a acelerar la aprobación
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '⏳ Enviando...' : '📤 Enviar Solicitud'}
              </button>
              <button
                type="reset"
                onClick={() => setSelectedMed(null)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                🔄 Limpiar
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* Información adicional */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">
          ℹ️ Información Importante
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Las solicitudes serán revisadas por el administrador</li>
          <li>Recibirás un email cuando tu solicitud sea procesada</li>
          <li>Los medicamentos de Lista I requieren justificación obligatoria</li>
          <li>Puedes ver el estado de tus solicitudes en la tabla inferior</li>
        </ul>
      </div>
    </div>
  );
}
