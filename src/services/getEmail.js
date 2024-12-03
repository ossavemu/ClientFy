import { isValidEmail } from '../utils/email.js';
import { typing } from './typing.js';

export const getEmail = async (ctx, ctxFn) => {
  const email = ctx.body.trim().toLowerCase();

  if (!isValidEmail(email)) {
    await typing(1, { ctx, ctxFn });
    return 'El correo electrónico proporcionado incorrecto. Por favor, inténtalo de nuevo.';
  }

  await ctxFn.state.update({ email });
  await typing(1, { ctx, ctxFn });
  return 'Correo electrónico válido. Procederé a crear el evento.';
};
