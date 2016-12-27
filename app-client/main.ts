import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule }              from './app.module';
import { CoreModule }			  from './core/core.module';
platformBrowserDynamic().bootstrapModule(AppModule);
platformBrowserDynamic().bootstrapModule(CoreModule);
