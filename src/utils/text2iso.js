import { simpleChat } from '../services/simplegpt.js';

export async function text2iso(text) {
  const currentDate = new Date();

  const prompt = `The date today is ${currentDate.toISOString()}. I'll give text, need to convert it to ISO. Respond to me EXACTLY with this date and hour and in ISO format, using the 10:00 in case that is not the specific time. By example, if the text contains "hoy", assume the ISO for current date in one hour, if the text is "el jueves 30 de mayo a las 12hrs" respond with "2024-05-30T12:00:00.000". Or the text could be "Este viernes 29" and the month of today is ${currentDate.getMonth()} respond with "2024-11-29T10:00:00.000". If the text is "mañana 10am" sum one day and respond.  Or if the text is "mañana a las 9" you assume that this hour is 9am, same for 10, and 11; but if is "mañana a la 1" you assume that is 1pm,same with 2, 3, 4, 5 adn 6.  If it doesn't have sense, respond with "false".`;

  const messages = [
    {
      role: 'user',
      content: text,
    },
  ];

  const response = await simpleChat(prompt, messages);

  return response.trim();
}
