import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { enableProdMode, isDevMode } from '@angular/core';

// Enable production mode for better performance
if (document.location.hostname !== 'localhost') {
  console.log('Enabling production mode');
  enableProdMode();
} else {
  console.log('Running in development mode');
}

console.log('Development mode?', isDevMode());

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Bootstrap error:', err);
  });
