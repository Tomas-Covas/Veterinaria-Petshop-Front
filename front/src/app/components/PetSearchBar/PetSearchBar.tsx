'use client';

import { useState, useEffect } from 'react';
import { searchPets, Pet } from '@/src/app/services/pet.services';

interface PetSearchBarProps {
  onSelectPet: (pet: Pet) => void;
  filters?: {
    especie?: string;
    estado?: string;
    tamano?: string;
    esterilizado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  };
}

export default function PetSearchBar({ onSelectPet, filters }: PetSearchBarProps) {
  const [query, setQuery] = useState('');
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Cargar todas las mascotas al montar el componente
  useEffect(() => {
    const loadAllPets = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken') || '';
        // Buscar con query vacío para obtener todas
        const pets = await searchPets('', token);
        setAllPets(pets);
        setFilteredPets(pets);
        console.log('📋 Mascotas cargadas:', pets.length);
      } catch (error) {
        console.error('Error al cargar mascotas:', error);
        setAllPets([]);
        setFilteredPets([]);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    loadAllPets();
  }, []);

  // Re-aplicar filtros cuando cambien
  useEffect(() => {
    if (query.trim().length >= 0) {
      handleSearch(query);
    }
  }, [filters]);

  // Aplicar filtros adicionales
  const applyFilters = (pets: Pet[]) => {
    if (!filters) return pets;

    return pets.filter((pet: any) => {
      // Filtro por especie
      if (filters.especie && filters.especie !== 'TODOS') {
        if ((pet.especie || pet.species) !== filters.especie) return false;
      }
      
      // Filtro por estado
      if (filters.estado && filters.estado !== 'TODOS') {
        if ((pet.status || pet.estado) !== filters.estado) return false;
      }
      
      // Filtro por tamaño
      if (filters.tamano && filters.tamano !== 'TODOS') {
        if (pet.tamano !== filters.tamano) return false;
      }
      
      // Filtro por esterilización
      if (filters.esterilizado && filters.esterilizado !== 'TODOS') {
        if (pet.esterilizado !== filters.esterilizado) return false;
      }
      
      // Filtro por rango de fechas (últimas consultas)
      if (filters.fechaDesde || filters.fechaHasta) {
        const appointments = pet.appointments || [];
        if (appointments.length === 0) return false;
        
        const sortedAppointments = [...appointments].sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const lastAppointmentDate = sortedAppointments[0]?.date;
        if (!lastAppointmentDate) return false;
        
        const appointmentDate = new Date(lastAppointmentDate);
        
        if (filters.fechaDesde) {
          const desde = new Date(filters.fechaDesde);
          if (appointmentDate < desde) return false;
        }
        
        if (filters.fechaHasta) {
          const hasta = new Date(filters.fechaHasta);
          hasta.setHours(23, 59, 59);
          if (appointmentDate > hasta) return false;
        }
      }
      
      return true;
    });
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowResults(true);

    // Si el query está vacío, mostrar todas las mascotas
    if (searchQuery.trim().length === 0) {
      const filtered = applyFilters(allPets);
      setFilteredPets(filtered);
      return;
    }

    // Filtrar mascotas localmente por búsqueda de texto
    const lowerQuery = searchQuery.toLowerCase();
    const textFiltered = allPets.filter((pet: any) => 
      pet.nombre?.toLowerCase().includes(lowerQuery) ||
      pet.name?.toLowerCase().includes(lowerQuery) ||
      pet.breed?.toLowerCase().includes(lowerQuery) ||
      pet.especie?.toLowerCase().includes(lowerQuery) ||
      pet.species?.toLowerCase().includes(lowerQuery) ||
      pet.id?.toLowerCase().includes(lowerQuery)
    );
    
    // Aplicar filtros adicionales
    const filtered = applyFilters(textFiltered);
    
    setFilteredPets(filtered);
  };

  const handleSelectPet = (pet: Pet) => {
    onSelectPet(pet);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder="Buscar mascota por nombre, raza o ID..."
          className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {!initialLoad && allPets.length > 0 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {filteredPets.length} de {allPets.length}
          </div>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border-2 border-gray-200 max-h-96 overflow-y-auto">
          {initialLoad || loading ? (
            <div className="p-4 text-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              Cargando mascotas...
            </div>
          ) : filteredPets.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-medium">
                {filteredPets.length} mascota{filteredPets.length !== 1 ? 's' : ''} encontrada{filteredPets.length !== 1 ? 's' : ''}
              </div>
              {filteredPets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => handleSelectPet(pet)}
                  className="w-full px-4 py-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {(pet as any).nombre || pet.name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(pet as any).especie || pet.species || 'N/A'} • {pet.breed || 'N/A'} • {pet.age || 'N/A'} años
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ID: {pet.id.slice(0, 8)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-600">
              {query.trim() ? (
                <>
                  <p className="font-medium mb-1">No se encontraron mascotas</p>
                  <p className="text-sm">Intenta con otro término de búsqueda</p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">No hay mascotas registradas</p>
                  <p className="text-sm">Aún no se han registrado mascotas en el sistema</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Cerrar resultados al hacer click fuera */}
      {showResults && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
