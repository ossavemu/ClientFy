import { addKeyword, EVENTS } from '@builderbot/bot';
import { readFileSync } from 'fs';
import {
  getNextAvailableSlot,
  isDateAvailable,
  listAvailableSlots,
} from '../services/calendar.js';
import { simpleChat } from '../services/simplegpt.js';
import { typing } from '../services/typing.js';
import { iso2text } from '../utils/iso2text.js';
import { processVoiceOrText } from '../utils/processVoiceOrText.js';
import { text2iso } from '../utils/text2iso.js';
import { formFlow } from './formFlow.js';

const promptBase = readFileSync('./calendar-prompt.txt', 'utf8');

const getNext5AvailableSlots = async () => {
  try {
    const currentDate = new Date();
    // Añadir una hora a la fecha actual
    currentDate.setHours(currentDate.getHours() + 1);
    currentDate.setMinutes(0, 0, 0); // Resetear minutos y segundos

    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 30); // Buscar en los próximos 30 días

    const slots = await listAvailableSlots(currentDate, endDate);

    // Filtrar slots que:
    // 1. Sean futuros (más de una hora desde ahora)
    // 2. Estén realmente disponibles
    const validSlots = [];

    for (const slot of slots) {
      if (validSlots.length >= 5) break;

      const slotDate = new Date(slot.start);

      // Verificar que el slot sea futuro
      if (slotDate <= currentDate) continue;

      // Verificar disponibilidad real
      const isSlotAvailable = await isDateAvailable(slotDate);

      if (isSlotAvailable) {
        validSlots.push(slot);
      }
    }

    if (validSlots.length === 0) {
      throw new Error('No hay slots disponibles en el futuro próximo');
    }

    return validSlots;
  } catch (error) {
    console.error('Error en getNext5AvailableSlots:', error);
    throw error;
  }
};

const formatAvailableSlots = async (slots) => {
  if (!slots || slots.length === 0) {
    return 'Lo siento, no hay turnos disponibles en este momento.';
  }

  let message = 'Los próximos turnos disponibles son:\n\n';
  for (let i = 0; i < slots.length; i++) {
    const date = new Date(slots[i].start);

    // Convertir hora militar a formato 12 horas
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'de la tarde' : 'de la mañana';
    hours = hours % 12;
    hours = hours ? hours : 12; // la hora '0' debe ser '12'

    const formattedDate = date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Bogota',
    });

    // Combinar la fecha formateada con la hora en formato 12 horas
    message += `${i + 1}. ${formattedDate} a las ${hours} ${ampm}\n`;
  }
  message +=
    '\nPor favor, indica la fecha y hora que prefieres (puedes decir el número de la opción o especificar otra fecha).';
  return message;
};

const getOptionFromText = (text) => {
  // Normalizar el texto: quitar acentos, convertir a minúsculas
  const normalizedText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Mapeo de palabras a números
  const numberWords = {
    primer: 1,
    primero: 1,
    primera: 1,
    uno: 1,
    segund: 2,
    segundo: 2,
    segunda: 2,
    dos: 2,
    tercer: 3,
    tercero: 3,
    tercera: 3,
    tres: 3,
    cuart: 4,
    cuarto: 4,
    cuarta: 4,
    cuatro: 4,
    quint: 5,
    quinto: 5,
    quinta: 5,
    cinco: 5,
  };

  // Buscar coincidencias en el texto
  for (const [word, number] of Object.entries(numberWords)) {
    if (
      normalizedText.includes(word) ||
      normalizedText.includes(`opcion ${number}`)
    ) {
      return number;
    }
  }

  // Si no se encuentra coincidencia, intentar extraer un número directo
  const numericMatch = normalizedText.match(/\d+/);
  if (numericMatch) {
    const number = parseInt(numericMatch[0]);
    if (number >= 1 && number <= 5) {
      return number;
    }
  }

  return null;
};

export const confirmationFlow = addKeyword(EVENTS.ACTION).addAnswer(
  'Confirmas la fecha propuesta? Responde unicamente con un "si o no"',
  { capture: true },
  async (ctx, ctxFn) => {
    try {
      // Palabras clave para respuestas afirmativas
      const affirmativeKeywords = [
        'si',
        'sí',
        'yes',
        'claro',
        'dale',
        'por supuesto',
        'puedo',
        'confirmo',
        'ok',
        'okay',
        'vale',
      ];

      // Palabras clave para respuestas negativas
      const negativeKeywords = [
        'no',
        'nop',
        'nope',
        'nel',
        'ne',
        'negativo',
        'imposible',
        'cancelo',
      ];

      const messageText = await processVoiceOrText(ctx);
      console.log('Mensaje recibido en confirmación:', messageText);

      const normalizedText = String(messageText)
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      console.log('Texto normalizado:', normalizedText);

      // Verificar respuesta afirmativa
      const isAffirmativeAnswer = affirmativeKeywords.some(
        (keyword) =>
          normalizedText.includes(keyword) &&
          !normalizedText.startsWith('no ') &&
          !normalizedText.includes('no puedo')
      );

      // Verificar respuesta negativa
      const isNegativeAnswer = negativeKeywords.some((keyword) =>
        normalizedText.includes(keyword)
      );

      console.log('¿Es respuesta afirmativa?:', isAffirmativeAnswer);
      console.log('¿Es respuesta negativa?:', isNegativeAnswer);

      // Si la respuesta no es clara, volver a preguntar
      if (!isAffirmativeAnswer && !isNegativeAnswer) {
        await typing(1, { ctx, ctxFn });
        await ctxFn.flowDynamic(
          'No entendí tu respuesta. Por favor, responde solo con "si" o "no"'
        );
        return ctxFn.fallBack();
      }

      if (isAffirmativeAnswer) {
        await typing(1, { ctx, ctxFn });
        return ctxFn.gotoFlow(formFlow);
      } else {
        await typing(1, { ctx, ctxFn });
        return ctxFn.endFlow(
          'Reserva cancelada. Vuelve a solicitar de nuevo una reserva'
        );
      }
    } catch (error) {
      console.error('Error en confirmationFlow:', error);
      return ctxFn.endFlow(
        'Hubo un error procesando tu respuesta. Por favor, intenta nuevamente.'
      );
    }
  }
);

