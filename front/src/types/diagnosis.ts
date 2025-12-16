/**
 * Enum de diagnósticos - EXACTAMENTE como los acepta el backend
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
  OBESIDAD = 'Obesidad',
  INSUFICIENCIA_RENAL = 'Insuficiencia Renal',
  DIABETES = 'Diabetes',
  ALERGIAS_ALIMENTARIAS = 'Alergias Alimentarias',
  PROBLEMAS_CARDIACOS = 'Problemas Cardíacos',
  EPILEPSIA = 'Epilepsia',
  INFECCION_URINARIA = 'Infección Urinaria',
  TRAUMATISMO = 'Traumatismo',
  INTOXICACION = 'Intoxicación',
  OTRO = 'Otro'
}

/**
 * Lista de diagnósticos con emojis para el formulario
 */
export const DIAGNOSIS_OPTIONS = [
  { value: 'Parvovirosis Canina', label: '🦠 Parvovirosis Canina', icon: '🦠' },
  { value: 'Moquillo', label: '🤒 Moquillo', icon: '🤒' },
  { value: 'Dermatitis Alérgica', label: '🐾 Dermatitis Alérgica', icon: '🐾' },
  { value: 'Gastroenteritis', label: '🤢 Gastroenteritis', icon: '🤢' },
  { value: 'Otitis Externa', label: '👂 Otitis Externa', icon: '👂' },
  { value: 'Enfermedad Periodontal', label: '🦷 Enfermedad Periodontal', icon: '🦷' },
  { value: 'Conjuntivitis', label: '👁️ Conjuntivitis', icon: '👁️' },
  { value: 'Parásitos Intestinales', label: '🪱 Parásitos Intestinales', icon: '🪱' },
  { value: 'Artrosis', label: '🦴 Artrosis', icon: '🦴' },
  { value: 'Control de Rutina', label: '✅ Control de Rutina', icon: '✅' },
  { value: 'Infección Respiratoria', label: '🫁 Infección Respiratoria', icon: '🫁' },
  { value: 'Fractura', label: '💔 Fractura', icon: '💔' },
  { value: 'Obesidad', label: '⚖️ Obesidad', icon: '⚖️' },
  { value: 'Insuficiencia Renal', label: '🫘 Insuficiencia Renal', icon: '🫘' },
  { value: 'Diabetes', label: '🩸 Diabetes', icon: '🩸' },
  { value: 'Alergias Alimentarias', label: '🍖 Alergias Alimentarias', icon: '🍖' },
  { value: 'Problemas Cardíacos', label: '❤️ Problemas Cardíacos', icon: '❤️' },
  { value: 'Epilepsia', label: '🧠 Epilepsia', icon: '🧠' },
  { value: 'Infección Urinaria', label: '💧 Infección Urinaria', icon: '💧' },
  { value: 'Traumatismo', label: '🤕 Traumatismo', icon: '🤕' },
  { value: 'Intoxicación', label: '☠️ Intoxicación', icon: '☠️' },
  { value: 'Otro', label: '📋 Otro', icon: '📋' },
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
