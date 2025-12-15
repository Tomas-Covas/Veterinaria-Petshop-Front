'use client'

import { Form, Formik } from 'formik'
import FieldFormikCustom from '../../components/FieldFormikCustom/FieldFormikCustom';
import SubmitFormikButton from '../../components/SubmitFormikButton/SubmitFormikButton';
import { validateSchemaRegister } from '@/src/utils/validate';
import Link from 'next/link';
import { register } from '@/src/services/user.services';
import { useRouter } from 'next/navigation';
import PasswordFieldFormik from '../../components/PaswordField/PasswordField';
import background from "@/src/assets/huellasFondo.png"
import catFood from "@/src/assets/gatoComida.png"
import Image from 'next/image';

function RegisterView() {

    const router = useRouter();

    return (
        <div
            className="flex md:justify-around justify-center items-center 
      bg-linear-to-r from-orange-300 via-orange-300 to-orange-200
      mt-20 rounded-2xl shadow-xl overflow-hidden"
        >
            {/* Imagen lateral */}
            <div className="hidden lg:block">
                <Image
                    src={catFood}
                    alt="catFood"
                    width={400}
                    height={500}
                    className="rounded-2xl"
                />
            </div>

            {/* Formulario */}
            <div
                className="flex flex-col ms-10 items-center rounded-3xl md:mr-10 my-3
                    justify-center p-4 bg-white/80 backdrop-blur-sm shadow-lg"
                style={{
                    backgroundImage: `url(${background.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "brightness(0.9)",
                }}
            >
                <p className="text-4xl md:text-5xl text-shadow-2xs
       text-shadow-gray-600 font-extrabold
        text-black mt-2 drop-shadow-md
        bg-gray-400/50 rounded-2xl p-1 backdrop-blur-sm">
                    Crear una cuenta
                </p>

                <p className="border-2 border-cyan-700 p-2 mt-2
                rounded-3xl bg-white  text-lg font-medium">
                    ¿Ya tienes cuenta?
                    <Link
                        href="/auth/login"
                        className="text-blue-600 font-semibold hover:underline ml-2"
                    >
                        ¡Inicia sesión!
                    </Link>
                </p>

                <Formik
                    initialValues={{
                        name: "",
                        email: "",
                        password: "",
                        user: "",
                        phone: "",
                        country: "",
                        address: "",
                        city: "",
                        confirmPassword: "",
                    }}
                    validationSchema={validateSchemaRegister}
                    validateOnMount={true}
                    onSubmit={async (values, { resetForm }) => {
                        const { confirmPassword, ...payload } = values;
                        const result = await register(payload);
                        
                        // Si el backend devuelve una contraseña temporal, mostrarla
                        if (result?.temporaryPassword || result?.password) {
                            const tempPassword = result.temporaryPassword || result.password;
                            alert(`✅ Registro exitoso!\n\n🔑 Tu contraseña temporal es:\n${tempPassword}\n\n⚠️ Guarda esta contraseña. También fue enviada a tu email.`);
                        }
                        
                        resetForm();
                        router.push("/auth/login");
                    }}
                >
                    {({ isValid, isSubmitting }) => (
                        <Form className="flex flex-col w-full ">

                            <div className='flex flex-row justify-between'>
                                <FieldFormikCustom
                                    label="Nombre y Apellido:"
                                    nameField="name"
                                    type="text"
                                    placeholder="Juan Gutierrez"
                                />
                                <FieldFormikCustom
                                    label="Nombre de usuario:"
                                    nameField="user"
                                    type="text"
                                    placeholder="JGuttierrez"
                                />

                            </div>

                            <FieldFormikCustom
                                label="Email:"
                                nameField="email"
                                type="email"
                                placeholder="juanGutierrez82@mail.com"
                            />

                            <div className='flex flex-row justify-between items-center'>
                                <PasswordFieldFormik
                                    label="Contraseña:"
                                    nameField="password"
                                    type="password"
                                    placeholder="********"
                                />

                                <FieldFormikCustom
                                    label="Confirmar contraseña:"
                                    nameField="confirmPassword"
                                    type="password"
                                    placeholder="********"
                                />
                            </div>

                            <FieldFormikCustom
                                label="Número de teléfono:"
                                nameField="phone"
                                type="text"
                                placeholder="155 555 5555"
                            />

                            <div className='flex flex-row justify-between'>
                                <FieldFormikCustom
                                    label="País:"
                                    nameField="country"
                                    type="text"
                                    placeholder="Argentina"
                                />

                                {/*TODO: provincia <FieldFormikCustom
                                    label="Provincia:"
                                    nameField="province"
                                    type="text"
                                    placeholder="Pringles"
                                /> */}

                            </div>
                            <div className='flex flex-row justify-between'>

                                <FieldFormikCustom
                                    label="Ciudad:"
                                    nameField="city"
                                    type="text"
                                    placeholder="Pringles"
                                />

                                <FieldFormikCustom
                                    label="Dirección:"
                                    nameField="address"
                                    type="text"
                                    placeholder="Av Mitre 123"
                                />
                            </div>

                            <SubmitFormikButton
                                text={isSubmitting ? "Guardando..." : "Guardar"}
                                disabled={!isValid || isSubmitting}
                            />
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );

}

export default RegisterView
