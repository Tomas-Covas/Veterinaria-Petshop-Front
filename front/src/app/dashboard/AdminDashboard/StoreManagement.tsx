'use client';

import { useState } from 'react';
import { IProduct } from '@/src/types';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StoreManagementProps {
  products: IProduct[];
  loading: boolean;
  onProductsChange: () => void;
  userToken?: string;
}

export default function StoreManagement({ products, loading, onProductsChange, userToken }: StoreManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCritical, setShowCritical] = useState(true);
  const [showLow, setShowLow] = useState(true);
  const [showMedium, setShowMedium] = useState(false);
  const [showOk, setShowOk] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    stock: string;
    categoryId: string;
    mainImage: File | null;
    additionalImages: File[];
  }>({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    mainImage: null,
    additionalImages: []
  });

  const filteredProducts = products.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categorizar productos por nivel de stock
  const criticalProducts = filteredProducts.filter(p => p.stock <= 5);
  const lowProducts = filteredProducts.filter(p => p.stock > 5 && p.stock < 12);
  const mediumProducts = filteredProducts.filter(p => p.stock >= 12 && p.stock < 20);
  const okProducts = filteredProducts.filter(p => p.stock >= 20);

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.mainImage) {
      toast.warning('Por favor completa todos los campos obligatorios e incluye una imagen');
      return;
    }

    try {
      setIsCreating(true);
      console.log('🔧 Creando producto con:', {
        name: formData.name,
        price: formData.price,
        stock: formData.stock,
        mainImageName: formData.mainImage?.name,
        additionalImagesCount: formData.additionalImages.length
      });
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', String(Number(formData.price)));
      formDataToSend.append('stock', String(Number(formData.stock)));
      if (formData.categoryId) formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('mainImage', formData.mainImage);
      
      if (formData.additionalImages.length > 0) {
        formData.additionalImages.forEach((file) => {
          formDataToSend.append('additionalImages', file);
        });
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(userToken && { Authorization: `Bearer ${userToken}` }),
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Producto creado:', result);
        toast.success('Producto creado exitosamente');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', mainImage: null, additionalImages: [] });
        onProductsChange();
      } else {
        let errorDetail;
        try {
          errorDetail = await response.json();
        } catch {
          errorDetail = { message: response.statusText };
        }
        console.error('❌ Error del servidor:', errorDetail);
        toast.error(`Error al crear producto: ${errorDetail.message}`);
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error al crear producto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct || !formData.name || !formData.price || !formData.stock) {
      toast.warning('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      if (formData.categoryId) formDataToSend.append('categoryId', formData.categoryId);
      if (formData.mainImage) formDataToSend.append('mainImage', formData.mainImage);
      
      formData.additionalImages.forEach((file) => {
        formDataToSend.append('additionalImages', file);
      });

      const response = await fetch(`${API_URL}/products/${selectedProduct.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          ...(userToken && { Authorization: `Bearer ${userToken}` }),
        },
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Producto actualizado exitosamente');
        setShowEditModal(false);
        setSelectedProduct(null);
        setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', mainImage: null, additionalImages: [] });
        onProductsChange();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al actualizar producto');
      }
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      toast.error('Error al actualizar producto');
    }
  };

  const handleDeleteProduct = async (productId: string | number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...(userToken && { Authorization: `Bearer ${userToken}` }),
        },
      });

      if (response.ok) {
        toast.success('Producto eliminado exitosamente');
        onProductsChange();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const openEditModal = (product: IProduct) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: '',
      mainImage: null,
      additionalImages: []
    });
    setShowEditModal(true);
  };

  const getImageSrc = (image: string | any) => {
    if (!image) return 'https://placehold.co/400x400/f59e0b/white?text=Sin+Imagen';
    if (typeof image === 'string') {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      } else {
        return `${API_URL}${image}`;
      }
    }
    return image;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-linear-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          ➕ Crear Producto
        </button>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border-2 border-amber-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
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
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Vista de Productos */}
      <div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Productos Críticos (0-5) */}
            {criticalProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-red-300">
                <button
                  onClick={() => setShowCritical(!showCritical)}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚨</span>
                    <h3 className="text-lg font-bold text-red-700">
                      Stock Crítico ({criticalProducts.length})
                    </h3>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-red-700 transition-transform ${showCritical ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCritical && (
                  <div className="p-4 space-y-3 border-t border-red-200">
                    {criticalProducts.map((product) => (
              <div key={product.id} className={`bg-linear-to-r from-white ${
                product.stock <= 5 ? 'to-red-100 border-2 border-red-600 shadow-lg' :
                product.stock <= 12 ? 'to-red-50 border-2 border-red-400 shadow-lg' :
                product.stock < 20 ? 'to-yellow-50 border-2 border-yellow-400 shadow-md' :
                'to-green-50 border border-green-300'
              } rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 hover:border-orange-400`}>
                {/* Alerta de stock según rangos */}
                {product.stock >= 20 && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span className="font-bold">¡Stock OK!</span>
                  </div>
                )}
                {product.stock >= 12 && product.stock < 20 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold">¡Quedan pocas unidades!</span>
                  </div>
                )}
                {product.stock >= 6 && product.stock < 12 && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    <span className="font-bold">¡Necesita reposición urgente!</span>
                  </div>
                )}
                {product.stock > 0 && product.stock < 6 && (
                  <div className="bg-red-200 border-l-4 border-red-700 text-red-900 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    <span className="font-bold">¡CRÍTICO! - Stock muy bajo</span>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="bg-red-300 border-l-4 border-red-800 text-red-950 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🛑</span>
                    <span className="font-bold">¡SIN STOCK! - Reponer inmediatamente</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  {/* Imagen y nombre del producto */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 border-amber-200">
                      <img
                        src={getImageSrc(product.imgUrl || product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase">Producto</p>
                      <p className="font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600 truncate">{product.description}</p>
                    </div>
                  </div>

                  {/* ID del producto */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">ID</p>
                    <p className="text-sm font-mono text-gray-700">
                      {typeof product.id === 'string' ? product.id.slice(0, 8) : product.id}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">Stock</p>
                    <p className={`text-lg font-bold ${
                      product.stock >= 20 ? 'text-green-600' :
                      product.stock >= 12 ? 'text-yellow-600' :
                      product.stock >= 6 ? 'text-orange-600' :
                      product.stock > 0 ? 'text-red-600' :
                      'text-red-800'
                    }`}>
                      {product.stock}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="text-right border-l border-gray-200 pl-4 shrink-0">
                    <p className="text-xs text-gray-500 uppercase">Precio</p>
                    <p className="text-xl font-bold text-amber-600">
                      ${typeof product.price === 'number' ? product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : product.price}
                    </p>
                  </div>

                  {/* Estado del stock */}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 ${
                    product.stock >= 20 ? 'bg-green-100 text-green-800' :
                    product.stock >= 12 ? 'bg-yellow-100 text-yellow-800' :
                    product.stock >= 6 ? 'bg-orange-100 text-orange-800' :
                    product.stock > 0 ? 'bg-red-100 text-red-800' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {product.stock >= 20 ? 'Stock OK' :
                     product.stock >= 12 ? 'Stock Medio' :
                     product.stock >= 6 ? 'Reponer' :
                     product.stock > 0 ? 'Crítico' :
                     'Sin Stock'}
                  </span>

                  {/* Botones de acción */}
                  <div className="flex gap-2 shrink-0 border-l border-gray-200 pl-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Productos Stock Bajo (6-11) */}
            {lowProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300">
                <button
                  onClick={() => setShowLow(!showLow)}
                  className="w-full flex items-center justify-between p-4 hover:bg-orange-50 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-lg font-bold text-orange-700">
                      Stock Bajo ({lowProducts.length})
                    </h3>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-orange-700 transition-transform ${showLow ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLow && (
                  <div className="p-4 space-y-3 border-t border-orange-200">
                    {lowProducts.map((product) => (
              <div key={product.id} className={`bg-linear-to-r from-white ${
                product.stock <= 5 ? 'to-red-100 border-2 border-red-600 shadow-lg' :
                product.stock <= 12 ? 'to-red-50 border-2 border-red-400 shadow-lg' :
                product.stock < 20 ? 'to-yellow-50 border-2 border-yellow-400 shadow-md' :
                'to-green-50 border border-green-300'
              } rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 hover:border-orange-400`}>
                {/* Alerta de stock según rangos */}
                {product.stock >= 20 && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span className="font-bold">¡Stock OK!</span>
                  </div>
                )}
                {product.stock >= 12 && product.stock < 20 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold">¡Quedan pocas unidades!</span>
                  </div>
                )}
                {product.stock >= 6 && product.stock < 12 && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    <span className="font-bold">¡Necesita reposición urgente!</span>
                  </div>
                )}
                {product.stock > 0 && product.stock < 6 && (
                  <div className="bg-red-200 border-l-4 border-red-700 text-red-900 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    <span className="font-bold">¡CRÍTICO! - Stock muy bajo</span>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="bg-red-300 border-l-4 border-red-800 text-red-950 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🛑</span>
                    <span className="font-bold">¡SIN STOCK! - Reponer inmediatamente</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  {/* Imagen y nombre del producto */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 border-amber-200">
                      <img
                        src={getImageSrc(product.imgUrl || product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase">Producto</p>
                      <p className="font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600 truncate">{product.description}</p>
                    </div>
                  </div>

                  {/* ID del producto */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">ID</p>
                    <p className="text-sm font-mono text-gray-700">
                      {typeof product.id === 'string' ? product.id.slice(0, 8) : product.id}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">Stock</p>
                    <p className={`text-lg font-bold ${
                      product.stock >= 20 ? 'text-green-600' :
                      product.stock >= 12 ? 'text-yellow-600' :
                      product.stock >= 6 ? 'text-orange-600' :
                      product.stock > 0 ? 'text-red-600' :
                      'text-red-800'
                    }`}>
                      {product.stock}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="text-right border-l border-gray-200 pl-4 shrink-0">
                    <p className="text-xs text-gray-500 uppercase">Precio</p>
                    <p className="text-xl font-bold text-amber-600">
                      ${typeof product.price === 'number' ? product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : product.price}
                    </p>
                  </div>

                  {/* Estado del stock */}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 ${
                    product.stock >= 20 ? 'bg-green-100 text-green-800' :
                    product.stock >= 12 ? 'bg-yellow-100 text-yellow-800' :
                    product.stock >= 6 ? 'bg-orange-100 text-orange-800' :
                    product.stock > 0 ? 'bg-red-100 text-red-800' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {product.stock >= 20 ? 'Stock OK' :
                     product.stock >= 12 ? 'Stock Medio' :
                     product.stock >= 6 ? 'Reponer' :
                     product.stock > 0 ? 'Crítico' :
                     'Sin Stock'}
                  </span>

                  {/* Botones de acción */}
                  <div className="flex gap-2 shrink-0 border-l border-gray-200 pl-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Productos Stock Medio (12-19) */}
            {mediumProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-300">
                <button
                  onClick={() => setShowMedium(!showMedium)}
                  className="w-full flex items-center justify-between p-4 hover:bg-yellow-50 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <h3 className="text-lg font-bold text-yellow-700">
                      Stock Medio ({mediumProducts.length})
                    </h3>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-yellow-700 transition-transform ${showMedium ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMedium && (
                  <div className="p-4 space-y-3 border-t border-yellow-200">
                    {mediumProducts.map((product) => (
              <div key={product.id} className={`bg-linear-to-r from-white ${
                product.stock <= 5 ? 'to-red-100 border-2 border-red-600 shadow-lg' :
                product.stock <= 12 ? 'to-red-50 border-2 border-red-400 shadow-lg' :
                product.stock < 20 ? 'to-yellow-50 border-2 border-yellow-400 shadow-md' :
                'to-green-50 border border-green-300'
              } rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 hover:border-orange-400`}>
                {/* Alerta de stock según rangos */}
                {product.stock >= 20 && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span className="font-bold">¡Stock OK!</span>
                  </div>
                )}
                {product.stock >= 12 && product.stock < 20 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold">¡Quedan pocas unidades!</span>
                  </div>
                )}
                {product.stock >= 6 && product.stock < 12 && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    <span className="font-bold">¡Necesita reposición urgente!</span>
                  </div>
                )}
                {product.stock > 0 && product.stock < 6 && (
                  <div className="bg-red-200 border-l-4 border-red-700 text-red-900 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    <span className="font-bold">¡CRÍTICO! - Stock muy bajo</span>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="bg-red-300 border-l-4 border-red-800 text-red-950 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🛑</span>
                    <span className="font-bold">¡SIN STOCK! - Reponer inmediatamente</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  {/* Imagen y nombre del producto */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 border-amber-200">
                      <img
                        src={getImageSrc(product.imgUrl || product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase">Producto</p>
                      <p className="font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600 truncate">{product.description}</p>
                    </div>
                  </div>

                  {/* ID del producto */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">ID</p>
                    <p className="text-sm font-mono text-gray-700">
                      {typeof product.id === 'string' ? product.id.slice(0, 8) : product.id}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">Stock</p>
                    <p className={`text-lg font-bold ${
                      product.stock >= 20 ? 'text-green-600' :
                      product.stock >= 12 ? 'text-yellow-600' :
                      product.stock >= 6 ? 'text-orange-600' :
                      product.stock > 0 ? 'text-red-600' :
                      'text-red-800'
                    }`}>
                      {product.stock}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="text-right border-l border-gray-200 pl-4 shrink-0">
                    <p className="text-xs text-gray-500 uppercase">Precio</p>
                    <p className="text-xl font-bold text-amber-600">
                      ${typeof product.price === 'number' ? product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : product.price}
                    </p>
                  </div>

                  {/* Estado del stock */}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 ${
                    product.stock >= 20 ? 'bg-green-100 text-green-800' :
                    product.stock >= 12 ? 'bg-yellow-100 text-yellow-800' :
                    product.stock >= 6 ? 'bg-orange-100 text-orange-800' :
                    product.stock > 0 ? 'bg-red-100 text-red-800' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {product.stock >= 20 ? 'Stock OK' :
                     product.stock >= 12 ? 'Stock Medio' :
                     product.stock >= 6 ? 'Reponer' :
                     product.stock > 0 ? 'Crítico' :
                     'Sin Stock'}
                  </span>

                  {/* Botones de acción */}
                  <div className="flex gap-2 shrink-0 border-l border-gray-200 pl-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Productos Stock OK (20+) */}
            {okProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-green-300">
                <button
                  onClick={() => setShowOk(!showOk)}
                  className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <h3 className="text-lg font-bold text-green-700">
                      Stock OK ({okProducts.length})
                    </h3>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-green-700 transition-transform ${showOk ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showOk && (
                  <div className="p-4 space-y-3 border-t border-green-200">
                    {okProducts.map((product) => (
              <div key={product.id} className={`bg-linear-to-r from-white ${
                product.stock <= 5 ? 'to-red-100 border-2 border-red-600 shadow-lg' :
                product.stock <= 12 ? 'to-red-50 border-2 border-red-400 shadow-lg' :
                product.stock < 20 ? 'to-yellow-50 border-2 border-yellow-400 shadow-md' :
                'to-green-50 border border-green-300'
              } rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 hover:border-orange-400`}>
                {/* Alerta de stock según rangos */}
                {product.stock >= 20 && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span className="font-bold">¡Stock OK!</span>
                  </div>
                )}
                {product.stock >= 12 && product.stock < 20 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold">¡Quedan pocas unidades!</span>
                  </div>
                )}
                {product.stock >= 6 && product.stock < 12 && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    <span className="font-bold">¡Necesita reposición urgente!</span>
                  </div>
                )}
                {product.stock > 0 && product.stock < 6 && (
                  <div className="bg-red-200 border-l-4 border-red-700 text-red-900 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    <span className="font-bold">¡CRÍTICO! - Stock muy bajo</span>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="bg-red-300 border-l-4 border-red-800 text-red-950 p-3 mb-4 rounded-r-lg flex items-center gap-2">
                    <span className="text-xl">🛑</span>
                    <span className="font-bold">¡SIN STOCK! - Reponer inmediatamente</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  {/* Imagen y nombre del producto */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="shrink-0 w-20 h-20 bg-white rounded-lg overflow-hidden border-2 border-amber-200">
                      <img
                        src={getImageSrc(product.imgUrl || product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase">Producto</p>
                      <p className="font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600 truncate">{product.description}</p>
                    </div>
                  </div>

                  {/* ID del producto */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">ID</p>
                    <p className="text-sm font-mono text-gray-700">
                      {typeof product.id === 'string' ? product.id.slice(0, 8) : product.id}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="shrink-0 border-l border-gray-200 pl-4">
                    <p className="text-xs text-gray-500 uppercase">Stock</p>
                    <p className={`text-lg font-bold ${
                      product.stock >= 20 ? 'text-green-600' :
                      product.stock >= 12 ? 'text-yellow-600' :
                      product.stock >= 6 ? 'text-orange-600' :
                      product.stock > 0 ? 'text-red-600' :
                      'text-red-800'
                    }`}>
                      {product.stock}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="text-right border-l border-gray-200 pl-4 shrink-0">
                    <p className="text-xs text-gray-500 uppercase">Precio</p>
                    <p className="text-xl font-bold text-amber-600">
                      ${typeof product.price === 'number' ? product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : product.price}
                    </p>
                  </div>

                  {/* Estado del stock */}
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 ${
                    product.stock >= 20 ? 'bg-green-100 text-green-800' :
                    product.stock >= 12 ? 'bg-yellow-100 text-yellow-800' :
                    product.stock >= 6 ? 'bg-orange-100 text-orange-800' :
                    product.stock > 0 ? 'bg-red-100 text-red-800' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {product.stock >= 20 ? 'Stock OK' :
                     product.stock >= 12 ? 'Stock Medio' :
                     product.stock >= 6 ? 'Reponer' :
                     product.stock > 0 ? 'Crítico' :
                     'Sin Stock'}
                  </span>

                  {/* Botones de acción */}
                  <div className="flex gap-2 shrink-0 border-l border-gray-200 pl-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Crear Producto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-linear-to-br from-amber-900/40 via-orange-900/40 to-amber-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', mainImage: null, additionalImages: [] });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                    placeholder="20.99"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen Principal * (.jpg, .png, .webp)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                />
                {formData.mainImage && (
                  <p className="text-xs text-green-600 mt-1">✓ Archivo seleccionado: {formData.mainImage.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Imágenes Adicionales (opcional) (.jpg, .png, .webp)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData({ ...formData, additionalImages: files });
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                />
                {formData.additionalImages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-green-600">✓ {formData.additionalImages.length} imagen(es) adicional(es) seleccionada(s):</p>
                    {formData.additionalImages.map((file, index) => (
                      <p key={index} className="text-xs text-gray-600 ml-4">• {file.name}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateProduct}
                  disabled={isCreating}
                  className="flex-1 bg-linear-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creando...' : 'Crear Producto'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', mainImage: null, additionalImages: [] });
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Producto */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-linear-to-br from-amber-900/40 via-orange-900/40 to-amber-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Editar Producto</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', mainImage: null, additionalImages: [] });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                    placeholder="20.99"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Imagen Principal (opcional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                />
                {formData.mainImage && (
                  <p className="text-xs text-green-600 mt-1">✓ Archivo seleccionado: {formData.mainImage.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nuevas Imágenes Adicionales (opcional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData({ ...formData, additionalImages: files });
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                />
                {formData.additionalImages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-green-600">✓ {formData.additionalImages.length} imagen(es) adicional(es) seleccionada(s):</p>
                    {formData.additionalImages.map((file, index) => (
                      <p key={index} className="text-xs text-gray-600 ml-4">• {file.name}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Imagen actual */}
              {(selectedProduct.imgUrl || selectedProduct.image) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen Actual</label>
                  <img
                    src={getImageSrc(selectedProduct.imgUrl || selectedProduct.image)}
                    alt={selectedProduct.name}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateProduct}
                  className="flex-1 bg-linear-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', mainImage: null, additionalImages: [] });
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
