import { Cross } from './Cross';
import { Reach } from './Reach';
import { RiverPart } from './RiverPart';
import { FileManager } from './FileManager';

export class ReachCollection 
{
    private _reaches: Array<Reach>;
   
    public get Reaches() : Array<Reach>
    {
        return this._reaches;
    }
    
    public set Reaches(v : Array<Reach>)
    {
        this._reaches = v;
    }

    constructor() 
    {
        this._reaches = new Array<Reach>();
    }
    
    TranslateCross(cross: Cross, vec: THREE.Vector3)
    {
        var m = new THREE.Matrix4();
        m.makeTranslation(vec.x, vec.y, vec.z);
        for (var i = 0; i < cross.vertices.length; i++)
        {
            cross.vertices[i] = cross.vertices[i].applyMatrix4(m);  
        }
    }
    
    Organize()
    {
        var cross : Cross = this._reaches[0].Crosses[0];
        var leftCoastFirst = cross.LeftCoast;
        var rightCoastFirst = cross.RightCoast;
        var mt = new THREE.Matrix4;
        var mtBack = new THREE.Matrix4;
        var mRotate = new THREE.Matrix4;
        var vecx = new THREE.Vector3(1, 0, 0);
        for(var r = 0; r < this._reaches.length; r++)
        {
            for (var i = 0; i < this._reaches[r].Crosses.length; i++)
            {
                cross = this._reaches[r].Crosses[i];
                var newLeftX = cross.LeftCoast.x - leftCoastFirst.x;
                var newLeftZ = cross.LeftCoast.z - leftCoastFirst.z;
                
                var firstVertex = cross.vertices[0];
                var lastVertex = cross.vertices[cross.vertices.length-1];
                
                var lc = new THREE.Vector3(cross.LeftCoast.x, 0, cross.LeftCoast.z);
                var rc = new THREE.Vector3(cross.RightCoast.x, 0, cross.RightCoast.z);
                
                var subVecGlobal = new THREE.Vector3();
                subVecGlobal.subVectors(rc, lc);
                subVecGlobal.normalize();
                
                var subVecLocal = new THREE.Vector3();
                subVecLocal.subVectors(lastVertex, firstVertex);
                subVecLocal.normalize();
                var quaternion = new THREE.Quaternion().setFromUnitVectors(subVecLocal, subVecGlobal);
                mRotate = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
                mt.makeTranslation(-cross.vertices[0].x, -cross.vertices[0].y, -cross.vertices[0].z)
                mtBack.makeTranslation(newLeftX, 0, newLeftZ);
                //mtBack.makeTranslation(cross.LeftCoast.x, 0, cross.LeftCoast.z);
                
                for (var j = 0; j < cross.vertices.length; j++) 
                {
                    cross.vertices[j].applyMatrix4(mt);
                    var quaternion = new THREE.Quaternion().setFromUnitVectors(subVecLocal, subVecGlobal);
                    mRotate = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
                }
                var vg = subVecGlobal.subVectors(rc, lc);
                var vl = subVecLocal.subVectors(lastVertex, firstVertex);
                var lxl = new THREE.Vector3(vl.x, vl.y, vl.z), 
                lxg = new THREE.Vector3(vg.x, vg.y, vg.z);
                var kx = lxg.length() / lxl.length(); 
                
                for (var j = 0; j < cross.vertices.length; j++) 
                {
                    cross.vertices[j].applyMatrix4(new THREE.Matrix4().makeScale(kx, 1, 1));
                    cross.vertices[j].applyMatrix4(mRotate);
                    cross.vertices[j].applyMatrix4(mtBack);   
                }

                subVecGlobal.subVectors(rc, lc);
                subVecLocal.subVectors(lastVertex, firstVertex);
            }
        }
    }

    PushReach(reach: Reach)
    {
        this._reaches.push(reach);
    }

    Clear()
    {
        this._reaches = [];
    }
    
    public AddReachesLikeMeshToScene(scene: THREE.Scene, labelScene: THREE.Scene, camera: THREE.Camera, cameraHUD: THREE.Camera, canvas: HTMLElement, scaleVector?: THREE.Vector3)
    {
        for(var r = 0; r < this.Reaches.length; r++)
        {
            this.Reaches[r].AddToSceneLikeMesh(scene, labelScene, camera, cameraHUD, scaleVector)
        }
    }
    
