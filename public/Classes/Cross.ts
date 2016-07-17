export class Cross extends THREE.Geometry 
{
    private _leftCoast = {x: 0, z: 0};
    private _rightCoast = {x: 0, z: 0};
    private _position: number;

    public get LeftCoast() : any 
    {
        return this._leftCoast;
    }
    
    public set LeftCoast(v : any) 
    {
        this._leftCoast = v;
    }

    public get RightCoast() : any
    {
        return this._rightCoast; 
    }

    public set RightCoast(v : any) 
    {
        this._rightCoast = v;
    }
    
    public get Position() : number 
    {
        return this._position; 
    }

    public set Position(v : number) 
    {
        this._position = v;
    }
    
    constructor() 
    {
        super();
    }

    setVerticesByArray(array: Array<THREE.Vector3>)
    {
        this.vertices = [];
        array.forEach(v => {
            this.vertices.push(v);
        });
    } 
}