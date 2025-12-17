import { ErrorMessage, Field } from 'formik';
import React from 'react'

interface FieldCustomProps {
  label: string;
  nameField: string;
  type: string;
  placeholder?: string;
}

const FieldFormikCustom: React.FC<FieldCustomProps> = ({ label, nameField, type, placeholder }) => {
  return (
    <div className='flex flex-col items-center text-black'>

      {/* Placeholder e Imput */}
      <div className='flex flex-col w-full mt-2'>

        <label className='font-bold ml-2 flex self-start
        bg-white rounded-2xl p-1 backdrop-blur-sm
        '>{label}</label>

        <Field
          className="border-2 focus:ring-2 focus:ring-orange-400
           focus:border-orange-400 rounded-2xl p-2 bg-white
           "
          name={nameField}
          type={type}
          placeholder={placeholder}
        />
      </div>

      {/* Error */}
      <ErrorMessage
        className='text-red-600'
        name={nameField}
        component="div"
      ></ErrorMessage>
    </div>
  )
}

export default FieldFormikCustom
