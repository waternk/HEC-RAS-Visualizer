import { Cross } from './Cross';
import * as _ from 'lodash';

export class RiverPart extends THREE.Geometry
{
    private _crossList : Array<Cross>;
    
    constructor(cross1: Cross, cross2: Cross)
    {
        super();
        this._crossList = new Array<Cross>(2);
        this._crossList[0] = cross1;
        this._crossList[1] = cross2;
    }

    public setFaces()
    {
        var br = 1;
        var i = 0;
        var indices = [];

        while (i < (2 * (this._crossList[0].vertices.length - 1)))
        {
            indices.push(br);
            if(br%3==0){
                this.faces.push(new THREE.Face3(indices[0]-1, indices[1]-1, indices[2]-1));
                i++;
                indices = [];
            }
            br++;
        }
        
        for (var i = 0; i < this._crossList[0].vertices.length-1; i++) 
        {
            this.vertices.push(this._crossList[0].vertices[i]);
            this.vertices.push(this._crossList[1].vertices[i]);
            this.vertices.push(this._crossList[1].vertices[i+1]);
            
            this.vertices.push(this._crossList[1].vertices[i+1]);
            this.vertices.push(this._crossList[0].vertices[i+1]);
            this.vertices.push(this._crossList[0].vertices[i]);
        }
    }

    public AddToSceneLikeMesh(scene: THREE.Scene, color?: string, scaleVector?: THREE.Vector3)
    {
        var basicMaterial = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide,  wireframe: false});
             
        
        this.computeFaceNormals();
        this.computeVertexNormals();
        var meshRiverPart = new THREE.Mesh(this, basicMaterial);
        meshRiverPart.scale.set(scaleVector.x, scaleVector.y, scaleVector.z);
        scene.add(meshRiverPart);
    }
}