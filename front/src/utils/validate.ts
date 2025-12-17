/* import { ILoginProps, ILoginPropsErrors } from "../types"; */
import * as Yup from 'yup';

const required= 'Campo obligatorio'
const equalPasswords= 'Las constraseñas deben coincidir'
const onlyNumbers= 'Solo se permiten números'
const lenghtPassword= 'La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número y un símbolo.'
const invalidEmail= 'Formato de email inválido'
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const passwordSize = 8
const passwordSizeRegex= "La contraseña debe tener al menos 8 caracteres"


const mailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/

export const validateLoginForm = Yup.object({
        email: Yup.string()
        .matches(mailRegex, invalidEmail)
        .required(required),
        password: Yup.string().required(required)
})

export const validateSchemaRegister = Yup.object({
        email: Yup.string().matches(mailRegex, invalidEmail).required(required),
        password: Yup.string().min(passwordSize, passwordSizeRegex ).matches(passwordRegex,lenghtPassword).required(required),
        confirmPassword: Yup.string().oneOf([Yup.ref('password')], equalPasswords),
        name: Yup.string().required(required),
        address: Yup.string().required(required),
        phone: Yup.string().required(required).matches(/^[0-9]+$/, onlyNumbers)
    })