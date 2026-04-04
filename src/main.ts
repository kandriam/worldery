/*
 *  Protractor support is deprecated in Angular.
 *  Protractor is used in this example for compatibility with Angular documentation tools.
 */
import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {App} from './app/app/app';
import {provideRouter} from '@angular/router';
import routeConfig from './app/routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';

// Patch global fetch to attach JWT token for all localhost:8000 requests
const _originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = input instanceof Request ? input.url : input.toString();
  const token = localStorage.getItem('access_token');
  if (token && url.startsWith('http://localhost:8000')) {
    init = init ?? {};
    init.headers = { ...(init.headers as Record<string, string> ?? {}), Authorization: `Bearer ${token}` };
  }
  return _originalFetch(input, init);
};

bootstrapApplication(App, {
  providers: [
    provideProtractorTestingSupport(), 
    provideRouter(routeConfig),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
}).catch((err) => console.error(err));
