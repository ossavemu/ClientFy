import { utils } from '@builderbot/bot';
import { schedule } from 'node-cron';
import { wsUserService } from './wsUserService.js';

export const reminder = (adapterProvider) => {
  // Mensajes personalizados para usuarios frecuentes
  const engagementMessages = {
    morning: [
      '¡Buenos días! 🌅 Como cliente especial, queremos recordarte que estamos aquí para ayudarte. ¿Necesitas agendar una nueva cita?',
      '¡Hola! ☀️ Esperamos que tengas un excelente día. Como usuario VIP, tienes prioridad en nuestros horarios. ¿Te gustaría ver la disponibilidad?',
      'Buenos días ✨ Gracias por tu preferencia. ¿Podemos ayudarte a programar tu próxima cita hoy?',
    ],
    afternoon: [
      '¡Hola! 🌟 ¿Ya pensaste en tu próxima cita? Como cliente frecuente, queremos asegurarnos de reservar el mejor horario para ti.',
      'Buenas tardes 🎯 Valoramos tu confianza en nosotros. ¿Te gustaría revisar los horarios disponibles esta semana?',
      '¡Hola! 💫 Como cliente VIP, queremos recordarte que puedes agendar tu próxima cita con prioridad.',
    ],
    evening: [
      'Buenas noches 🌙 Antes de que termine el día, ¿te gustaría revisar nuestra disponibilidad para tu próxima cita?',
      '¡Hola! 🌠 Como cliente especial, queremos recordarte que puedes agendar en cualquier momento. ¿Necesitas ver los horarios?',
      'Buenas noches ✨ ¿Has pensado en tu próxima cita? Tenemos horarios especiales para clientes VIP como tú.',
    ],
  };

  // Primer mensaje cada 6 horas (4 veces al día)
  schedule('0 */6 * * *', async () => {
    console.log('📅 Ejecutando recordatorio principal para usuarios calientes');

    try {
      const hotUsers = await wsUserService.getHotUsers();
      const hour = new Date().getHours();

      // Seleccionar conjunto de mensajes según la hora del día
      let timeMessages;
      if (hour >= 5 && hour < 12) {
        timeMessages = engagementMessages.morning;
      } else if (hour >= 12 && hour < 18) {
        timeMessages = engagementMessages.afternoon;
      } else {
        timeMessages = engagementMessages.evening;
      }

      for (const user of hotUsers) {
        try {
          const randomMessage =
            timeMessages[Math.floor(Math.random() * timeMessages.length)];

          await adapterProvider.sendMessage(
            user.phone_number,
            randomMessage,
            {}
          );

          await wsUserService.logInteraction(
            user.phone_number,
            'text',
            'Mensaje principal de engagement'
          );

          await utils.delay(5000);
        } catch (msgError) {
          console.error(
            `❌ Error al enviar mensaje principal a ${user.phone_number}:`,
            msgError
          );
        }
      }
    } catch (error) {
      console.error('❌ Error en recordatorio principal:', error);
    }
  });

  // Mensajes de seguimiento cada 12 horas
  schedule('0 */12 * * *', async () => {
    console.log('🔄 Ejecutando mensajes de seguimiento');

    try {
      const hotUsers = await wsUserService.getHotUsers();
      const followUpMessages = [
        '¿Has tenido oportunidad de revisar nuestros horarios disponibles? 📅 Estamos aquí para ayudarte.',
        'Como cliente VIP, queremos asegurarnos de que tengas la mejor experiencia. ¿Necesitas ayuda para agendar? 🌟',
        'Tu satisfacción es nuestra prioridad. ¿Podemos ayudarte a encontrar el horario perfecto para tu próxima cita? ✨',
      ];

      for (const user of hotUsers) {
        try {
          const randomMessage =
            followUpMessages[
              Math.floor(Math.random() * followUpMessages.length)
            ];

          await adapterProvider.sendMessage(
            user.phone_number,
            randomMessage,
            {}
          );

          await wsUserService.logInteraction(
            user.phone_number,
            'text',
            'Mensaje de seguimiento'
          );

          await utils.delay(5000);
        } catch (msgError) {
          console.error(
            `❌ Error al enviar mensaje de seguimiento a ${user.phone_number}:`,
            msgError
          );
        }
      }
    } catch (error) {
      console.error('❌ Error en mensajes de seguimiento:', error);
    }
  });

  // Recordatorios de citas (cada hora)
  schedule('0 * * * *', async () => {
    console.log('🔔 Verificando próximas citas para enviar recordatorios');

    try {
      const upcomingAppointments =
        await wsUserService.getUpcomingAppointments();

      for (const appointment of upcomingAppointments) {
        try {
          const appointmentTime = new Date(appointment.scheduled_at);
          const now = new Date();
          const hoursUntilAppointment = Math.round(
            (appointmentTime - now) / (1000 * 60 * 60)
          );

          if (
            hoursUntilAppointment === 24 ||
            hoursUntilAppointment === 2 ||
            Math.round((appointmentTime - now) / (1000 * 60)) === 30
          ) {
            const reminderMessage = `
¡Hola! 👋 Te recordamos tu próxima cita:

📅 Fecha: ${appointmentTime.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
⏰ Hora: ${appointmentTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
${appointment.zoom_link ? `🔗 Link de Zoom: ${appointment.zoom_link}` : ''}

Por favor, confirma tu asistencia respondiendo "confirmo" o "cancelar".
`;

            await adapterProvider.sendMessage(
              appointment.phone_number,
              reminderMessage,
              {}
            );

            await wsUserService.logInteraction(
              appointment.phone_number,
              'text',
              `Recordatorio de cita enviado (${hoursUntilAppointment} horas antes)`
            );
          }
        } catch (msgError) {
          console.error(
            `❌ Error al enviar recordatorio a ${appointment.phone_number}:`,
            msgError
          );
        }
      }
    } catch (error) {
      console.error('❌ Error al procesar recordatorios de citas:', error);
    }
  });
};