    public AddReachesLikeLinesToScene(scene: THREE.Scene, labelScene: THREE.Scene, camera: THREE.Camera, cameraHUD: THREE.Camera, canvas: HTMLElement, scaleVector?: THREE.Vector3)
    {
        var indices = new Array<number>();
        var positions;
        var numOfAllVertices = 0;
        var offset = 0;
        var offsetInd = 0;

        for(var r = 0; r < this.Reaches.length; r++)
        {
            var reach = this.Reaches[r];
            
            for (var i = 0; i < reach.Crosses.length; i++)
            {
                var cross = reach.Crosses[i];
                numOfAllVertices += cross.vertices.length;
            }
        }
        
        positions = new Float32Array(numOfAllVertices * 3);

        for(var r = 0; r < this.Reaches.length; r++)
        {
            var reach = this.Reaches[r];
            
            for (var i = 0; i < reach.Crosses.length; i++) 
            {
                var cross = reach.Crosses[i];
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
        }

        for (var i = 0; i < positions.length; i++) 
        {
            var element = positions[i];
        }
        
        for (var i = 0; i < indices.length; i++) 
        {
            var ind = indices[i];
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
        scene.add(line); 
    }
    
    SortCrossesByPositionSelectionSort()
    {
        for(var r = 0; r < this._reaches.length; r++)
        {
            for (var i = 0; i < this._reaches[r].Crosses.length - 1; i++) 
            {
                for (var j = i + 1; j < this._reaches[r].Crosses.length; j++)
                {
                    if(this._reaches[r].Crosses[i].Position > this._reaches[r].Crosses[j].Position)
                    {
                        var tmp = this._reaches[r].Crosses[i];
                        this._reaches[r].Crosses[i] = this._reaches[r].Crosses[j];
                        this._reaches[r].Crosses[j] = tmp;
                    }
                }
            }
        }
    }
    
    GetRandomColor() 
    {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    Load(inputs: Array<String>, scale: number, ratio:number, callback: Function)
    {
        for (var k = 0; k < inputs.length; k++) 
        {
            var input = inputs[k];
            var reaches = input.split('reach');
            for (var r = 1; r < reaches.length; r++) 
            {
                var reach = new Reach();
                
                var crossesInputs = reaches[r].split('presek');
                reach.Name = crossesInputs[0];
                 
                for (var i = 1; i < crossesInputs.length; i++)
                {
                    var cross = new Cross();
                    var crossInput = crossesInputs[i];
                    var lines = crossInput.split('\n');    
                    var lineNum = 1;
                    cross.Position = Number(lines[lineNum++]);
                    var lcost = lines[lineNum++].split(" ");
                    cross.LeftCoast = {x: Number(lcost[0]) * scale , z: Number(lcost[1]) * scale };
                    var rcost = lines[lineNum++].split(" ");
                    cross.RightCoast = {x: Number(rcost[0]) * scale , z: Number(rcost[1]) * scale};
                    
                    var arr = [];

                    for(var line = lineNum; line < lines.length-1; line++)
                    {
                        var lineAfterSplit = lines[line].split(" ");
                        var x : number = Number(lineAfterSplit[0]);
                        var y : number = Number(lineAfterSplit[1]);

                        arr.push(new THREE.Vector3((x as number) * scale, (y as number) * scale));

                    }
                    cross.setVerticesByArray(new THREE.SplineCurve3(arr).getPoints(50));
                    reach.Crosses.push(cross);  
                }
                reach.Color = this.GetRandomColor();
                this.PushReach(reach);
            }    
        }
            
        if(callback)
        {
            callback();
        }
    }

    LoadCrossesFromFile(url, scale: number, ratio:number, callback: Function)
    {
        var fileManager = new FileManager();
        
        fileManager.FileOpen(url, this, (text) => {
            
            var reaches = text.split('reach');
            for (var r = 1; r < reaches.length; r++) 
            {
                var reach = new Reach();
                
                var crossesInputs = reaches[r].split('presek');
                reach.Name = crossesInputs[0];
                 
                for (var i = 1; i < crossesInputs.length; i++)
                {
                    var cross = new Cross();
                    var crossInput = crossesInputs[i];
                    var lines = crossInput.split('\n');    
                    var lineNum = 1;
                    cross.Position = Number(lines[lineNum++]);
                    var lcost = lines[lineNum++].split(" ");
                    cross.LeftCoast = {x: (lcost[0] as number) * scale, z: (lcost[1] as number) * scale};
                    var rcost = lines[lineNum++].split(" ");
                    cross.RightCoast = {x: (rcost[0] as number) * scale , z: (rcost[1] as number) * scale};
                    
                    var arr = [];

                    for(var line = lineNum; line < lines.length-1; line++)
                    {
                        var lineAfterSplit = lines[line].split(" ");
                        var x : number = Number(lineAfterSplit[0]);
                        var y : number = Number(lineAfterSplit[1]);

                        arr.push(new THREE.Vector3((x as number) * scale, (y as number) * scale));

                    }
                    cross.setVerticesByArray(new THREE.SplineCurve3(arr).getPoints(100));
                    reach.Crosses.push(cross);  
                }
                reach.Color = this.GetRandomColor();
                this.PushReach(reach);
            } 
            
            if(callback)
            {
                callback();
            } 
            
        });
    }
    
}