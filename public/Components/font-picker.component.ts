import { Component, OnInit, Input } from '@angular/core';
import { IdeComponent } from '../Components/ide.component';

@Component({
    selector: 'font-picker',
    templateUrl: '/Components/font-picker.component.html'
})

export class FontPickerComponent implements OnInit 
{
    @Input() IdeApp: IdeComponent;
    private size: string;
    private color: string;
    private family: string;
    private pixels: Array<string>;
    private fonts: Array<string>;

    public get Family(): string
    {
		return this.family;
	}

	public set Family(value: string)
    {
		this.family = value;
	}

	public get Fonts(): Array<string> 
    {
		return this.fonts;
	}

	public set Fonts(value: Array<string>) 
    {
		this.fonts = value;
	}
    
    public get Size(): string 
    {
        return this.size;
	}

	public set Size(value: string) 
    {
		this.size = value;
	}

	public get Color(): string 
    {
		return this.color;
	}

	public set Color(value: string) 
    {
		this.color = value;
	}

	public get Pixels(): Array<string> 
    {
		return this.pixels;
	}

	public set Pixels(value: Array<string>) 
    {
		this.pixels = value;
	}

    constructor()
    { 

    }

    ngOnInit()
    {
        this.SetSelects();
        this.SetDefaults();
    }

    private SetSelects()
    {
        this.pixels = [];
        for (var i = 10; i < 50; i++)
        {
            this.pixels.push(i+"px");
        }
        this.fonts = ['Lucida Console', 'Arial', 'Times New Roman'];
        
    }

    private SetDefaults()
    {
        this.color = "#ff0000";
        this.size = this.pixels[0];
        this.family = this.fonts[0];
    }
    
    private Update()
    {
        this.IdeApp.UpdateLabels(this.size, this.color, this.family);
    }

}