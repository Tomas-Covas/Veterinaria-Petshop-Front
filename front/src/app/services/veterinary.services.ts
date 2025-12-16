import { IVeterinary } from "@/src/types";
import carlos from "../../assets/carlos.jpg"
/* import ana from "../../assets/ana.jpg";
import juan from "../../assets/juan.jpg"
import laura from "../../assets/laura.jpg"
import maria from "../../assets/maria.jpg"
import roberto from "../../assets/roberto.jpg" */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Mock de veterinarios para desarrollo (fallback)
/* const MOCK_VETERINARIANS: IVeterinary[] = [
    {
        id: 1,
        name: "Dr. Carlos Mendoza",
        specialty: "Medicina General",
        description: "Especialista en medicina preventiva y tratamiento de enfermedades comunes en mascotas",
        image: carlos,
        experience: 8,
        available: true
    },
    {
        id: 2,
        name: "Dra. María González",
        specialty: "Cirugía Veterinaria",
        description: "Experta en cirugías de tejidos blandos y procedimientos quirúrgicos complejos",
        image: maria,
        experience: 12,
        available: true
    },
    {
        id: 3,
        name: "Dr. Juan Pérez",
        specialty: "Dermatología",
        description: "Especializado en el tratamiento de problemas de piel y alergias en animales",
        image: juan,
        experience: 6,
        available: true
    },
    {
        id: 4,
        name: "Dra. Ana Rodríguez",
        specialty: "Odontología Veterinaria",
        description: "Dedicada a la salud dental y oral de mascotas con técnicas modernas",
        image: ana,
        experience: 10,
        available: true
    },
    {
        id: 5,
        name: "Dr. Roberto Silva",
        specialty: "Cardiología",
        description: "Especialista en diagnóstico y tratamiento de enfermedades cardíacas en animales",
        image: roberto,
        experience: 15,
        available: true
    },
    {
        id: 6,
        name: "Dra. Laura Martínez",
        specialty: "Emergencias",
        description: "Experta en atención de urgencias y cuidados críticos las 24 horas",
        image: laura,
        experience: 7,
        available: true
    }
]; */

const getDefaultSpecialty = () => {
    const specialties = [
        'Medicina General',
        'Cirugía Veterinaria',
        'Dermatología',
        'Odontología Veterinaria',
        'Cardiología',
        'Emergencias'
    ];
    return specialties[Math.floor(Math.random() * specialties.length)];
};

const getDefaultExperience = () => {
    return Math.floor(Math.random() * 10) + 5; // Entre 5 y 14 años
};

export const getAllVeterinarians = async (): Promise<IVeterinary[]> => {
    try {
        const response = await fetch(`${API_URL}/veterinarians`, {
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📦 Respuesta completa del backend:', data);
            const vets = Array.isArray(data) ? data : data.data || [];
            console.log('👥 Primer veterinario (para ver estructura):', vets[0]);
            
            // Filtrar solo veterinarios activos
            return vets.filter((vet: any) => vet.isActive !== false).map((vet: any) => {
                console.log(`🔍 Mapeando veterinario: ${vet.name}, profileImageUrl: ${vet.profileImageUrl}`);
                return {
                    id: vet.id,
                    name: vet.name,
                    specialty: vet.specialty || getDefaultSpecialty(),
                    description: vet.description || `Veterinario profesional especializado en el cuidado de tu mascota`,
                    image: vet.profileImageUrl || vet.image || vet.imgUrl || vet.imageUrl || vet.photo || carlos,
                    experience: vet.experience || getDefaultExperience(),
                    available: vet.isActive !== false,
                    email: vet.email,
                    phone: vet.phone,
                    matricula: vet.matricula,
                };
            });
        }
        
        console.log('⚠️ No se pudieron cargar veterinarios del backend, usando mock');
        return []
    } catch (error) {
        console.error('Error al cargar veterinarios:', error);
        console.log('⚠️ Usando veterinarios mockeados como fallback');
        return []
    }
};

export const getVeterinaryById = async (id: string): Promise<IVeterinary> => {
    try {
        const response = await fetch(`${API_URL}/veterinarians/${id}`, {
            cache: 'no-store',
        });

        if (response.ok) {
            const data = await response.json();
            const vet = data.data || data;
            console.log('📦 Veterinario individual del backend:', vet);
            
            return {
                id: vet.id,
                name: vet.name,
                specialty: vet.specialty || getDefaultSpecialty(),
                description: vet.description || `Veterinario profesional especializado en el cuidado de tu mascota`,
                image: vet.profileImageUrl || vet.image || vet.imgUrl || vet.imageUrl || vet.photo || carlos,
                experience: vet.experience || getDefaultExperience(),
                available: vet.isActive !== false,
                email: vet.email,
                phone: vet.phone,
                matricula: vet.matricula,
            };
        }
        
        throw new Error('Veterinario no encontrado en el backend');
    } catch (error) {
        console.error('Error al cargar veterinario por ID:', error);
        // Fallback al mock
        /* const allVeterinarians = MOCK_VETERINARIANS; */
        /* const veterinary = allVeterinarians.find((vet) => vet.id === Number(id) || vet.id === id);
        if (!veterinary) {
            throw new Error('Veterinario no encontrado');
        }
        return veterinary; */
        return {
      id,
      name: "Veterinario desconocido",
      specialty: getDefaultSpecialty(),
      description: "No se pudo cargar la información del veterinario",
      image: carlos,
      experience: getDefaultExperience(),
      available: false,
      email: "",
      phone: "",
      matricula: "",
    };
    }
};
