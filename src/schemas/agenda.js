import { z } from 'zod';

export const agendaSchema = z.object({
  phone_number: z
    .string()
    .min(10, 'El número de teléfono debe tener al menos 10 dígitos')
    .max(20, 'El número de teléfono no puede exceder 20 caracteres'),

  scheduled_at: z.date(),

  created_at: z.date().default(() => new Date()),

  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),

  zoom_link: z.string().optional(),

  email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),

  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
});
