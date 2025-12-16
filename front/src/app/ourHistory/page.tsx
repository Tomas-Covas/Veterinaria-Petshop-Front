import Image from 'next/image'
import fundacion from "../../assets/fundacion.png"
import refundacion from "../../assets/refundacion.png"
import bannerhistory1 from "../../assets/bannerhistory1.png"
export default function OurHistoryPage() {
  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full">
        <Image
          src={bannerhistory1}
          alt="Fundación de la clínica veterinaria"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-orange-500/70 to-amber-500/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Nuestra Historia</h1>
            <p className="text-xl md:text-2xl">Más de 25 años cuidando a tu mejor amigo</p>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Fundación 1998 */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <span className="inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                1998 - Los Comienzos
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Fundación: los comienzos en Florida
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                La historia de <span className="font-semibold">Huellitas Pet</span> comenzó mucho antes de llevar ese nombre. 
                En 1998, el matrimonio del Dr. Pepe Argento y la Dra. Moni Argento abrió las puertas de su soñada 
                clínica veterinaria en <span className="font-semibold">Adolfo Alsina 2256, Florida, Buenos Aires</span>.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Lo que empezó como un pequeño local remodelado con trabajo nocturno, pintura y herramientas prestadas, 
                pronto se convirtió en un espacio querido por el barrio. La clínica, originalmente llamada 
                <span className="font-semibold"> Clínica Veterinaria Argento</span>, nació con una filosofía muy clara: 
                trato humano, medicina responsable y vínculo cercano con los animales y sus familias.
              </p>
              <p className="text-gray-700 leading-relaxed">
                El primer paciente, <span className="font-semibold">Fatiga</span> —un perrito mestizo adoptado por una 
                familia del barrio— marcó el inicio de una relación profunda entre la clínica y la comunidad. A partir 
                de allí, campañas de vacunación en la vereda, actividades educativas en colegios y jornadas de adopción 
                consolidaron el lugar como un referente.
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
                <Image
                  src= {fundacion}
                  alt="Inauguración de la Clínica Veterinaria Argento en 1998"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-orange-200 my-16" />

        {/* Crecimiento 2000-2015 */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="w-full md:w-1/2">
              <span className="inline-block bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                2000-2015 - Expansión
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Crecimiento y profesionalización
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Con el paso de los años, la clínica fue ampliándose. Primero fue un consultorio extra, luego la sala 
                de rayos, más tarde un pequeño quirófano que modernizaron varias veces.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                La reputación creció gracias al profesionalismo de <span className="font-semibold">Pepe</span> —especialista 
                en clínica general y emergencias— y a la calidez de <span className="font-semibold">Moni</span>, reconocida 
                en toda la zona norte por su dedicación en diagnóstico por imágenes y su amor por los gatos.
              </p>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Entre 2005 y 2015:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Se incorporaron nuevos veterinarios jóvenes
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Se implementó historia clínica digital
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Se incorporaron servicios de laboratorio in-house
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Se amplió el horario para atender urgencias leves
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    Se creó una pequeña red con rescatistas del barrio
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={refundacion}
                  alt="Clínica Huellitas Pet moderna"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-orange-200 my-16" />

        {/* Cambio Generacional 2016-2023 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <span className="inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              2016-2023 - Modernización
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Un cambio generacional y una nueva identidad
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-700 mb-6 leading-relaxed text-center">
              Con el tiempo, y tras casi dos décadas trabajando sin parar, los fundadores comenzaron a dar paso a una 
              nueva generación de profesionales capacitados. Aunque el Dr. Pepe y la Dra. Moni ya no atienden pacientes 
              de manera activa, continúan al mando de la dirección general, acompañando las decisiones clínicas y sosteniendo 
              la identidad que construyeron desde cero.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Nuevos Especialistas</h3>
                <p className="text-gray-700">
                  Cirugía, dermatología, exóticos y traumatología se sumaron al equipo profesional.
                </p>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Tecnología Moderna</h3>
                <p className="text-gray-700">
                  Equipos de ecografía, rayos digitales y laboratorio automatizado.
                </p>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Protocolos Actualizados</h3>
                <p className="text-gray-700">
                  Siguiendo estándares internacionales de medicina veterinaria.
                </p>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Identidad Renovada</h3>
                <p className="text-gray-700">
                  Modernización sin perder la esencia familiar y comunitaria.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-orange-200 my-16" />

        {/* Nacimiento de Huellitas Pet 2024 */}
        <div className="mb-16">
          <div className="bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <span className="inline-block bg-white text-orange-500 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                2024 - Nueva Era
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                El nacimiento de HUELLITAS PET
              </h2>
            </div>
            <div className="max-w-3xl mx-auto">
              <p className="text-white/90 mb-6 leading-relaxed text-lg">
                En reuniones con clientes de años, familias del barrio y los nuevos profesionales, surgió una idea: 
                La clínica ya no representaba solo a los Argento, sino a una comunidad entera. Décadas de pacientes 
                dejaron literalmente <span className="font-semibold">huellitas</span> en la historia del lugar.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-xl mb-4 text-center">El nuevo nombre representa:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-yellow-300 mr-3 text-xl">🐾</span>
                    <span>La cercanía emocional con las mascotas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-300 mr-3 text-xl">🐾</span>
                    <span>Un nombre fácil, moderno y amigable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-300 mr-3 text-xl">🐾</span>
                    <span>La esencia del cuidado con calidez</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-300 mr-3 text-xl">🐾</span>
                    <span>Servicios integrales: veterinaria, tienda pet, estética y programas comunitarios</span>
                  </li>
                </ul>
              </div>
              <p className="text-white/90 leading-relaxed text-center">
                Aun con el cambio de nombre, la dirección sigue a cargo de Pepe y Moni, quienes supervisan la clínica 
                desde un rol más estratégico, mientras un equipo joven, capacitado y en constante formación atiende el día a día.
              </p>
            </div>
          </div>
        </div>

        {/* Huellitas Pet Hoy */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Huellitas Pet Hoy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un centro veterinario moderno con alma familiar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-orange-500 text-4xl mb-4">🏥</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Medicina Integral</h3>
              <p className="text-gray-600">Atención preventiva y diagnóstico moderno</p>
            </div>
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-orange-500 text-4xl mb-4">❤️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Atención Humanizada</h3>
              <p className="text-gray-600">Trato cercano y profesional</p>
            </div>
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-orange-500 text-4xl mb-4">🚑</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Emergencias 24/7</h3>
              <p className="text-gray-600">Cuidados continuos cuando los necesitas</p>
            </div>
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-orange-500 text-4xl mb-4">👨‍⚕️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Especialistas</h3>
              <p className="text-gray-600">Equipo capacitado en diversas áreas</p>
            </div>
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-orange-500 text-4xl mb-4">🛍️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Tienda Pet</h3>
              <p className="text-gray-600">Productos de calidad para tu mascota</p>
            </div>
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-orange-500 text-4xl mb-4">✂️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Estética Canina</h3>
              <p className="text-gray-600">Servicio de peluquería profesional</p>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-700 text-lg mb-4 leading-relaxed max-w-3xl mx-auto">
              La clínica mantiene su sede en el histórico local de <span className="font-semibold">Adolfo Alsina 2256</span>, 
              donde todo comenzó. Las paredes cambiaron, la tecnología cambió, el nombre cambió…
            </p>
            <p className="text-2xl font-bold text-orange-500 mb-2">
              Pero el espíritu sigue siendo el mismo
            </p>
            <p className="text-xl text-gray-800 font-semibold">
              Amor, respeto y compromiso con cada vida que cruza la puerta. 🐾
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}