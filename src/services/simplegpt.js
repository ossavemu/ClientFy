import OpenAI from 'openai';
import { config } from '../config/index.js';

const openaiApiKey = config.openai_apikey;

export async function simpleChat(prompt, messages) {
  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }, ...messages],
    });

    const answer = completion.choices[0].message.content;
    return answer;
  } catch (err) {
    console.error('Error al conectar con OpenAI:', err);
    return 'ERROR';
  }
}
