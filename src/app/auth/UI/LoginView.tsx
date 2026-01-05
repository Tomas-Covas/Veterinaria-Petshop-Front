'use client'

import { Form, Formik } from 'formik'
import React from 'react'
import FieldFormikCustom from '../../components/FieldFormikCustom/FieldFormikCustom'
import SubmitFormikButton from '../../components/SubmitFormikButton/SubmitFormikButton'
import { validateLoginForm } from '@/src/utils/validate'
import Link from 'next/link'
import Image from 'next/image'
import googleLogo from "@/src/assets/googleLogo.png"
import { useAuth } from '@/src/context/AuthContext'
import { getGoogleAuthUrl, login } from '@/src/services/user.services'
import PasswordFieldFormik from '../../components/PaswordField/PasswordField'
import dogCat from "@/src/assets/dogCat.png"
import background from "@/src/assets/huellasFondo.png"
import { IUserSession } from '@/src/types'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

function LoginView() {
    const { setUserData } = useAuth();
    const router = useRouter();
    const [googleLoading, setGoogleLoading] = React.useState(false);

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            const { url } = await getGoogleAuthUrl();
            toast.success("Ingresando con Google...");
            window.location.href = url;
        } catch (error) {
            console.error("Error al obtener URL de autenticación:", error);
            toast.error("No se pudo iniciar el proceso de autenticación con Google");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className='flex md:justify-around justify-center items-center bg-linear-to-r 
        from-orange-300 via-orange-300 to-orange-200 mt-20 rounded-2xl'>

            <div className='hidden lg:block'>
                <Image src={dogCat} alt="dogCat" width={800} height={800} className='rounded-2xl' />
            </div>

            <div className="flex flex-col ms-10 items-center rounded-3xl md:mr-10 my-3
                    justify-center p-4 bg-white/80 backdrop-blur-sm shadow-lg"
                style={{
                    backgroundImage: `url(${background.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "brightness(0.9)",
                }}>

                <p className="text-4xl md:text-5xl text-shadow-2xs
       text-shadow-gray-600 font-extrabold
        text-black mt-2 drop-shadow-md
         bg-gray-400/50 rounded-2xl p-1 backdrop-blur-sm">Ingresá</p>

                <p className="border-2 border-cyan-700 p-2 mt-2
                rounded-3xl bg-white  text-lg font-medium">¿No tienes cuenta?
                    <Link href="/auth/register" 
                    className="text-blue-600 font-semibold hover:underline ml-2">
                        ¡Registrate!</Link>
                </p>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={validateLoginForm}
                    validateOnMount={true}
                    onSubmit={async (values) => {
                        try {
                            const response = await login(values);
                            
                            const token = localStorage.getItem('authToken') || '';

                            const formatted: IUserSession = {
                                token: token,
                                user: {
                                    id: response.id || '',
                                    uid: response.uid,
                                    name: response.name,
                                    email: response.email || '',
                                    user: response.user || '',
                                    phone: response.phone,
                                    country: response.country || '',
                                    address: response.address || '',
                                    city: response.city || '',
                                    role: response.role,
                                    isDeleted: response.isDeleted || false,
                                    deletedAt: response.deletedAt || null,
                                    pets: response.pets || [],
                                    requirePasswordChange: response.requirePasswordChange,
                                    buyerSaleOrders: response.buyerSaleOrders || [],
                                    profileImageUrl: response.profileImageUrl || ''
                                }
                            };

                            // IMPORTANTE: Guardar el usuario en el contexto
                            setUserData(formatted);
                            
                            // Guardar datos del usuario en localStorage para recuperación
                            localStorage.setItem('userData', JSON.stringify(formatted.user));
                            localStorage.setItem('requirePasswordChange', response.requirePasswordChange ? 'true' : 'false');
                            document.cookie = `role=${response.role}; path=/`;

                            
                            // Delay para que React actualice el estado
                            await new Promise(resolve => setTimeout(resolve, 200));

                            // Si es veterinario con contraseña temporal, redirigir a cambiar contraseña
                            if (response.role === 'veterinarian' && response.requirePasswordChange) {
                                router.push('/change-password');
                            } else {
                                router.push('/');
                            }

                        } catch (error: any) {
                            throw error
                        }
                    }}
                >
                    {({ isValid, isSubmitting }) => (
                        <Form className="flex flex-col justify-between my-6 rounded-2xl p-2">

                            <FieldFormikCustom
                                label="Email:"
                                nameField="email"
                                type="email"
                                placeholder="johnHandcock@mail.com"
                            />

                            <PasswordFieldFormik
                                label="Contraseña:"
                                nameField="password"
                                type="password"
                                placeholder="********"
                            />

                            <SubmitFormikButton
                                text={isSubmitting ? "Ingresando..." : "Ingresar"}
                                disabled={!isValid || isSubmitting}
                            />

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                                className='bg-white border rounded hover:bg-sky-500
                                p-3 w-70 flex self-center justify-center cursor-pointer
                                disabled:opacity-50 disabled:cursor-not-allowed'>
                                <Image
                                    src={googleLogo}
                                    width={25}
                                    height={25}
                                    alt='Google Logo'
                                    className='mr-5 w-7 h-7 self-center'
                                />
                                {googleLoading ? "Cargando..." : "Ingresá con Google"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default LoginView