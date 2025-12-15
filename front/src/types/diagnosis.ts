/**
 * Enum de diagnósticos que coincide con el backend (DiagnosisType)
 * Estos valores están disponibles automáticamente en el sistema
 * cuando se crea un registro médico.
 */
export enum DiagnosisType {
  PARVOVIROSIS_CANINA = 'Parvovirosis Canina',
  MOQUILLO = 'Moquillo',
  DERMATITIS_ALERGICA = 'Dermatitis Alérgica',
  GASTROENTERITIS = 'Gastroenteritis',
  OTITIS_EXTERNA = 'Otitis Externa',
  ENFERMEDAD_PERIODONTAL = 'Enfermedad Periodontal',
  CONJUNTIVITIS = 'Conjuntivitis',
  PARASITOS_INTESTINALES = 'Parásitos Intestinales',
  ARTROSIS = 'Artrosis',
  CONTROL_DE_RUTINA = 'Control de Rutina',
  INFECCION_RESPIRATORIA = 'Infección Respiratoria',
  FRACTURA = 'Fractura',
  LEISHMANIASIS = 'Leishmaniasis',
  INSUFICIENCIA_RENAL = 'Insuficiencia Renal',
  DIABETES = 'Diabetes',
  PROBLEMAS_CARDIACOS = 'Problemas Cardiacos',
  INTOXICACION = 'Intoxicación',
  ALERGIA_ALIMENTARIA = 'Alergia Alimentaria',
  SARNA = 'Sarna',
  HERIDAS = 'Heridas',
  OTRO = 'Otro'
}

/**
 * Lista de diagnósticos con emojis para el formulario
 */
export const DIAGNOSIS_OPTIONS = [
  { value: DiagnosisType.PARVOVIROSIS_CANINA, label: '🦠 Parvovirosis Canina', icon: '🦠' },
  { value: DiagnosisType.MOQUILLO, label: '🤒 Moquillo', icon: '🤒' },
  { value: DiagnosisType.DERMATITIS_ALERGICA, label: '🐾 Dermatitis Alérgica', icon: '🐾' },
  { value: DiagnosisType.GASTROENTERITIS, label: '🤢 Gastroenteritis', icon: '🤢' },
  { value: DiagnosisType.OTITIS_EXTERNA, label: '👂 Otitis Externa', icon: '👂' },
  { value: DiagnosisType.ENFERMEDAD_PERIODONTAL, label: '🦷 Enfermedad Periodontal', icon: '🦷' },
  { value: DiagnosisType.CONJUNTIVITIS, label: '👁️ Conjuntivitis', icon: '👁️' },
  { value: DiagnosisType.PARASITOS_INTESTINALES, label: '🪱 Parásitos Intestinales', icon: '🪱' },
  { value: DiagnosisType.ARTROSIS, label: '🦴 Artrosis', icon: '🦴' },
  { value: DiagnosisType.INFECCION_RESPIRATORIA, label: '🫁 Infección Respiratoria', icon: '🫁' },
  { value: DiagnosisType.FRACTURA, label: '💔 Fractura', icon: '💔' },
  { value: DiagnosisType.LEISHMANIASIS, label: '🦟 Leishmaniasis', icon: '🦟' },
  { value: DiagnosisType.INSUFICIENCIA_RENAL, label: '🫘 Insuficiencia Renal', icon: '🫘' },
  { value: DiagnosisType.DIABETES, label: '🩸 Diabetes', icon: '🩸' },
  { value: DiagnosisType.PROBLEMAS_CARDIACOS, label: '❤️ Problemas Cardiacos', icon: '❤️' },
  { value: DiagnosisType.INTOXICACION, label: '☠️ Intoxicación', icon: '☠️' },
  { value: DiagnosisType.ALERGIA_ALIMENTARIA, label: '🍖 Alergia Alimentaria', icon: '🍖' },
  { value: DiagnosisType.SARNA, label: '🦠 Sarna', icon: '🦠' },
  { value: DiagnosisType.HERIDAS, label: '🩹 Heridas', icon: '🩹' },
  { value: DiagnosisType.CONTROL_DE_RUTINA, label: '✅ Control de Rutina', icon: '✅' },
  { value: DiagnosisType.OTRO, label: '📋 Otro', icon: '📋' },
] as const;

/**
 * Obtiene el emoji correspondiente a un diagnóstico
 */
export function getDiagnosisIcon(diagnosis: string): string {
  const option = DIAGNOSIS_OPTIONS.find(opt => opt.value === diagnosis);
  return option?.icon || '📋';
}

/**
 * Obtiene el label completo (con emoji) de un diagnóstico
 */
export function getDiagnosisLabel(diagnosis: string): string {
  const option = DIAGNOSIS_OPTIONS.find(opt => opt.value === diagnosis);
  return option?.label || diagnosis;
}
