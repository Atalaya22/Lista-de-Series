import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// Configuracion global de la aplicacion Angular.
export const appConfig: ApplicationConfig = {
  providers: [
    // Captura errores globales del navegador y los integra con Angular.
    provideBrowserGlobalErrorListeners(),
    // Agrupa eventos para reducir ciclos de deteccion de cambios.
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Habilita enrutador (aunque actualmente no hay rutas declaradas).
    provideRouter(routes),
    // Habilita HttpClient para consumir la API backend.
    provideHttpClient(),
  ],
};
