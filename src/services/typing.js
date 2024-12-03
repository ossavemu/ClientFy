import { config } from '../config/index.js';
import { wait } from '../utils/wait.js';


export const typing = async (time, { ctx, ctxFn }) => {
  if (config.provider === 'baileys') {
    const awaitTime = Math.ceil(parseInt(time) / 2) * 1000;

    await wait(awaitTime);

    await ctxFn.provider.vendor.sendPresenceUpdate(
      'composing',
      ctx.key.remoteJid
    );
    await wait(awaitTime);
  }
};