export const dateFlow = addKeyword(EVENTS.ACTION)
  .addAnswer(
    'Perfecto, ¿cuál es la fecha en la que quieres reservar?',
    null,
    async (ctx, ctxFn) => {
      try {
        const availableSlots = await getNext5AvailableSlots();
        const formattedMessage = await formatAvailableSlots(availableSlots);
        await ctxFn.flowDynamic(formattedMessage);
      } catch (error) {
        console.error('Error al obtener slots disponibles:', error);
        await ctxFn.flowDynamic(
          'Lo siento, hubo un error al obtener los turnos disponibles. ' +
            'Por favor, especifica directamente la fecha y hora que prefieres.'
        );
      }
    }
  )
  .addAnswer(
    'Revisando disponibilidad...',
    { capture: true },
    async (ctx, ctxFn) => {
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 1);
      currentDate.setMinutes(0, 0, 0);

      const messageText = await processVoiceOrText(ctx);
      console.log('Mensaje recibido:', messageText);

      let solicitedDate;
      let selectedSlot;

      // Intentar obtener la opción seleccionada del texto o nota de voz
      const selectedOption = getOptionFromText(messageText);
      console.log('Opción detectada:', selectedOption);

      if (selectedOption !== null) {
        try {
          const availableSlots = await getNext5AvailableSlots();
          selectedSlot = availableSlots[selectedOption - 1];
          if (selectedSlot) {
            solicitedDate = selectedSlot.start;
          }
        } catch (error) {
          console.error('Error al obtener slot seleccionado:', error);
        }
      }

      // Si no se seleccionó un slot válido, intentar procesar como fecha
      if (!solicitedDate) {
        solicitedDate = await text2iso(messageText);
      }

      if (solicitedDate === 'false' || !solicitedDate) {
        await typing(1, { ctx, ctxFn });
        return ctxFn.endFlow(
          'No pude entender la fecha solicitada, vuelve a intentarlo!'
        );
      }

      const startDate = new Date(solicitedDate);

      // Verificar que la fecha no sea anterior a la actual
      if (startDate < currentDate) {
        await typing(1, { ctx, ctxFn });
        return ctxFn.endFlow(
          'La fecha seleccionada ya pasó. Por favor, elige una fecha futura.'
        );
      }

      console.log('Fecha solicitada:', startDate);

      let dateAvailable = await isDateAvailable(startDate);

      console.log('Fecha disponible:', dateAvailable);

      if (dateAvailable === false) {
        const nextDateAvailable = await getNextAvailableSlot(startDate);

        if (!nextDateAvailable) {
          return ctxFn.endFlow(
            'No hay fechas disponibles próximas. Por favor, intenta con otra fecha.'
          );
        }

        console.log('Siguiente disponible:', nextDateAvailable);

        const isoString = nextDateAvailable.start.toISOString();
        const dateString = await iso2text(isoString);

        const messages = [{ role: 'user', content: messageText }];
        const response = await simpleChat(
          promptBase +
            '\nHoy es el día:\n' +
            currentDate +
            '\nLa fecha solicitada es:\n' +
            solicitedDate +
            '\nLa disponibilidad de esa fecha es: false. El proximo espacio disponible que tienes que ofrecer es ' +
            dateString +
            ' Da la fecha siempre en Español',
          messages
        );
        await ctxFn.flowDynamic(response);
        await ctxFn.state.update({ date: nextDateAvailable.start });
        await typing(1, { ctx, ctxFn });
        return ctxFn.gotoFlow(confirmationFlow);
      } else {
        const messages = [{ role: 'user', content: messageText }];
        const response = await simpleChat(
          promptBase +
            '\nHoy es el día:\n' +
            currentDate +
            '\nLa fecha solicitada es:\n' +
            solicitedDate +
            '\nLa disponibilidad de esa fecha es: true\n',
          messages
        );
        await ctxFn.flowDynamic(response);
        await ctxFn.state.update({ date: startDate });
        await typing(1, { ctx, ctxFn });
        return ctxFn.gotoFlow(confirmationFlow);
      }
    }
  );
