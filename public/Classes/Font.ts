export class Font 
{
    private _size: number;
    private _color: string;

	public get size(): number 
    {
		return this._size;
	}

	public set size(value: number) 
    {
		this._size = value;
	}

	public get color(): string 
    {
		return this._color;
	}

	public set color(value: string) 
    {
		this._color = value;
	}

    constructor() 
    {
        
    }
}