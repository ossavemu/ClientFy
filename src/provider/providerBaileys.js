import { createProvider } from '@builderbot/provider-baileys';
import { logger } from '../services/logger.js';

export const providerBaileys = createProvider({
  name: 'baileys',
  options: {
    authPath: '/app/sessions',
    retries: 3,
    reconnectTimeout: 5000,
    qrTimeout: 60000,
    auth: {
      creds: {},
      keys: {},
    },
    logger: {
      level: 'error',
      stream: {
        write: (message) => {
          if (message.includes('QR')) {
            logger.info('QR Code actualizado - Escanee para conectar');
          } else if (message.includes('ERROR')) {
            logger.error('Error en Baileys:', message);
          } else if (message.includes('WARN')) {
            logger.warn('Advertencia en Baileys:', message);
          }
        },
      },
    },
    printQRInTerminal: false,
    browser: ['ClientFy', 'Chrome', '1.0.0'],
    logQR: false,
    patchMessageBeforeSending: false,
    shouldIgnoreJid: () => false,
    markOnlineOnConnect: false,
  },
});
