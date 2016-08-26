import { Component, OnInit, Injectable, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { UploaderComponent } from './uploader.component';
import { FontPickerComponent } from './font-picker.component';
import { Reach } from '../Classes/Reach';
import { Cross } from '../Classes/Cross';
import { ReachCollection } from '../Classes/ReachCollection';
import { Axes } from '../Classes/Axes';
import * as _ from 'lodash';
import * as $ from 'jquery';

@Component({
    selector: 'ide-app',
    templateUrl: '/Components/ide.component.html',
    styles:[
    `
    a {
        color: #00B7FF;
    }

    #canvas{
        border:1px solid #eee;
        width:100%;
        position: relative; top: -30px;
        z-index: 0;
        background-color: white;
        margin: 0;
    }
    #labels {  
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
        cursor: default;
    }
    #rightpanel{ 
        /*float:right;
        position: relative;
        top: -6px;*/
        background-color: white;
    }
    #controls{
        position:relative;
        left:5px;
        z-index: 1;
    }
    .controlButton {
        width: 24px;
        height: 24px;
    }
    #viewport{
        width:99%;
        margin: 0;
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
    directives: [UploaderComponent, FontPickerComponent]
})

export class IdeComponent implements OnInit, AfterViewChecked, AfterViewInit
{
    @ViewChild(UploaderComponent) Uploader: UploaderComponent;
    @ViewChild(FontPickerComponent) FontPicker: FontPickerComponent;
    @ViewChild('ZoomAllButton') ZoomAllButton: ElementRef;
    @ViewChild('ZoomInButton') ZoomInButton: ElementRef;
    @ViewChild('ZoomOutButton') ZoomOutButton: ElementRef;
    @ViewChild('RotateButton') RotateButton: ElementRef;
    @ViewChild('MoveButton') MoveButton: ElementRef;
    @ViewChild('LabelButton') LabelButton: ElementRef;
    @ViewChild('MeshButton') MeshButton: ElementRef;
    @ViewChild('LinesButton') LinesButton: ElementRef;
    @ViewChild('AxesHelperButton') AxesHelperButton: ElementRef;
    @ViewChild("LabelsContainer") LabelsContainer: ElementRef;
    
    HelvetikerRegularFont: THREE.Font;
    IdeApp: IdeComponent;
    HECRASInputs: Array<String>;
    DisplayView: any;
    aspect: number;
    BoundingSphereRadius: number;
    BoundingSphereCenter: THREE.Vector3;
    selectedReach: Reach;
    crossScaleX: number = 1;
    crossScaleY: number = 1;
    crossScaleZ: number = 1;
    Reaches: Array<Reach>;
    divCanvas: HTMLElement;
    camera: THREE.OrthographicCamera;
    AxesCamera: THREE.OrthographicCamera;
    cameraHUD: THREE.Camera;
    scene: THREE.Scene;
    labelScene: THREE.Scene;
    hudScene: THREE.Scene;
    AxesHUD: Axes;
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

    Load()
    {
        this.reachCollection = new ReachCollection();
        this.ClearScene(this.scene);
        this.ClearScene(this.labelScene);
        this.selectedReach = null;
        this.Reaches = [];
        
        while (this.LabelsContainer.nativeElement.firstChild) {
            this.LabelsContainer.nativeElement.removeChild(this.LabelsContainer.nativeElement.firstChild);
        }
        
        if(this.HECRASInputs.length > 0)
        {
            this.initReachCollection(this.HECRASInputs, () =>
            {
                this.HECRASInputs = [];
                this.CalculateBoundingSphere();
                this.DisplayAllReaches();
                this.SetCamera();  
            });
        }
        this.Animate();
        
    }

    loadFont(url: string, callback: Function)
    {
        var loader = new THREE.FontLoader();
        loader.load(url, (font) => 
        {
            callback(font);
        });
    }

    ngOnInit()
    {
        this.loadFont('/three.js-master/examples/fonts/helvetiker_regular.typeface.json', (font: THREE.Font) => 
        {
            this.HelvetikerRegularFont = font;
            var w = window.innerWidth;
            var h = window.innerHeight - 60;
            this.aspect = w / h;
            this.divCanvas = document.getElementById("canvas");
            var parent = document.getElementById("viewport");
            this.divCanvas.style.width = w + "px";
            this.divCanvas.style.height = w / this.aspect + "px";
            this.SetEventListeners();
            this.CreateRenderer(this.divCanvas);
            this.divCanvas.appendChild(this.renderer.domElement);
            this.CreateScenes();
            this.CreatePlane();
            this.CreateLight();
            this.CreateCamera();
            this.CreateAxesCamera();
            this.CreateCameraHUD();
            this.CreateHUD(this.hudScene);
            this.SetLight();
            this.HECRASInputs = [];
            this.SetDefualtControls();
        });
    }

    ngAfterViewChecked()
    {
        
    }

    ngAfterViewInit()
    {
        
    }

    CreateHUD(scene: THREE.Scene)
    {
        this.AxesHUD = new Axes(0.1, this.HelvetikerRegularFont);
        this.AxesHUD.axes.applyMatrix(new THREE.Matrix4().makeTranslation(-0.8, -0.8, 0));
        scene.add(this.AxesHUD);
    }

    SetDefualtControls()
    {
        this.CreateControls(true, false, true, false);
        this.LinesButtonOnClick(this.LinesButton.nativeElement);
        this.MoveButtonOnClick(this.MoveButton.nativeElement);
        // this.RotateButtonOnClick(this.RotateButton.nativeElement);
    }

    ToggleButton(element: HTMLElement) : boolean
    {
        var ClassList = element.classList;
        var i = 0;
        while (i < ClassList.length && ClassList[i] != "active")i++;
        
        if(i>=ClassList.length)
        {
            ClassList.add("active");
            $(element).blur();
            return true;
        }
        else
        {
            ClassList.remove("active");
            $(element).blur();
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

    AxesHelperButtonOnClick(element: HTMLElement)
    {
         this.AxesHelperButton.nativeElement.pressed = this.ToggleButton(this.AxesHelperButton.nativeElement);
    }

    LinesButtonOnClick(element: HTMLElement)
    {
        ideApp.ToggleButtonGroup(element, [ideApp.MeshButton]);
        ideApp.DisplayView.view = 'line';
        ideApp.ChangeView();
    }

    MeshButtonOnClick(element: HTMLElement)
    {
        ideApp.ToggleButtonGroup(element, [ideApp.LinesButton]);
        ideApp.DisplayView.view = 'mesh';
        ideApp.ChangeView();
    }

    MoveButtonOnClick(element: HTMLElement)
    {
        ideApp.ToggleButtonGroup(element, [ideApp.RotateButton]);
        ideApp.controls.noPan = false;
        ideApp.controls.noRotate = true;
        ideApp.controls.update();        
    }

    RotateButtonOnClick(element: HTMLElement)
    {
        ideApp.ToggleButtonGroup(element, [ideApp.MoveButton]);
        ideApp.controls.noPan = true;
        ideApp.controls.noRotate = false;
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
        ideApp.LabelButton.nativeElement.pressed = ideApp.ToggleButton(element);
        this.RefreshLabelsContainer();
        this.RefreshLabelsPosition();
    }

    RefreshLabelsPosition()
    {
        for(var i = 0; i < this.reachCollection.Reaches.length; i++)
        {
            var reach = this.reachCollection.Reaches[i];
            reach.RefreshHTMLLabelPosition(ideApp.camera, new THREE.Vector3(ideApp.crossScaleX, ideApp.crossScaleY, ideApp.crossScaleZ), ideApp.divCanvas);
        }
    }

    RefreshLabelsContainer()
    {
        if(ideApp.LabelButton.nativeElement.pressed)
            ideApp.LabelsContainer.nativeElement.style.display = "block";
        else
            ideApp.LabelsContainer.nativeElement.style.display = "none";
    }

    CalculateBoundingSphere()
    {
        var vertices = new Array<THREE.Vector3>();
        for (var r = 0; r < this.reachCollection.Reaches.length; r++) 
        {
            var reach = this.reachCollection.Reaches[r];
            for (var c = 0; c < reach.Crosses.length; c++)
            {
                var cross = reach.Crosses[c];
                for (var v = 0; v < cross.vertices.length; v++)
                {
                    vertices.push(cross.vertices[v]);  
                }   
            }
        }
        var tmpG = new THREE.Geometry();
        tmpG.vertices = vertices;
        tmpG.computeBoundingSphere(); 
        this.BoundingSphereRadius = tmpG.boundingSphere.radius;
        this.BoundingSphereCenter = this.GetCenter(vertices);
    }

    GetCenter(vertices: Array<THREE.Vector3>) : THREE.Vector3
    {
        var min = Number.MAX_VALUE, max = 0;
        var vecMin:THREE.Vector3, vecMax: THREE.Vector3;

        for (var i = 0; i < vertices.length; i++)
        {
            var vertex = vertices[i];
            var len = vertex.length();
            if(len < min)
            {
                min = len;
                vecMin = _.cloneDeep<THREE.Vector3>(vertex);
            }
            else if(len > max)
            {
                max = len;
                vecMax = _.cloneDeep<THREE.Vector3>(vertex);;
            }
        }
        var sub = _.cloneDeep<THREE.Vector3>(vecMax);
        sub.sub(vecMin);
        sub.multiplyScalar(0.5);
        return vecMax.sub(sub);
    }

    ZoomAllButtonOnClick(element: HTMLElement)
    {
        var _viewport = {
            viewSize: this.BoundingSphereRadius,
            aspect: this.aspect,
            left: -this.aspect * this.BoundingSphereRadius,
            right: this.aspect * this.BoundingSphereRadius,
            top: this.BoundingSphereRadius,
            bottom: -this.BoundingSphereRadius,
        }
        
        this.camera.left = _viewport.left;
        this.camera.right = _viewport.right;
        this.camera.top = _viewport.top;
        this.camera.bottom = _viewport.bottom;

        this.controls.target = _.cloneDeep<THREE.Vector3>(this.BoundingSphereCenter);
        
        this.camera.zoom = 1;
        this.camera.position.set(this.BoundingSphereCenter.x , this.BoundingSphereCenter.y + this.BoundingSphereRadius, this.BoundingSphereCenter.z);
        this.camera.up.set(0, 0, 1);
        
        this.camera.updateProjectionMatrix();
        this.RefreshLabelsPosition();

        // var sg = new THREE.SphereGeometry(this.BoundingSphereRadius);
        // sg.applyMatrix(new THREE.Matrix4().makeTranslation(this.BoundingSphereCenter.x, this.BoundingSphereCenter.y, this.BoundingSphereCenter.z))
        // var mesh = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true}));
        // this.scene.add(mesh);
        
    }
    
    SetEventListeners()
    {
        this.divCanvas.addEventListener( 'mouseup', this.mouseup, false );
        //window.addEventListener( 'resize', this.OnWindowResize, false );
    }
    
    OnWindowResize()
    {
        
    }

    ChangeView()
    {
        ideApp.DisplayAllReaches();
    }

    UpdateList(newValue:boolean, model: Reach)
    {
        model.Visible = newValue;
        document.getElementById(model.labelID).style.visibility = model.Visible ? 'visible' : 'hidden';
        this.DisplayAllReaches();
    }

    DisplayAllReaches()
    {
        if(!this.reachCollection) return;
        this.ClearScene(this.scene);
        this.ClearScene(this.labelScene);
        
        this.selectedReach = null;
        var scaleVector3 = new THREE.Vector3(this.crossScaleX, this.crossScaleY, this.crossScaleZ);

        if(this.DisplayView.view == 'mesh')
            this.reachCollection.AddReachesLikeMeshToScene(this.scene, this.camera,  this.cameraHUD, this.divCanvas, scaleVector3);
        else
            this.reachCollection.AddReachesLikeLinesToScene(this.scene, this.camera, this.cameraHUD, this.divCanvas, scaleVector3);    
        
        for (var i = 0; i < this.reachCollection.Reaches.length; i++)
        {
            var reach: Reach = this.reachCollection.Reaches[i];
            if(reach.Visible)
                reach.AddLabelToScene(this.labelScene);
        }
        //this.reachCollection.AddLabelsToScene(this.labelScene); //bug
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

    CreateTrackBallControls(rotate?: boolean, zoom?: boolean, pan?: boolean, roll?: boolean)
    {
        
        this.controls = new THREE.OrthographicTrackballControls(this.camera, this.divCanvas);
        this.controls.addEventListener('change', this.Render);
        this.controls.noRotate = (rotate == false || undefined ) ? true : false;
        this.controls.noZoom = (zoom == false || undefined ) ? true : false;
        this.controls.noPan = (pan == false || undefined )? true : false;
        this.controls.noRoll = (roll == false || undefined ) ? true : false;
    }

    CreateControls(rotate?: boolean, zoom?: boolean, pan?: boolean, roll?: boolean, axesHelper?: boolean)
    {
        this.AxesHelperButtonOnClick(this.AxesHelperButton.nativeElement);
        this.CreateTrackBallControls(false, false, true, false);
    }
    
    CreateScenes()
    {
        this.scene = new THREE.Scene();
        this.labelScene = new THREE.Scene();
        this.hudScene = new THREE.Scene();
    }

    CreateCamera()
    {         
        this.camera = new THREE.OrthographicCamera( -this.divCanvas.clientWidth, 
                                                    this.divCanvas.clientWidth, 
                                                    this.divCanvas.clientWidth * this.aspect, 
                                                    this.divCanvas.clientWidth * this.aspect, 
                                                    -1000000000, 1000000000);
    }
    
    CreateAxesCamera()
    {
        this.AxesCamera = new THREE.OrthographicCamera(-this.aspect, this.aspect, 1, -1, -1, 1);
    }

    SetCamera()
    {
        this.ZoomAllButtonOnClick(this.ZoomAllButton.nativeElement);
    }
    
    CreateCameraHUD()
    {
        this.cameraHUD = new THREE.OrthographicCamera(-this.aspect, this.aspect, 1, -1, -1, 1);
    }

    initReachCollection(inputs: Array<String>, callback: Function)
    {
        this.reachCollection.Load(inputs, 1, this.aspect, () => 
        {
            var scaleVector3 = new THREE.Vector3(ideApp.crossScaleX, ideApp.crossScaleY, ideApp.crossScaleZ);
            
            this.reachCollection.Organize();
        
            for(var i = 0; i < this.reachCollection.Reaches.length; i++)
            {
                var reach = this.reachCollection.Reaches[i];
                reach.CreateLabelAsHTML(this.FontPicker);
            }
            this.reachCollection.AddHTMLLabelsToElem(this.LabelsContainer.nativeElement);
            
            this.RefreshLabelsContainer();
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
            ideApp.selectedReach.RefreshLabelPosition(ideApp.camera, scaleVector3); 
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
                reach.RefreshHTMLLabelPosition(ideApp.camera, scaleVector3, ideApp.divCanvas);           
            }
        }
        
        ideApp.controls.update();
        
        requestAnimationFrame(ideApp.Animate);
        ideApp.Render();
    }

    UpdateLabels(font: FontPickerComponent)
    {
        for (var i = 0; i < this.reachCollection.Reaches.length; i++)
        {
            var reach = this.reachCollection.Reaches[i];
            reach.UpdateLabel(font);
        }
    }

    Render()
    {
        ideApp.AxesHUD.Refresh(ideApp.camera);
        ideApp.renderer.clear();
        ideApp.renderer.render(ideApp.scene, ideApp.camera);
        ideApp.renderer.clearDepth();
        if(ideApp.AxesHelperButton.nativeElement.pressed)
        {
            ideApp.renderer.clearDepth();
            ideApp.renderer.render(ideApp.hudScene, ideApp.AxesCamera);
        }
    }
}

var ideApp: IdeComponent;