import { bootstrap }    from '@angular/platform-browser-dynamic';
import { AppComponent }  from './Components/app.component';
import { ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { HTTP_PROVIDERS } from '@angular/http';
import { DataService } from "./Services/data.service";
bootstrap(AppComponent, [ROUTER_PROVIDERS , HTTP_PROVIDERS, DataService]);