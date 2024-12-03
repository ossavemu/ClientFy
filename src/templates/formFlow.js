import { addKeyword, EVENTS } from '@builderbot/bot';
import { getEmail } from '../services/getEmail.js';
import { typing } from '../services/typing.js';
import { processVoiceOrText } from '../utils/processVoiceOrText.js';
import { eventCreationFlow } from './eventCreationFlow.js';

export const formFlow = addKeyword(EVENTS.ACTION)
  .addAnswer(
    'Gracias por confirmar la fecha, te haré unas preguntas para que puedas confirmar el turno. Primero, como quiero confirmar ¿Cómo te llamas?',
    { capture: true },
    async (ctx, ctxFn) => {
      try {
        const name = await processVoiceOrText(ctx);
        await ctxFn.state.update({ name });
        await typing(1, { ctx, ctxFn });
      } catch (error) {
        console.error('Error procesando el nombre:', error);
        return ctxFn.endFlow(
          'Hubo un error procesando tu respuesta. Por favor, intenta nuevamente.'
        );
      }
    }
  )
  .addAnswer(
    'Por favor, proporciona tu correo electrónico (IMPORTANTE: en este paso solo se acepta texto, no notas de voz).',
    {
      capture: true,
    },
    async (ctx, ctxFn) => {
      const message = await getEmail(ctx, ctxFn);
      await ctxFn.flowDynamic(message);
      if (message.includes('válido')) {
        await typing(1, { ctx, ctxFn });
        return ctxFn.gotoFlow(eventCreationFlow);
      }
      ctxFn.fallBack(message);
    }
  );
// .addAnswer('Agendando la reunión', null, async (ctx, ctxFn) => {
//   const userInfo = await ctxFn.state.getMyState();
//   const name = userInfo.name;
//   const description = 'Prueba description';
//   const date = userInfo.date;
//   const eventId = await createEvent(name, description, date);

//   if (eventId) {
//     await typing(1, { ctx, ctxFn });
//     return ctxFn.endFlow('Agendado correctamente');
//   }
//   await ctxFn.state.clear();
// });
