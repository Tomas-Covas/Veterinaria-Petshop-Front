import Link from "next/link";
import MapDisplay from "../map/MapDisplay";


export default function Footer() {
  return (
    <footer className="bg-linear-to-b from-gray-50 to-gray-200 mt-auto py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Columna 1: Información de la tienda */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Huellitas Pet Shop</h3>
          <p className="text-gray-600 text-sm">
            Lo mejor para tu mascota
          </p>
          <p className="text-gray-600 text-sm mt-3 ">
            Adolfo Alsina 2256, Florida, provincia de Buenos Aires
          </p>
        </div>

        {/* Columna 2: Enlaces rápidos */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/store" className="text-gray-600 hover:text-orange-500">
                Tienda
              </Link>
            </li>
            <li>
              <Link href="/historia" className="text-gray-600 hover:text-orange-500">
                Historia
              </Link>
            </li>
            <li>
              <Link href="/equipo" className="text-gray-600 hover:text-orange-500">
                Nuestro Equipo
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contacto</h3>
          <p className="text-gray-600 text-sm">
            Email: info@huellitas.com </p>
            <p className="text-gray-600 text-sm mt-3">Tel: (123) 456-7890
          </p>
        </div>

       
        {/* Columna 3: mapa */}     
        <div>
          <h3 className="text-lg font-semibold mb-4">Nuestra ubicación</h3>
          <div className="w-full max-w-xs rounded-lg overflow-hidden shadow-md">
            <MapDisplay />
          </div>
        </div>
      </div>

      {/* Línea divisoria y copyright */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Huellitas Pet Shop. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}