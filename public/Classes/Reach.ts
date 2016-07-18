import { Cross } from './Cross';
import { RiverPart } from './RiverPart';
import * as _ from 'lodash';

export class Reach {
    
    private _name: string;
    private _crosses: Array<Cross>;
    private _color: string;
    private _label: THREE.Sprite;
    private _basicMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    
    public get Label() : THREE.Sprite 
    {
        return this._label;
    }
    
    public set Label(v : THREE.Sprite) 
    {
        this._label = v;
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

    public CreateLabelAsSprite(scene: THREE.Scene, camera: THREE.Camera, scaleVector: THREE.Vector3, ratio: number)
    {
        var canvas = document.createElement('canvas');
        var size = 1024;
        canvas.width = size;
        canvas.height = size * ratio;
        var context = canvas.getContext('2d');
        context.fillStyle = '#ff0000';
        context.textAlign = 'center';
        context.font = '50px Helvetica Neue';
        context.fillText(this.Name, size / 2, size / 2);
        var amap = new THREE.Texture(canvas);
        amap.needsUpdate = true;

        var mat = new THREE.SpriteMaterial({
            map: amap,
            transparent: true,
            color: 0xffffff
        });
        var sp = new THREE.Sprite(mat);
        this._label = sp;
        
        sp.position.set(this.Crosses[Math.floor(
            this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].x * scaleVector.x,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].y  * scaleVector.y,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].z  * scaleVector.z
            );
        scene.add(sp);
        sp.updateMatrixWorld(true);
        
        // var vector = new THREE.Vector3();
        // vector.setFromMatrixPosition(sp.matrixWorld);
        // vector.project(camera);
        //sp.position.set(vector.x, vector.y + (0.2 * 1/ratio), vector.z);
    }

    public AddLabelToScene(scene: THREE.Scene)
    {
        scene.add(this.Label);
    }

    public RefreshLabelPosition(camera: THREE.Camera, ratio: number, scaleVector: THREE.Vector3)
    {
        this.Label.position.set(this.Crosses[Math.floor(
            this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].x * scaleVector.x,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].y  * scaleVector.y,
            this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].z  * scaleVector.z
            );
        this.Label.updateMatrixWorld(true);
        
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this.Label.matrixWorld);
        vector.project(camera);
        this.Label.position.set(vector.x, vector.y + (0.2 * 1/ratio), vector.z);
    }

    public ShowLabelAsHTML(scene: THREE.Scene, camera: THREE.Camera, canvas: HTMLElement, container: any, scaleVector: THREE.Vector3)
    {
            var obj = new THREE.Object3D();
            var vector = new THREE.Vector3();

            obj.position.set(this.Crosses[Math.floor(
                this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].x * scaleVector.x,
                this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].y  * scaleVector.y,
                this.Crosses[Math.floor(this.Crosses.length / 2)].vertices[Math.floor(this.Crosses[Math.floor(this.Crosses.length / 2)].vertices.length / 2)].z  * scaleVector.z
            );
            obj.scale.set(10, 10, 1 );
            obj.updateMatrixWorld(true);
            vector.setFromMatrixPosition(obj.matrixWorld);
            vector.project(camera);

            vector.x = ( vector.x * canvas.clientWidth/2 ) + canvas.clientWidth/2;
            vector.y = ( vector.y * canvas.clientHeight/2 ) + canvas.clientHeight/2;

            var elem = document.createElement("p");
            elem.style.position="absolute";
            elem.style.color="red";
            elem.innerText = this.Name;
            container.appendChild(elem);

            elem.style.left = vector.x + 'px';
            elem.style.top = (canvas.clientHeight - vector.y) + 'px';    
    }

    public AddToSceneLikeMesh(scene: THREE.Scene, labelScene: THREE.Scene, camera: THREE.Camera, cameraHUD: THREE.Camera, scaleVector?: THREE.Vector3)
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

    public AddToSceneLikeLines(scene: THREE.Scene, labelScene: THREE.Scene, camera: THREE.Camera, cameraHUD: THREE.Camera, scaleVector?: THREE.Vector3)
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
    
    constructor() 
    {
        this._crosses = new Array<Cross>();
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