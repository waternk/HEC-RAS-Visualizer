import { Component, OnInit, Injectable, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { UploaderComponent } from './uploader.component';
import { Reach } from '../Classes/Reach';
import { Cross } from '../Classes/Cross';
import { FileManager } from '../Classes/FileManager';
import { ReachCollection } from '../Classes/ReachCollection';
import * as _ from 'lodash';

@Component({
    selector: 'ide-app',
    templateUrl: '/Components/ide.component.html',
    styles:[
    `
    body {
        padding: 50px;
        font: 14px "Lucida Grande", Helvetica, Arial, sans-serif;
    }

    a {
        color: #00B7FF;
    }

    #canvas{
        border:1px solid gray;
    }
    #viewport{

    }

    .noselect {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none;   /* Chrome/Safari/Opera */
        -khtml-user-select: none;    /* Konqueror */
        -moz-user-select: none;      /* Firefox */
        -ms-user-select: none;       /* Internet Explorer/Edge */
        user-select: none;           /* Non-prefixed version, currently
                                        not supported by any browser */
    }
    td {
        max-width: 190px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .input-xs {
        height: 22px;
        padding: 5px 5px;
        font-size: 12px;
        line-height: 1.5;
        border-radius: 3px;
    }
    .click : hover{
        cursor: pointer;
    }

    .btn:focus, .btn:active{
        outline: none !important;
    }

    `],
    directives: [UploaderComponent]
})

export class IdeComponent implements OnInit, AfterViewChecked
{
    @ViewChild(UploaderComponent) Uploader: UploaderComponent;
    @ViewChild('ZoomAllButton') ZoomAllButton: ElementRef;
    @ViewChild('ZoomInButton') ZoomInButton: ElementRef;
    @ViewChild('ZoomOutButton') ZoomOutButton: ElementRef;
    @ViewChild('RotateButton') RotateButton: ElementRef;
    @ViewChild('MoveButton') MoveButton: ElementRef;
    @ViewChild('LabelButton') LabelButton: ElementRef;
    @ViewChild('MeshButton') MeshButton: ElementRef;
    @ViewChild('LinesButton') LinesButton: ElementRef;

    IdeApp: IdeComponent;
    HECRASInputs: Array<String>;
    DisplayView: any;
    ratio: number;
    selectedReach: Reach;
    crossScaleX: number = 1;
    crossScaleY: number = 1;
    crossScaleZ: number = 1;
    Reaches: Array<Reach>;
    showLabels: boolean;
    divCanvas: HTMLElement;
    fileManager: FileManager;
    camera: THREE.OrthographicCamera;
    cameraHUD: THREE.Camera;
    scene: THREE.Scene;
    labelScene: THREE.Scene;
    object3D: THREE.AxisHelper;
    Plane: THREE.Plane;
    PointLight: THREE.PointLight;
    AmbientLight: THREE.AmbientLight;
    reachCollection: ReachCollection;
    gl: any;
    renderer: any;
    controls: THREE.OrthographicTrackballControls;
    prevCtrls: THREE.OrthographicTrackballControls;
    prevCam: THREE.OrthographicCamera;

    constructor()
    {
        this.IdeApp = this;
        ideApp = this;
        this.DisplayView = { view: 'line' };
    }


    CloseModal()
    {
        this.Uploader.Clear();
    }

    PushInput(input: string)
    {
        this.HECRASInputs.push(input);
    }

    mouseup(e: MouseEvent)
    {
        if(e.button == 2)
        {
            var scaleVector3 = new THREE.Vector3(ideApp.crossScaleX, ideApp.crossScaleY, ideApp.crossScaleZ);
            var dir = _.clone<THREE.Vector3>(ideApp.controls.target).sub(_.clone<THREE.Vector3>(ideApp.camera.position));
            var ray = new THREE.Ray(ideApp.camera.position, dir);
            var point = ray.intersectPlane(ideApp.Plane);

            if(point)
            {
                ideApp.controls.target.set(point.x, point.y, point.z);
                ideApp.camera.lookAt(point);
            }
        }
    }

    Init()
    {
        this.reachCollection.Clear();
        this.ClearScene(this.scene);
        this.ClearScene(this.labelScene);
        this.selectedReach = null;
        this.Reaches = [];
        this.LinesButtonOnClick(this.LinesButton.nativeElement);
        if(this.HECRASInputs.length > 0)
        {
            this.initReachCollection(this.HECRASInputs, () =>
            {
                this.DisplayAllReaches();
                this.SetCamera();  
            });
        }
        this.Animate();
    }

    ngOnInit()
    {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var ratio = h/w;
        this.ratio = ratio;
        this.divCanvas = document.getElementById("canvas");
        var parent = document.getElementById("viewport");
        this.divCanvas.style.width = (parent.clientWidth - 350) + "px";
        this.divCanvas.style.height = (parent.clientWidth - 350)* ratio + "px";
        parent.style.cssFloat="left";
        parent.style.width = this.divCanvas.style.width;
        parent.style.height = this.divCanvas.style.height;
        this.divCanvas.addEventListener( 'mouseup', this.mouseup, false );
        this.CreateRenderer(this.divCanvas);
        this.divCanvas.appendChild(this.renderer.domElement);
        this.reachCollection = new ReachCollection();
        this.CreateScenes();
        this.CreatePlane();
        this.CreateLight();
        this.CreateCamera();
        this.CreateCameraHUD();
        this.CreateControls();
        this.SetLight();
        this.HECRASInputs = [];
    }

    ngAfterViewChecked()
    {

    }

    ToggleButton(element: HTMLElement) : boolean
    {
        var ClassList = element.classList;
        var i = 0;
        while (i < ClassList.length && ClassList[i] != "active")i++;
        $(event.currentTarget).blur();
        if(i>=ClassList.length)
        {
            ClassList.add("active");
            return true;
        }
        else
        {
            ClassList.remove("active");
            return false;
        }
    }

    ToggleButtonGroup(element: HTMLElement, dependencies: Array<ElementRef>)
    {
        var ClassList = element.classList;
        ClassList.add("active");
        for (var i = 0; i < dependencies.length; i++)
            dependencies[i].nativeElement.classList.remove("active");;
        $(element).blur();
    }

    LinesButtonOnClick(element: HTMLElement)
    {
        ideApp.ToggleButtonGroup(element, [ideApp.MeshButton])
        ideApp.DisplayView.view = 'line';
        ideApp.ChangeView();
    }

    MeshButtonOnClick(element: HTMLElement)
    {
        ideApp.ToggleButtonGroup(element, [ideApp.LinesButton])
        ideApp.DisplayView.view = 'mesh';
        ideApp.ChangeView();
    }

    RotateButtonOnClick(element: HTMLElement)
    {
        var pressed: boolean = ideApp.ToggleButton(element);

        if(pressed)
            ideApp.controls.noRotate = false;
        else
            ideApp.controls.noRotate = true;
        ideApp.controls.update();
    }

    ZoomInButtonOnClick(element: HTMLElement)
    {
        ideApp.camera.zoom /=0.9;
        ideApp.camera.updateProjectionMatrix();
        $(element).blur();
    }

    ZoomOutButtonOnClick(element: HTMLElement)
    {
        ideApp.camera.zoom *=0.9;
        ideApp.camera.updateProjectionMatrix();
        $(element).blur();
    }

    LabelButtonOnClick(element: HTMLElement)
    {
        var pressed: boolean = ideApp.ToggleButton(element);
        ideApp.showLabels = pressed;
    }

    MoveButtonOnClick(element: HTMLElement)
    {
        var pressed: boolean = ideApp.ToggleButton(element);

        if(pressed)
            ideApp.controls.noPan = false;
        else
            this.controls.noPan = true;
        ideApp.controls.update();
    }

    ZoomAll()
    {
        var radius = null, center = null; 

        if(this.DisplayView.view == 'line')
        {
            this.scene.traverse((object: THREE.Object3D)=>
            {
                if(object instanceof THREE.LineSegments)
                {
                    radius = (object.geometry as THREE.BufferGeometry).boundingSphere.radius;
                    center = (object.geometry as THREE.BufferGeometry).center();
                }
            });
        }
        else
        {
            var geo = new THREE.Geometry();
            this.scene.traverse((object: THREE.Object3D)=>
            {
                if(object instanceof THREE.Mesh)
                {
                    var geometry = <THREE.Geometry> object.geometry;
                    
                    if(object.geometry instanceof THREE.Geometry)
                        geo.mergeMesh(new THREE.Mesh(geometry));
                }
            });  
            
            geo.computeBoundingSphere();
            center = geo.center();
            console.log(center);
            radius = geo.boundingSphere.radius;
        }

        var width = radius;
        var height = width * this.ratio; 
        this.camera.left = -width;
        this.camera.right = width;
        this.camera.top = height;
        this.camera.bottom = -height;
        
        var spheregeo = new THREE.SphereGeometry(radius);
        
        spheregeo.applyMatrix(new THREE.Matrix4().makeTranslation(-center.x, 0, -center.z));
        var spheregeoMesh = new THREE.Mesh(spheregeo, new THREE.MeshBasicMaterial({color:0x000000, wireframe: true}))  
        
        this.camera.lookAt(new THREE.Vector3(center.x, center.y, center.z));
        this.controls.target.set(center.x, center.y, center.z);
        this.controls.target0.set(center.x, center.y, center.z);
        this.camera.zoom = 1;
        this.scene.add(spheregeoMesh);
        this.camera.updateProjectionMatrix();
    }

    ChangeView()
    {
        if(ideApp.selectedReach)
        {
            ideApp.DisplayReach(ideApp.selectedReach);
        }
        else
        {
            ideApp.DisplayAllReaches();
        }
    }

    DisplayReach(reach: Reach)
    {
        this.ClearScene(this.scene);
        this.ClearScene(this.labelScene);
        this.SetLight();
        this.selectedReach = reach.Copy();

        var scaleVector3 = new THREE.Vector3(this.crossScaleX, this.crossScaleY, this.crossScaleZ);
        this.selectedReach.ResetToOrigin();

        if(this.DisplayView.view == 'mesh')
            this.selectedReach.AddToSceneLikeMesh(this.scene, this.labelScene, this.camera, this.cameraHUD, scaleVector3);
        else
            this.selectedReach.AddToSceneLikeLines(this.scene, this.labelScene, this.camera, this.cameraHUD, scaleVector3);
        
        this.selectedReach.CreateLabelAsSprite(this.labelScene,this.camera, scaleVector3, this.ratio);
    
    }

    ResetCameraAndControls()
    {
        var lookAtVector = new THREE.Vector3(0,0, -1);
        lookAtVector.applyQuaternion(this.camera.quaternion);
        this.controls.target0.set(lookAtVector.x, lookAtVector.y, lookAtVector.z);
        this.controls.up0.set(0, 1, 0);
        this.controls.reset();
        //7482696.417294 4946990.459081
        this.SetCamera();
    }

    DisplayAllReaches()
    {
        this.ClearScene(this.scene);
        this.ClearScene(this.labelScene);
        this.selectedReach = null;
        var scaleVector3 = new THREE.Vector3(this.crossScaleX, this.crossScaleY, this.crossScaleZ);

        if(this.DisplayView.view == 'mesh')
            this.reachCollection.AddReachesLikeMeshToScene(this.scene, this.labelScene, this.camera,  this.cameraHUD, this.divCanvas, scaleVector3);
        else
            this.reachCollection.AddReachesLikeLinesToScene(this.scene, this.labelScene, this.camera, this.cameraHUD, this.divCanvas, scaleVector3);    
        
        for (var i = 0; i < this.reachCollection.Reaches.length; i++)
        {
            var reach: Reach = this.reachCollection.Reaches[i];
            reach.AddLabelToScene(this.labelScene);
        }
        
        this.SetLight();
    }

    ClearScene(scene: THREE.Scene)
    {
        if(!scene.children)
            return;
        for( var i = scene.children.length - 1; i >= 0; i--)
        { 
            scene.remove(scene.children[i]);
        }
    }

    CreateRenderer(divCanvas)
    {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, clearColor: 0xffffff, antialias: true });
        this.gl = this.renderer.context;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.renderer.autoClear = false;
        this.renderer.state.setStencilTest(true);
        this.renderer.sortObjects = true;
        this.renderer.state.setDepthTest(true);
        this.renderer.setSize(divCanvas.clientWidth, divCanvas.clientHeight);
    }

    CreateControls()
    {
        this.controls = new THREE.OrthographicTrackballControls(this.camera, this.divCanvas);
        this.controls.addEventListener('change', this.Render);
        this.controls.noRotate = true;
        this.controls.noZoom = true;
        this.controls.noPan = true;
        this.controls.noRoll = true;
    }
    
    CreateScenes()
    {
        this.scene = new THREE.Scene();
        this.labelScene = new THREE.Scene();
    }

    CreateCamera()
    {         
        this.camera = new THREE.OrthographicCamera( this.divCanvas.clientWidth / - 2, 
                                                    this.divCanvas.clientWidth / 2, 
                                                    this.divCanvas.clientHeight / 2, 
                                                    this.divCanvas.clientHeight / - 2, 
                                                    -1000000000, 1000000000);
    }

    SetCamera()
    {
        this.camera.position.x = -20;
        this.camera.position.y = 40;
        this.camera.position.z = -20;
        // this.camera.position.x = this.reachCollection.Reaches[0].Crosses[this.reachCollection.Reaches[0].Crosses.length - 1].LeftCoast.x;
        // this.camera.position.y = 0;
        // this.camera.position.z = this.reachCollection.Reaches[0].Crosses[this.reachCollection.Reaches[0].Crosses.length - 1].LeftCoast.z;
    }
    
    CreateCameraHUD()
    {
        this.cameraHUD = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    }

    initReachCollection(inputs: Array<String>, callback: Function)
    {
        this.reachCollection.Load(inputs, 1, this.ratio, () => 
        {
            var scaleVector3 = new THREE.Vector3(ideApp.crossScaleX, ideApp.crossScaleY, ideApp.crossScaleZ);
            this.reachCollection.Organize();
            for(var i = 0; i < this.reachCollection.Reaches.length; i++)
            {
                this.reachCollection.Reaches[i].CreateLabelAsSprite(this.labelScene, this.camera, scaleVector3, this.ratio);
            }
            callback();
        });
    }

    CreateLight()
    {
        this.PointLight = new THREE.PointLight( 0xffffff, 1, 0 );
        this.PointLight.position.set(100000000, 1000000000, 1000000000);
        this.AmbientLight = new THREE.AmbientLight(0x000000);
    }

    CreatePlane()
    {
        this.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    }

    SetLight()
    {
        if(this.AmbientLight)
            this.scene.add(this.AmbientLight);
        if(this.PointLight)
            this.scene.add(this.PointLight);
    }

    Animate()
    {
        var scaleVector3 = new THREE.Vector3(ideApp.crossScaleX, ideApp.crossScaleY, ideApp.crossScaleZ);
        var camOpts = ideApp.camera.toJSON().object;

        if(ideApp.selectedReach)
        {
            ideApp.selectedReach.RefreshLabelPosition(ideApp.camera, ideApp.ratio, scaleVector3); 
        }
        else if(ideApp.prevCtrls == null || 
                camOpts.zoom.toFixed(7) != ideApp.prevCam.toJSON().object.zoom.toFixed(7) || 
                ideApp.prevCtrls.target.x.toFixed(7) != ideApp.controls.target.x.toFixed(7) ||
                ideApp.prevCtrls.target.y.toFixed(7) != ideApp.controls.target.y.toFixed(7) ||
                ideApp.prevCtrls.target.z.toFixed(7) != ideApp.controls.target.z.toFixed(7) ||
                ideApp.prevCam.position.x.toFixed(7) != ideApp.camera.position.x.toFixed(7) ||
                ideApp.prevCam.position.y.toFixed(7) != ideApp.camera.position.y.toFixed(7) ||
                ideApp.prevCam.position.z.toFixed(7) != ideApp.camera.position.z.toFixed(7)
        )
        {
            ideApp.prevCam = _.cloneDeep<THREE.OrthographicCamera>(ideApp.camera);
            ideApp.prevCtrls = _.cloneDeep<THREE.OrthographicTrackballControls>(ideApp.controls);
            for (var i = 0; i < ideApp.reachCollection.Reaches.length; i++)
            {
                var reach = ideApp.reachCollection.Reaches[i];
                reach.RefreshLabelPosition(ideApp.camera, ideApp.ratio, scaleVector3);           
            }
        }
        
        ideApp.controls.update();
        requestAnimationFrame(ideApp.Animate);
        ideApp.Render();
    }

    Render()
    {
        ideApp.renderer.clear();
        ideApp.renderer.render(ideApp.scene, ideApp.camera);
        ideApp.renderer.clearDepth();
        if(ideApp.showLabels)
            ideApp.renderer.render(ideApp.labelScene, ideApp.cameraHUD);
    }

}

var ideApp: IdeComponent;