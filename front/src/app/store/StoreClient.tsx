'use client';

import { useState, useEffect } from 'react';
import Card from "../components/CardProduct/CardProduct";
import AdminProductCard from "../components/AdminProductCard/AdminProductCard";
import { IProduct, ICategoryBasic } from '@/src/types';
import Image from 'next/image';
import bannerstore from "../../assets/bannerstore.png"
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useRole } from '@/src/hooks/useRole';
import { updateProductPrice } from '@/src/services/product.admin.services';
import { toast } from 'react-toastify';

interface StoreClientProps {
  initialProducts: IProduct[];
  categories: ICategoryBasic[];
}

export default function StoreClient({ initialProducts, categories }: StoreClientProps) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | string | null>(null);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { userData } = useAuth();
  const { isAdmin } = useRole();
  const searchParams = useSearchParams();
  const categoryNameFromUrl = searchParams.get("category");

  // Debug: verificar userData y token
  useEffect(() => {
    console.log('🔐 userData completo:', userData);
    console.log('🔑 Token:', userData?.token);
    console.log('👤 Es admin:', isAdmin());
  }, [userData, isAdmin]);

  const handlePriceUpdate = async (productId: string | number, newPrice: number) => {
    if (!isAdmin()) {
      toast.error('No tienes permisos de administrador');
      return;
    }

    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }

    try {
      // El backend usa las cookies para autenticar, no necesitamos el token
      await updateProductPrice(productId, newPrice, '');
      // Actualizar el producto en el estado local
      setProducts(products.map(p => 
        p.id === productId ? { ...p, price: newPrice } : p
      ));
      toast.success('Precio actualizado exitosamente');
    } catch (error: any) {
      console.error('❌ Error al actualizar precio:', error);
      toast.success(error.message || 'Error al actualizar el precio');
    }
  };

  // Primera carga: si viene category en la URL, setearla
  useEffect(() => {
    if (categoryNameFromUrl) {
      const normalized = categoryNameFromUrl.toLowerCase();
      const found = categories.find(
        c =>(c.name  || '').toLowerCase() === normalized
      );
      if (found) {
        setSelectedCategory(found.id);
        console.log('✅ Categoría desde URL:', found.name);
      }
    }
  }, [categoryNameFromUrl, categories]);

  // Crear mapa de productos por categoría basado en product.categoryId
  const productsByCategory = new Map<string | number, IProduct[]>();
  
  products.forEach(product => {
    // Manejar diferentes nombres de campo para categoryId
    const categoryId = product.categoryId || (product as any).category_id || (product as any).category?.id;
    
    if (categoryId !== undefined && categoryId !== null) {
      if (!productsByCategory.has(categoryId)) {
        productsByCategory.set(categoryId, []);
      }
      productsByCategory.get(categoryId)?.push(product);
    }
  });

  // Debug del mapa de productos por categoría
  useEffect(() => {
    console.log('📊 Productos por categoría:', 
      Array.from(productsByCategory.entries()).map(([id, prods]) => {
        const cat = categories.find(c => c.id === id);
        return `${cat?.name || `ID: ${id}`}: ${prods.length} productos`;
      })
    );
  }, [productsByCategory]);

  // Obtener productos a filtrar
  let productsToFilter: IProduct[] = [];

  if (selectedCategory === null) {
    productsToFilter = products;
  } else {
    productsToFilter = productsByCategory.get(selectedCategory) || [];
  }

  // Aplicar filtros de búsqueda, precio y ordenamiento
  const allFilteredProducts = productsToFilter
    .filter(product => {
      // Filtro de búsqueda
      const matchesSearch = !searchQuery || 
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de precio
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = product.price >= min && product.price <= max;

      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // Manejar nombres null
      const nameA = a.name || 'Sin nombre';
      const nameB = b.name || 'Sin nombre';
      return nameA.localeCompare(nameB);
    });

  // Paginación
  const totalPages = Math.ceil(allFilteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredProducts = allFilteredProducts.slice(startIndex, endIndex);

  // Resetear a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, minPrice, maxPrice, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory(null);
    setSortBy('name');
    setCurrentPage(1);
  };

  // Función para contar productos por categoría
  const getCategoryCount = (categoryId: number | string) => {
    return productsByCategory.get(categoryId)?.length || 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-orange-200 pt-20">
      {/* Banner con imagen */}
      <div className="relative h-[400px] w-full mb-8">
        <Image
          src={bannerstore}
          alt='banner store'
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-orange-500/70 to-amber-500/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Nuestra Tienda</h1>
            <p className="text-xl md:text-2xl">Los mejores productos para tu mascota</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar productos por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-4 rounded-lg border bg-orange-50 border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 placeholder-gray-400"
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">

          {/* Botón para mostrar filtros en mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between"
            >
              <span className="font-medium">Filtros</span>
              <svg className={`w-5 h-5 transform transition ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Sidebar de filtros */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1 mb-8 lg:mb-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-40">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar
                </button>
              </div>

              {/* Filtro por categoría */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categoría</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                      className="mr-2 w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Todas ({products.length})</span>
                  </label>
                  {categories.map(category => {
                    const count = getCategoryCount(category.id);
                    // Solo mostrar categorías que tengan productos
                    if (count === 0) return null;
                    
                    return (
                      <label key={category.id} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.id}
                          onChange={() => setSelectedCategory(category.id)}
                          className="mr-2 w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{category.name} ({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filtro por precio */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Rango de precio</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <span className="text-gray-500">-</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Ordenar por</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="name">Nombre (A-Z)</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="lg:col-span-3">
            {/* Contador de resultados */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, allFilteredProducts.length)}</span> de <span className="font-semibold">{allFilteredProducts.length}</span> productos
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-gray-600">
                  Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
                </p>
              )}
            </div>

            {/* Grid */}
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    isAdmin() ? (
                      <AdminProductCard 
                        key={product.id} 
                        product={product}
                        onPriceUpdate={handlePriceUpdate}
                      />
                    ) : (
                      <Card key={product.id} product={product} />
                    )
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Anterior
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg transition ${currentPage === page
                                  ? 'bg-orange-600 text-white font-semibold'
                                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No se encontraron productos con los filtros seleccionados</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}