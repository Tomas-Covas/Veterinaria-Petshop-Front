import { IPet, IPetUpdate } from "@/src/types";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  image:string | ''
  appointments: Appointment[]
}

export interface Appointment {
  id: string
  date: string
  veterinarian: string
  service: string
  status: 'completed' | 'scheduled' | 'cancelled'
}

export interface NewPetData {
  nombre: string
  especie: "PERRO" | "GATO" | "AVE" | "ROEDOR" | "REPTIL" | "OTRO"
  sexo: 'MACHO' | 'HEMBRA'
  tamano: 'PEQUENO' | 'MEDIANO' | 'GRANDE'
  esterilizado: 'SI' | 'NO'
  status: 'VIVO' | 'FALLECIDO'
  fecha_nacimiento: string
  breed: string
  ownerId: string
}

export const createPet = async (petData: NewPetData, userId: string): Promise<IPet | null> => {

  try {
    console.log("📦 Enviando mascota:", petData);
    petData.ownerId = userId
    const response = await fetch(`${API_URL}/pets/NewPet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData),
    });

    if (!response.ok) {
      const errorText = await response.text()
      toast.error('No se pudo crear la mascota, intente nuevamente')
      throw new Error(`Error al crear la mascota: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return result.data || result;

  } catch (error) {
    toast.error('No se pudo crear la mascota, intente nuevamente')
    return null;
  }
};

export const getUserPets = async (userId: string) => {
  const res = await fetch(`${API_URL}/users/${userId}/pets`);
  if (!res.ok) throw new Error("Error al obtener mascotas");
  const result = await res.json();
  return result as IPet[];
};


export const deletePet = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/pets/${id}`, {
    method: 'PUT',
    credentials: 'include',
  })
    if (!res.ok) throw new Error('Error al eliminar la mascota')
      toast.success('Mascota eliminada con éxito')
    } catch (err: any) {
      toast.error(err.message)
    }
}

export async function updatePet(id: string, updatedData: IPetUpdate) {
  // Sanitizar datos: convertir undefined en null
  const safeBody = JSON.stringify(updatedData, (_, value) =>
    typeof value === "undefined" ? null : value
  )

  try {
    const res = await fetch(`${API_URL}/pets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: safeBody,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText || "Error al modificar la mascota")
    }

    return await res.json() // devuelve { data }
  } catch (err) {
    throw err
  }
}

export async function updatePetImage(id: string, file: File) {
  const formData = new FormData()
  formData.append("image", file)

  try {
    const res = await fetch(`${API_URL}/pets/${id}`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText || "Error al actualizar la imagen")
    }

    return await res.json();
  } catch (err) {
    throw err
  }
}

