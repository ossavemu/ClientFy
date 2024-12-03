import { createFlow } from '@builderbot/bot';
import { confirmationFlow, dateFlow } from './dateFlow.js';
import { eventCreationFlow } from './eventCreationFlow.js';
import { formFlow } from './formFlow.js';
import { voiceFlow } from './voiceFlow.js';
import { welcomeFlow } from './welcomeFlow.js';

export default createFlow([
  welcomeFlow,
  voiceFlow,
  formFlow,
  confirmationFlow,
  dateFlow,
  eventCreationFlow,
]);
