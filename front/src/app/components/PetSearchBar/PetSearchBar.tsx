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
  const [results, setResults] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const token = localStorage.getItem('authToken') || '';
      let pets = await searchPets(searchQuery, token);
      
      // Aplicar filtros si existen
      if (filters) {
        pets = pets.filter((pet: any) => {
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
            
            // Ordenar por fecha más reciente
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
      }
      
      setResults(pets);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-ejecutar búsqueda cuando cambien los filtros
  useEffect(() => {
    if (query.trim().length >= 2) {
      handleSearch(query);
    }
  }, [filters]);

  const handleSelectPet = (pet: Pet) => {
    onSelectPet(pet);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar mascota por nombre o ID..."
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
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border-2 border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((pet) => (
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
              No se encontraron mascotas con ese nombre o ID
            </div>
          )}
        </div>
      )}
    </div>
  );
}
