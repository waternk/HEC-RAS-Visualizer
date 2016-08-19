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

    private style: string;
    private weight: string;

    private pixels: Array<string>;
    private fonts: Array<string>;
    private styles: Array<string>;
    private weights: Array<string>;

    public get Weight(): string 
    {
		return this.weight;
	}

	public set Weight(value: string) 
    {
		this.weight = value;
	}

	public get Style(): string 
    {
		return this.style;
	}

	public set Style(value: string) 
    {
		this.style = value;
	}

    public get Family(): string
    {
		return this.family;
	}

	public set Family(value: string)
    {
		this.family = value;
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
        for (var i = 15; i < 50; i++)
        {
            this.pixels.push(i+"px");
        }
        this.fonts = ['Lucida Console', 'Arial', 'Times New Roman'];
        this.styles = ['normal', 'italic', 'oblique'];
        this.weights = ['normal', 'bold'];
    }

    private SetDefaults()
    {
        this.color = "#ff0000";
        this.size = this.pixels[0];
        this.family = this.fonts[0];
        this.style = this.styles[0];
        this.weight = this.weights[0];
    }
    
    public Update()
    {
        this.IdeApp.UpdateLabels(this);
    }

}