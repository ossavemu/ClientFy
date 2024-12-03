import { z } from 'zod';

export const wsUserSchema = z.object({
  phone_number: z
    .string()
    .min(10, 'El número de teléfono debe tener al menos 10 dígitos')
    .max(20, 'El número de teléfono no puede exceder 20 caracteres')
    .regex(/^\+?[\d\s-]+$/, 'Formato de número de teléfono inválido'),

  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  interaction_count: z.number().int().min(1).default(1),

  last_interaction: z.date().default(() => new Date()),

  created_at: z.date().default(() => new Date()),
});

export const historicSchema = z.object({
  phone_number: z.string().min(10).max(20),

  message_type: z.enum(['text', 'voice', 'image', 'video', 'document']),

  message_content: z
    .string()
    .max(1000, 'El contenido del mensaje no puede exceder 1000 caracteres'),

  created_at: z.date().default(() => new Date()),
});
