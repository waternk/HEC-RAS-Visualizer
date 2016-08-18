import { Cross } from './Cross';
import { RiverPart } from './RiverPart';
import { FontPickerComponent } from '../Components/font-picker.component';
import * as _ from 'lodash';

export class Reach {
    
    private _name: string;
    private _crosses: Array<Cross>;
    private _color: string;
    private _visible: boolean;
    private _labelMesh: THREE.Mesh;
    private _labelHTML: HTMLElement;
    private _labelID: string;
    private LabelHTMLObject3D: THREE.Object3D;
    private _basicMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    
    public get labelID(): string 
    {
		return this._labelID;
	}

	public set labelID(value: string) 
    {
		this._labelID = value;
	}

    public get Visible() : boolean 
    {
        return this._visible;
    }
    
    public set Visible(v : boolean) 
    {
        this._visible = v;
    }
    
    public get labelHTML(): HTMLElement {
		return this._labelHTML;
	}

	public set labelHTML(value: HTMLElement) {
		this._labelHTML = value;
	}

    public get LabelMesh() : THREE.Mesh 
    {
        return this._labelMesh;
    }
    
    public set LabelMesh(v : THREE.Mesh) 
    {
        this._labelMesh = v;
    }
    
    public get Color() : string 
    {
        return this._color; 
    }
    
    public set Color(c : string) 
    {
        this._color = c;
    }
    
    public get Name() : string 
    {
        return this._name; 
    }
    
    public set Name(v : string) 
    {
        this._name = v;
    }
    
    public get Crosses() : Array<Cross> 
    {
        return this._crosses;
    }
    
    public set Crosses(carr : Array<Cross>) 
    {
        this._crosses = carr;
    }

