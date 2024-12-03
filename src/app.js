import { createBot, MemoryDB as Database } from '@builderbot/bot';
import { createServer } from 'net';
import { config } from './config/index.js';
import { db } from './database/connection.js';
import { providerBaileys, providerMeta } from './provider/index.js';
import { reminder } from './services/reminder.js';
import templates from './templates/index.js';

// Modificamos para usar el puerto del ambiente si está disponible
const BASE_PORT = 3008;
const INSTANCE_ID = process.env.INSTANCE_ID || '1';
const MAX_INSTANCES = 4;

// Asegurar que el INSTANCE_ID esté dentro del rango válido
const instanceId = Math.min(Math.max(parseInt(INSTANCE_ID), 1), MAX_INSTANCES);
const PORT = BASE_PORT + (instanceId - 1);

// Función para logs limpios
const log = (message, error = false) => {
  const timestamp = new Date().toISOString();
  const prefix = error ? '❌ ERROR:' : '✅ INFO:';
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

const main = async () => {
  try {
    log('Iniciando aplicación...');
    await db.testConnection();
    log('Conexión a base de datos establecida');

    const adapterFlow = templates;
    let adapterProvider;

    if (config.provider === 'meta') {
      adapterProvider = providerMeta;
      log('Usando provider Meta');
    } else if (config.provider === 'baileys') {
      adapterProvider = providerBaileys;
      log('Usando provider Baileys');
    } else {
      throw new Error('ERROR: Falta agregar un provider al .env');
    }

    const adapterDB = new Database();

    const { httpServer } = await createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    httpServer(PORT);
    log(`Servidor iniciado en puerto ${PORT}`);

    reminder(adapterProvider);
    log('Servicio de recordatorios iniciado');

    log('Bot y servicios iniciados correctamente');
  } catch (error) {
    log(error.message, true);
    process.exit(1);
  }
};

main();
