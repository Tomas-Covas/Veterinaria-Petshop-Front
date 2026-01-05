
import img1 from "@/src/assets/truck.png"
import img2 from "@/src/assets/delivery.png"
import img3 from "@/src/assets/local.png"
import Image from 'next/image'

function Logistics() {
  const items = [
    { img: img1, text: "Envío rápido" },
    { img: img2, text: "Entrega por correo" },
    { img: img3, text: "Retiro en sucursal" }
  ];

  return (
    <div className="flex flex-wrap md:flex-row md:justify-evenly
      gap-8 px-4 justify-center w-full">
      {items.map((item, index) => (
        <div
          key={index}
          className="
            flex flex-col items-center
            transition-transform duration-300
            hover:scale-110 hover:shadow-lg
            cursor-pointer
          "
        >
          {/* Contenedor circular */}
          <div
            className="
              flex justify-center items-center
              bg-linear-to-br from-orange-500 to-amber-500
              w-36 h-36 sm:w-40 sm:h-40
              rounded-full shadow-md
              overflow-hidden
            "
          >
            <Image
              src={item.img}
              alt={item.text}
              /* width={120}
              height={120} */
              className="object-contain"
            />
          </div>

          {/* Texto */}
          <p className="mt-4 text-center text-lg font-semibold text-gray-700">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Logistics;