    CreateLabelAsTextGeometry(font: THREE.Font)
    {
        var geometry = new THREE.TextGeometry( this._name, {

            font: font,
            size: 0.05,
            height: 0.0125,
            curveSegments: 2,
            bevelEnabled: false,
            bevelThickness: 10,
            bevelSize: 8
        });
        
        var textMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
        var mesh = new THREE.Mesh(geometry, textMaterial);
        
        mesh.position.set
        (
            this.Crosses[Math.floor(
            this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].x,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].y,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].z
        );
        this._labelMesh = mesh;     
    }

    CreateLabelAsHTML(font: FontPickerComponent)
    {
        this.LabelHTMLObject3D = new THREE.Object3D();
        
        this.LabelHTMLObject3D.position.set(this.Crosses[Math.floor(
            this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].x,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].y,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].z
        );
        
        this.LabelHTMLObject3D.scale.set(10, 10, 1 );
        this.LabelHTMLObject3D.updateMatrixWorld(true);
        this._labelHTML = document.createElement("p");
        this._labelID = "lbl_" + this.Name;
        this._labelHTML.id = this._labelID;
        this._labelHTML.style.position = "absolute";
        this._labelHTML.style.color = font.Color;
        this._labelHTML.style.fontSize = font.Size + 'px';
        this._labelHTML.style.fontFamily = font.Family;
        this._labelHTML.innerText = this.Name;
    }

    UpdateLabel(size: string, color: string, family: string)
    {
        this._labelHTML.style.color = color;
        this._labelHTML.style.fontSize = size;
        this._labelHTML.style.fontFamily = family;
    }

    public AddLabelToScene(scene: THREE.Scene)
    {
        if(this.LabelMesh)
            scene.add(this.LabelMesh);
    }

    public RefreshLabelPosition(camera: THREE.Camera, scaleVector: THREE.Vector3)
    {
        if(!this.LabelMesh)
            return;
        this.LabelMesh.position.set(this.Crosses[Math.floor(
            this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].x * scaleVector.x,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].y  * scaleVector.y,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].z  * scaleVector.z
        );
        this.LabelMesh.updateMatrixWorld(true);
        
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.LabelMesh.matrixWorld);
        vector.project(camera);
        this.LabelMesh.position.set(vector.x, vector.y, vector.z);
    }

    public RefreshHTMLLabelPosition(camera: THREE.Camera, scaleVector: THREE.Vector3, canvas: HTMLElement)
    {
        if(!this.labelHTML)
            return;
        this.LabelHTMLObject3D.position.set(this.Crosses[Math.floor(
            this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].x * scaleVector.x,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].y  * scaleVector.y,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].z  * scaleVector.z
        );
        this.LabelHTMLObject3D.updateMatrixWorld(true);
        
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.LabelHTMLObject3D.matrixWorld);
        vector.project(camera);
        vector.x = ( vector.x * canvas.clientWidth/2 ) + canvas.clientWidth/2;
        vector.y = ( vector.y * canvas.clientHeight/2 ) + canvas.clientHeight/2;
        this.LabelHTMLObject3D.position.set(vector.x, vector.y, vector.z);
        this._labelHTML.style.left = vector.x + 'px';
        this._labelHTML.style.top = (canvas.clientHeight - vector.y) + 'px';  
    }

    public AddToSceneLikeMesh(scene: THREE.Scene, camera: THREE.Camera, cameraHUD: THREE.Camera, scaleVector?: THREE.Vector3)
    {
        var parts = new Array<RiverPart>();
        for (var i = 0; i < this.Crosses.length - 1; i++)
        {
            var rp = new RiverPart(this.Crosses[i], this.Crosses[i + 1]);
            rp.setFaces();
            parts.push(rp);
        }
        scene.add(this.CreateMesh(parts, scaleVector));
    }
    
    public CreateMesh(parts: Array<RiverPart>, scaleVector?: THREE.Vector3) : THREE.Mesh
    {
        var geo = new THREE.Geometry();
        for (var index = 0; index < parts.length; index++) 
        {
            var part = parts[index];
            geo.mergeMesh(new THREE.Mesh(part));
        }

        var basicMaterial = new THREE.MeshLambertMaterial({ color: this._color, side: THREE.DoubleSide,  wireframe: false});
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        
        var mesh = new THREE.Mesh(geo, basicMaterial);
        if(scaleVector)
            mesh.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);

        return mesh;
    }

    public AddToSceneLikeLines(scene: THREE.Scene, camera: THREE.Camera, cameraHUD: THREE.Camera, scaleVector?: THREE.Vector3)
    {
        var crosses = new Array<Cross>();
        var indices = new Array<number>();
        var numOfAllVertices = 0;

        for (var i = 0; i < this.Crosses.length; i++)
        {
            var cross = this.Crosses[i];
            crosses.push(cross);
            numOfAllVertices += cross.vertices.length;
        }
        
        var positions = new Float32Array(numOfAllVertices * 3);
        var offset = 0;
        var offsetInd = 0;
        for (var i = 0; i < crosses.length; i++) 
        {
            var cross = crosses[i];
            var vertices = cross.vertices;
            
            for (var j = 0; j < vertices.length; j++) 
            {
                positions[j * 3 + offset] = vertices[j].x * scaleVector.x;
                positions[j * 3 + 1 + offset] = vertices[j].y * scaleVector.y;
                positions[j * 3 + 2 + offset] = vertices[j].z * scaleVector.z;
            }

            for (var j = 0; j < vertices.length - 1; j++) 
            {
                indices.push(j + offsetInd);
                indices.push(j + 1 + offsetInd);
            }
            offsetInd += vertices.length;
            offset += vertices.length * 3;
        }
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
        var line = new THREE.LineSegments(geometry, this._basicMaterial);
        
        scene.add(line);        
    }

    public ResetToOrigin()
    {
        var index = Math.floor(this.Crosses.length / 2);
        var x = this.Crosses[index].vertices[0].x;
        var y = this.Crosses[index].vertices[0].y;
        var z = this.Crosses[index].vertices[0].z;
        var m = new THREE.Matrix4().makeTranslation(-x, -y, -z);

        for (var i = 0; i < this.Crosses.length; i++)
        {
            for (var j = 0; j < this.Crosses[i].vertices.length; j++)
            {
               this.Crosses[i].vertices[j].applyMatrix4(m);   
            }
        }
    }
    
    constructor(visible?: boolean) 
    {
        this._crosses = new Array<Cross>();
        this._visible = visible? true : false;
    }

    public Copy() : Reach
    {
        var newReach = _.cloneDeep(this);
        newReach.Crosses = new Array<Cross>();
        for (var i = 0; i < this.Crosses.length; i++) 
        {
            var cross = this.Crosses[i];
            var newCross = new Cross();
            for (var j = 0; j < cross.vertices.length; j++) 
            {
                var vertex = cross.vertices[j];
                newCross.vertices.push(_.cloneDeep<THREE.Vector3>(vertex));
            }
            newReach.Crosses.push(newCross);
        }
         return newReach;
    }
}