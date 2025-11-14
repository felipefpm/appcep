import { z } from 'zod'

export const addressSchema = z.object({
  cep: z
    .string()
    .regex(/^\d{8}$/, { message: 'Informe um CEP com 8 dígitos.' }),
  logradouro: z
    .string()
    .min(2, { message: 'Logradouro deve ter ao menos 2 caracteres.' })
    .max(120, { message: 'Logradouro deve ter no máximo 120 caracteres.' }),
  numero: z
    .string()
    .min(1, { message: 'Informe o número.' })
    .max(6, { message: 'Número deve ter até 6 caracteres.' })
    .regex(/^[\da-zA-Z-]+$/, {
      message: 'Número deve conter apenas letras, números ou hífen.',
    }),
  complemento: z
    .string()
    .max(80, { message: 'Complemento deve ter no máximo 80 caracteres.' }),
  bairro: z
    .string()
    .min(2, { message: 'Bairro deve ter ao menos 2 caracteres.' })
    .max(80, { message: 'Bairro deve ter no máximo 80 caracteres.' }),
  cidade: z
    .string()
    .min(2, { message: 'Cidade deve ter ao menos 2 caracteres.' })
    .max(80, { message: 'Cidade deve ter no máximo 80 caracteres.' }),
  estado: z
    .string()
    .regex(/^[A-Za-z]{2}$/, { message: 'Estado deve ter duas letras.' })
    .transform((value) => value.toUpperCase()),
})

export type AddressFormData = z.infer<typeof addressSchema>
