// App instance and window bindings
import { HealthTracker } from './HealthTracker.js';

export const app = new HealthTracker();
window.app = app;
window.audioManager = app.audioManager;
