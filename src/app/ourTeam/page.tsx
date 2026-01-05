import OurTeamClient from "./OurTeamClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function OurTeam() {
  let vets = [];

  try {
    // Obtener veterinarios del backend
    const response = await fetch(`${API_URL}/veterinarians`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📦 [SERVER] Veterinarios del backend:', data);
      vets = Array.isArray(data) ? data : data.data || [];
      console.log('👥 [SERVER] Primer veterinario:', vets[0]);
    } else {
      console.log('No se pudieron cargar veterinarios del backend');
    }
  } catch (error) {
    console.error('Error al cargar veterinarios:', error);
  }

  // Convertir a formato IVeterinarian y filtrar solo activos
  const formattedVets = vets
    .filter((vet: any) => vet.isActive !== false) // Mostrar solo veterinarios activos
    .map((vet: any) => {
      console.log(`🔍 [SERVER] Mapeando: ${vet.name}, profileImageUrl: ${vet.profileImageUrl}`);
      return {
        id: vet.id,
        name: vet.name,
        email: vet.email || '',
        matricula: vet.matricula || '',
        description: vet.description || 'Veterinario profesional',
        phone: vet.phone || '',
        time: vet.time || new Date().toISOString(),
        isActive: vet.isActive !== undefined ? vet.isActive : true,
        specialty: vet.specialty || 'Veterinaria General',
        experience: vet.experience || 5,
        image: vet.profileImageUrl || vet.image || undefined,
        available: vet.isActive !== false,
      };
    });

  console.log('✅ [SERVER] Veterinarios formateados:', formattedVets.length);
  console.log('🖼️ [SERVER] Primer vet con imagen:', formattedVets.find((v: any) => v.image));

  return <OurTeamClient initialVets={formattedVets} />;
}
