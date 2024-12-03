import { readFileSync } from 'fs';
import OpenAI from 'openai';
import { config } from '../config/index.js';

const openaiApiKey = config.openai_apikey;
const assistant = config.assistant;
const prompt = readFileSync('./prompt.txt', 'utf8');

export const chat = async (question, name, thread = null) => {
  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    thread = thread || (await openai.beta.threads.create());

    // Crear el mensaje del usuario en el hilo
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: question,
    });

    // Crear y ejecutar la corrida del asistente
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant,
      instructions: `${config.defaultPrompt(name)}\n\n${prompt}`,
    });

    // Si la corrida se completa, obtén la lista de mensajes y la última respuesta del asistente
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      for (const message of messages.data.reverse()) {
        console.log(
          `Mensaje GS: ${message.role} > ${message.content[0].text.value}`
        );
      }
      const assistantResponse = messages.data
        .filter((message) => message.role === 'assistant')
        .pop(); // Obtiene el último mensaje del asistente

      // Devuelve el thread y la última respuesta del asistente (si existe)
      const answer = assistantResponse
        ? assistantResponse.content[0].text.value
        : null;
      const cleanAnswer = answer.replace(/【\d+:\d+†source】/g, '');
      return {
        thread,
        response: cleanAnswer,
      };
    }

    // Si el run no se completó, devolver solo el thread
    return { thread, response: null };
  } catch (err) {
    console.error('Error al conectar con OpenAI:', err);
    return { thread, response: 'ERROR' };
  }
};