export const searchPets = async (query: string, token: string): Promise<Pet[]> => {
  try {
    console.log('🔍 Buscando mascotas (searchPets):', query);
    
    // Primero intentar obtener todas las mascotas de usuarios
    console.log('🔍 Intentando obtener mascotas desde /users...');
    
    try {
      const usersResponse = await fetch(`${API_URL}/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Respuesta de /users:', usersData);
        
        // Extraer todas las mascotas de todos los usuarios
        const users = usersData.data || usersData.users || usersData || [];
        let allPets: any[] = [];
        
        if (Array.isArray(users)) {
          users.forEach((user: any) => {
            if (user.pets && Array.isArray(user.pets)) {
              // El backend ya envía los appointments correctamente asociados a cada mascota
              // dentro de pet.appointments, no es necesario filtrarlos
              allPets = allPets.concat(user.pets);
            }
          });
        }
        
        console.log(`📊 Total mascotas encontradas en /users: ${allPets.length}`);
        
        // Filtrar por query
        if (allPets.length > 0) {
          const lowerQuery = query.toLowerCase();
          const filtered = allPets.filter((pet: any) => 
            pet.nombre?.toLowerCase().includes(lowerQuery) ||
            pet.name?.toLowerCase().includes(lowerQuery) ||
            pet.breed?.toLowerCase().includes(lowerQuery) ||
            pet.especie?.toLowerCase().includes(lowerQuery) ||
            pet.species?.toLowerCase().includes(lowerQuery) ||
            pet.id?.toLowerCase().includes(lowerQuery)
          );
          
          if (filtered.length > 0) {
            console.log(`✅ ${filtered.length} mascotas encontradas después de filtrar`);
            return filtered;
          }
        }
      }
    } catch (usersError) {
      console.log('⚠️ Error al buscar en /users, intentando con medical-records...');
    }
    
    // Si /users no funciona, intentar con medical-records
    console.log('🔍 Intentando con /medical-records-pet/search/pets...');
    const response = await fetch(`${API_URL}/medical-records-pet/search/pets?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Respuesta de medical-records:', result);
      
      const pets = result.data || result.pets || result || [];
      
      if (Array.isArray(pets) && pets.length > 0) {
        console.log(`✅ ${pets.length} mascotas encontradas en medical-records`);
        return pets;
      }
    }
    
    // Si ninguno funciona, usar MOCK
    console.log('⚠️ No se encontraron mascotas en ningún endpoint. Usando datos MOCK');
    return getMockPets(query);
    
  } catch (error) {
    console.error('❌ Error en searchPets:', error);
    console.log('⚠️ Usando datos MOCK como fallback');
    return getMockPets(query);
  }
};

// MOCK DATA helper - Solo para desarrollo/fallback
const getMockPets = (query: string): Promise<Pet[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPets: Pet[] = [
        {
          id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
          name: 'Max',
          species: 'Perro',
          breed: 'Golden Retriever',
          age: 5,
          image:"",
          appointments: [
            {
              id: 'apt-001',
              date: '2025-11-15',
              veterinarian: 'Dr. García',
              service: 'Control anual',
              status: 'completed'
            },
            {
              id: 'apt-002',
              date: '2025-12-10',
              veterinarian: 'Dr. García',
              service: 'Vacunación antirrábica',
              status: 'scheduled'
            }
          ]
        },
        {
          id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
          name: 'Luna',
          species: 'Gato',
          breed: 'Siamés',
          age: 3,
          image:"",
          appointments: [
            {
              id: 'apt-003',
              date: '2025-10-20',
              veterinarian: 'Dra. Martínez',
              service: 'Desparasitación',
              status: 'completed'
            },
            {
              id: 'apt-004',
              date: '2025-12-15',
              veterinarian: 'Dra. Martínez',
              service: 'Control general',
              status: 'scheduled'
            }
          ]
        },
        {
          id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
          name: 'Rocky',
          species: 'Perro',
          breed: 'Pastor Alemán',
          age: 7,
          image:"",
          appointments: [
            {
              id: 'apt-005',
              date: '2025-11-30',
              veterinarian: 'Dr. López',
              service: 'Chequeo de cadera',
              status: 'completed'
            }
          ]
        },
        {
          id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
          name: 'Michi',
          species: 'Gato',
          breed: 'Persa',
          age: 2,
          image:"",
          appointments: [
            {
              id: 'apt-006',
              date: '2025-12-05',
              veterinarian: 'Dra. Sánchez',
              service: 'Limpieza dental',
              status: 'completed'
            }
          ]
        },
        {
          id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
          name: 'Toby',
          species: 'Perro',
          breed: 'Beagle',
          age: 4,
          image:"",
          appointments: []
        },
        {
          id: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
          name: 'Manchas',
          species: 'Gato',
          breed: 'Angora',
          age: 6,
          image:"",
          appointments: [
            {
              id: 'apt-007',
              date: '2025-11-25',
              veterinarian: 'Dr. Fernández',
              service: 'Vacunación triple felina',
              status: 'completed'
            },
            {
              id: 'apt-008',
              date: '2025-12-20',
              veterinarian: 'Dr. Fernández',
              service: 'Control post-vacunación',
              status: 'scheduled'
            }
          ]
        }
      ];

      // Filtrar resultados según la query
      const filtered = mockPets.filter(pet => 
        pet.name.toLowerCase().includes(query.toLowerCase()) ||
        pet.id.toLowerCase().includes(query.toLowerCase()) ||
        pet.species.toLowerCase().includes(query.toLowerCase()) ||
        pet.breed.toLowerCase().includes(query.toLowerCase())
      );

      resolve(filtered);
    }, 500); // Simular delay de red
  });
};

