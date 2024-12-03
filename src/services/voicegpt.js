import fs from 'fs';
import OpenAI from 'openai';
import { config } from '../config/index.js';

const openaiApiKey = config.openai_apikey;

export const voice2text = async (path) => {
  if (!fs.existsSync(path)) throw new Error('No se encuentra el archivo');

  try {
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    const resp = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path),
      model: 'whisper-1',
    });
    return resp.text;
  } catch (err) {
    console.log(err);
    return 'Error';
  }
};
