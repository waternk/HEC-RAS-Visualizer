export class Axes extends THREE.Object3D{
    private xMesh: THREE.Mesh;
    private yMesh: THREE.Mesh;
    private zMesh: THREE.Mesh;
    private xObj: THREE.Object3D;
    private yObj: THREE.Object3D;
    private zObj: THREE.Object3D;
    private font: THREE.Font;
    public axes: THREE.Object3D;

    constructor(length: number, font: THREE.Font)
    {   
        super();
        this.font = font;
        this.axes = this.buildAxes(length);
        
        this.add(this.xMesh);
        this.add(this.yMesh);
        this.add(this.zMesh);

        this.add(this.axes);
        this.axes.visible = true;
        this.xMesh.visible = true;
        this.yMesh.visible = true;
        this.zMesh.visible = true;
        this.visible = true;
    }

    private buildAxes(length) 
    {
         var xGeometry = new THREE.TextGeometry( "x", {
            font: this.font,
            size: 0.035,
            height: 0.0125,
            curveSegments: 2,
            bevelEnabled: false,
            bevelThickness: 10,
            bevelSize: 8
        });
        var yGeometry = new THREE.TextGeometry( "y", {
            font: this.font,
            size: 0.035,
            height: 0.0125,
            curveSegments: 2,
            bevelEnabled: false,
            bevelThickness: 10,
            bevelSize: 8
        });
        var zGeometry = new THREE.TextGeometry( "z", {
            font: this.font,
            size: 0.035,
            height: 0.0125,
            curveSegments: 2,
            bevelEnabled: false,
            bevelThickness: 10,
            bevelSize: 8
        });
        
        var textMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false } );
        this.xMesh = new THREE.Mesh(xGeometry, textMaterial);
        this.yMesh = new THREE.Mesh(yGeometry, textMaterial);
        this.zMesh = new THREE.Mesh(zGeometry, textMaterial);
        
        this.xMesh.position.set(length, 0, 0);
        this.yMesh.position.set(0, length, 0);
        this.zMesh.position.set(0, 0, length);
        this.xObj = new THREE.Object3D();
        this.yObj = new THREE.Object3D();
        this.zObj = new THREE.Object3D();
        this.xObj.position.set(length, 0, 0);
        this.yObj.position.set(0, length, 0);
        this.zObj.position.set(0, 0, length);
        var axes = new THREE.Object3D();
        axes.add(this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false )); // +X
        axes.add(this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false )); // +Y
        axes.add(this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false )); // +Z
        axes.add(this.xObj);
        axes.add(this.yObj);
        axes.add(this.zObj);
        return axes;
    }

    private buildAxis( src, dst, colorHex, dashed ) 
    {
        var geom = new THREE.Geometry(),
            mat; 

        if(dashed) {
            mat = new THREE.LineDashedMaterial({ linewidth: 2, color: colorHex, dashSize: 3, gapSize: 3 });
        } else {
            mat = new THREE.LineBasicMaterial({ linewidth: 2, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;

    }

    public AddToScene(scene: THREE.Scene)
    {
        scene.add(this.axes);
        scene.add(this.xMesh);
        scene.add(this.yMesh);
        scene.add(this.zMesh);
        //scene.add(this);
    }
    
    public Refresh(camera: THREE.Camera)
    {
        this.axes.setRotationFromQuaternion(camera.quaternion);
        var xpos = new THREE.Vector3().setFromMatrixPosition(this.xObj.matrixWorld);
        var ypos = new THREE.Vector3().setFromMatrixPosition(this.yObj.matrixWorld);
        var zpos = new THREE.Vector3().setFromMatrixPosition(this.zObj.matrixWorld);
        
        this.xMesh.position.set(xpos.x, xpos.y, 0.1);
        this.yMesh.position.set(ypos.x, ypos.y, 0.1);
        this.zMesh.position.set(zpos.x, zpos.y, 0.1);
    }
}