// Obtener historial médico completo de una mascota
export const getPetMedicalHistory = async (petId: string, token: string): Promise<any> => {
  try {
    console.log('📋 Obteniendo historial médico de mascota:', petId);
    
    const response = await fetch(`${API_URL}/medical-records-pet/pet/${petId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.error('❌ Error al obtener historial médico:', response.status);
      // Fallback a MOCK en caso de error
      return getMockMedicalHistory(petId);
    }
    
    const result = await response.json();
    console.log('✅ Historial médico obtenido:', result);
    
    // El backend puede devolver {data: Array} o directamente Array
    return result.data || result.records || result.medicalRecords || result;
  } catch (error) {
    console.error('❌ Error en getPetMedicalHistory:', error);
    // Fallback a MOCK en caso de error
    return getMockMedicalHistory(petId);
  }
};

// MOCK DATA helper - Solo para desarrollo/fallback
const getMockMedicalHistory = (petId: string): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockHistories: { [key: string]: any } = {
        '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p': {
          petId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
          petName: 'Max',
          vaccinations: [
            {
              name: 'Vacuna Antirrábica',
              date: '2024-12-10',
              nextDue: '2025-12-10'
            },
            {
              name: 'Vacuna Séxtuple',
              date: '2024-11-15',
              nextDue: '2025-11-15'
            }
          ],
          notes: 'Paciente con historial de alergias alimentarias. Evitar pollo en la dieta. Última revisión mostró excelente condición física.',
          allergies: ['Pollo', 'Maíz'],
          medications: [
            {
              name: 'Antihistamínico',
              dosage: '10mg cada 12 horas',
              duration: 'Según necesidad'
            }
          ]
        },
        '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q': {
          petId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
          petName: 'Luna',
          vaccinations: [
            {
              name: 'Triple Felina',
              date: '2024-10-20',
              nextDue: '2025-10-20'
            }
          ],
          notes: 'Gata muy sociable y activa. Se recomienda seguimiento semestral. Peso ideal mantenido.',
          allergies: [],
          medications: []
        },
        '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r': {
          petId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
          petName: 'Rocky',
          vaccinations: [
            {
              name: 'Vacuna Antirrábica',
              date: '2024-11-01',
              nextDue: '2025-11-01'
            }
          ],
          notes: 'Paciente con displasia de cadera grado leve. Se recomienda control cada 6 meses y ejercicio moderado. Dieta baja en calorías.',
          allergies: [],
          medications: [
            {
              name: 'Condroprotector',
              dosage: '1 tableta diaria',
              duration: 'Tratamiento continuo'
            },
            {
              name: 'Antiinflamatorio',
              dosage: '5mg cada 24 horas',
              duration: '15 días'
            }
          ]
        },
        '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s': {
          petId: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
          petName: 'Michi',
          vaccinations: [
            {
              name: 'Triple Felina',
              date: '2024-09-15',
              nextDue: '2025-09-15'
            }
          ],
          notes: 'Paciente con tendencia a acumulación de sarro dental. Se realizó limpieza completa. Se recomienda dieta dental y revisión anual.',
          allergies: [],
          medications: []
        },
        '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t': {
          petId: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
          petName: 'Toby',
          vaccinations: [],
          notes: 'Paciente nuevo sin historial previo disponible.',
          allergies: [],
          medications: []
        },
        '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u': {
          petId: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
          petName: 'Manchas',
          vaccinations: [
            {
              name: 'Triple Felina',
              date: '2024-11-25',
              nextDue: '2025-11-25'
            },
            {
              name: 'Leucemia Felina',
              date: '2024-11-25',
              nextDue: '2025-11-25'
            }
          ],
          notes: 'Gato de pelo largo, requiere cepillado frecuente. Sin problemas de salud reportados. Excelente condición general.',
          allergies: [],
          medications: []
        }
      };

      const history = mockHistories[petId] || {
        petId,
        vaccinations: [],
        notes: 'No hay información médica disponible para esta mascota.',
        allergies: [],
        medications: []
      };

      resolve(history);
    }, 600); // Simular delay de red
  });
};

// Agregar información al historial médico de una mascota
export interface MedicationUsed {
  medicationId: string;
  medicationName: string;
  medicationType: 'GENERAL' | 'CONTROLLED';
  quantity: number;
  dosage: string;
  duration: string;
  prescriptionNotes?: string;
}

export interface AddMedicalRecordData {
  petId: string;
  veterinarianId: string;
  diagnosis: string;
  treatment: string;
  medications?: string;
  observations?: string;
  nextAppointment?: string;
  vaccinations?: string;
  weight?: number;
  temperature?: number;
  medicationsUsed?: MedicationUsed[];
}

export interface MedicalRecordResponse {
  success?: boolean;
  message: string;
  data?: {
    medicalRecordId: string;
    medicationsUsed?: Array<{
      medicationId: string;
      name: string;
      quantity: number;
      remainingStock: number;
    }>;
    notifications?: Array<{
      id: string;
      type: string;
      medicationId: string;
      message: string;
      isRead: boolean;
      createdAt: string;
    }>;
  };
}

export const addMedicalRecord = async (data: AddMedicalRecordData, token: string): Promise<MedicalRecordResponse> => {
  try {
    console.log('📋 Creando registro médico:', data);
    
    const response = await fetch(`${API_URL}/medical-records-pet`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    console.log('📡 Respuesta addMedicalRecord:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error al crear registro médico:', errorText);
      toast.error('Error al guardar el historial médico');
      return { success: false, message: 'Error al guardar' };
    }
    
    const result = await response.json();
    console.log('✅ Registro médico creado:', result);
    
    // Mostrar notificaciones de medicamentos
    if (result.data?.medicationsUsed && result.data.medicationsUsed.length > 0) {
      const medsUsed = result.data.medicationsUsed;
      toast.success(`✅ ${result.message}. ${medsUsed.length} medicamento(s) descontado(s)`);
      
      // Mostrar info de cada medicamento
      medsUsed.forEach((med: any) => {
        console.log(`💊 ${med.name}: ${med.quantity} usado(s), stock restante: ${med.remainingStock}`);
      });
    } else {
      toast.success(`✅ ${result.message}`);
    }
    
    // Mostrar alertas de stock bajo
    if (result.data?.notifications && result.data.notifications.length > 0) {
      result.data.notifications.forEach((notif: any) => {
        if (notif.type === 'LOW_STOCK') {
          toast.warning(`⚠️ ${notif.message}`);
        }
      });
    }
    
    return { message: result.message, data: result.data };
  } catch (error) {
    console.error('❌ Error en addMedicalRecord:', error);
    toast.error('Error al guardar el historial médico');
    return { success: false, message: 'Error de conexión' };
  }
};

// Buscar mascotas para historiales médicos
export const searchPetsForMedicalRecords = async (query: string, token: string) => {
  try {
    console.log('🔍 Buscando mascotas:', query);
    
    const response = await fetch(`${API_URL}/medical-records-pet/search/pets?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.error('❌ Error al buscar mascotas:', response.status);
      return [];
    }
    
    const result = await response.json();
    console.log('✅ Mascotas encontradas:', result);
    
    // El backend puede devolver {data: Array} o directamente Array
    return result.data || result.pets || result;
  } catch (error) {
    console.error('❌ Error en searchPetsForMedicalRecords:', error);
    return [];
  }
};
