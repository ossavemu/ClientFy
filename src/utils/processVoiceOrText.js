import { config } from '../config/index.js';
import { voice2text } from '../services/voicegpt.js';
import { downloadFile, downloadFileBaileys } from './downloader.js';
import { removeFile } from './remover.js';

export const processVoiceOrText = async (ctx) => {
  let filePath;
  try {
    const isVoiceNote = ctx.body.includes('_event_voice_note_');

    if (isVoiceNote) {
      if (config.provider === 'meta') {
        filePath = await downloadFile(ctx.url, config.jwtToken);
      } else if (config.provider === 'baileys') {
        filePath = await downloadFileBaileys(ctx);
      }
      const transcription = await voice2text(filePath.filePath);
      console.log('Transcripción de voz:', transcription);
      return transcription;
    }
    return ctx.body;
  } catch (error) {
    console.error('Error en processVoiceOrText:', error);
    throw error;
  } finally {
    if (filePath) {
      if (filePath.filePath) removeFile(filePath.filePath);
      if (filePath.fileOldPath) removeFile(filePath.fileOldPath);
    }
  }
};
