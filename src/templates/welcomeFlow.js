import { addKeyword, EVENTS } from '@builderbot/bot';
import { chat } from '../services/chatgpt.js';
import { typing } from '../services/typing.js';
import { wsUserService } from '../services/wsUserService.js';
import { dateFlow } from './dateFlow.js';

const welcomeFlow = addKeyword(EVENTS.WELCOME).addAction(async (ctx, ctxFn) => {
  try {
    const bodyText = ctx.body.toLowerCase().trim();
    const phoneNumber = ctx.from;

    // Registrar o actualizar usuario
    await wsUserService.createOrUpdateUser(phoneNumber, ctx.name);

    // Registrar la interacción
    await wsUserService.logInteraction(phoneNumber, 'text', bodyText);

    // Verificar si es un usuario "caliente"
    const hotUsers = await wsUserService.getHotUsers();
    const isHotUser = hotUsers.some(
      (user) => user.phone_number === phoneNumber
    );

    if (isHotUser) {
      console.log('Usuario caliente detectado:', phoneNumber);
    }

    const days = [
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ];

    const keywordsSchedule = [
      'agendar',
      'cita',
      'reservar',
      'reunión',
      'turno',
      'hoy',
      'mañana',
      ...days,
    ];

    const isSchedule = keywordsSchedule.some(
      (keyword) => bodyText.includes(keyword) || !isNaN(Number(keyword))
    );

    if (isSchedule) {
      await typing(1, { ctx, ctxFn });
      return ctxFn.gotoFlow(dateFlow);
    }

    const state = await ctxFn.state.getMyState();
    const thread = state?.thread ?? null;

    await typing(1, { ctx, ctxFn });

    const response = await chat(ctx.body, ctx.name, thread);
    await ctxFn.state.update({ thread: response.thread });
    return ctxFn.endFlow(response.response);
  } catch (error) {
    console.error('Error en welcomeFlow:', error);
    return ctxFn.endFlow(
      'Lo siento, hubo un error. Por favor, intenta nuevamente.'
    );
  }
});

export { welcomeFlow };
