import { Component, OnInit} from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { IdeComponent} from './ide.component';

@Component({
    selector: 'my-app',
    template:
    `
    <h1>{{Title}}</h1>
    <router-outlet></router-outlet>
    `
    ,
    directives: [ROUTER_DIRECTIVES, IdeComponent],
    providers: [ROUTER_PROVIDERS]
})

@RouteConfig([
    {
        path: '/',
        name: '/',
        component: IdeComponent,
        useAsDefault: true
    }
])

export class AppComponent implements OnInit
{
   
    constructor()
    {
        
    }

    ngOnInit()
    {
        
    }
}