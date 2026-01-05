import { getProductById } from "../../services/product.services";
import AddCartButton from '../../components/AddCartButton/AddCartButton';
import ProductGallery from '../../components/ProductGallery/ProductGallery';

interface ProductDetailProps {
  params: {
    idProduct: string;
  };
}


export default
  async function ProductDetailPage({ params }: ProductDetailProps) {
  const { idProduct } = await params;
  const product = await getProductById(idProduct);

  // Construir array de imágenes: si tiene galería usar esa, sino usar solo la imagen principal
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  return (
    <div className="bg-orange-200  pt-20">
      <div className="pt-6 pb-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="md:grid md:grid-cols-3 md:gap-x-8">

            {/* Galería de imágenes - Izquierda (2 columnas) */}
            <div className="md:col-span-2">
              <ProductGallery images={productImages} productName={product.name} />
            </div>

            {/* Información del producto - Derecha (1 columna) */}
            <div className="mt-8 md:mt-0">
              {/* Título */}
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-4 mt-10">
                {product.name}
              </h1>

              {/* Descripción */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
                <p className="text-base text-gray-700">{product.description}</p>
              </div>

              {/* Stock */}
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  Stock disponible: <span className="font-semibold text-gray-900">{product.stock} unidades</span>
                </p>
              </div>

              {/* Precio y Botón */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <p className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
                  ${product.price}
                </p>
                <AddCartButton product={product} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
