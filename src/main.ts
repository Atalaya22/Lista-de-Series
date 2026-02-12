import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Arranca la aplicacion Angular usando la configuracion global declarada en app.config.ts.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
