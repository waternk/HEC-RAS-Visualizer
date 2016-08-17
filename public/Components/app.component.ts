import { Component, OnInit } from '@angular/core';
import { IdeComponent} from './ide.component';

@Component({
    selector: 'my-app',
    template:
    `
    <ide-app></ide-app>
    `
    ,
    directives: [IdeComponent],
    
})

export class AppComponent implements OnInit
{
   
    constructor()
    {
        
    }

    ngOnInit()
    {
        
    }
}