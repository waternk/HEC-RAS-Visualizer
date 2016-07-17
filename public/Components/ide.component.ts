import { Component, OnInit, Injectable } from '@angular/core';
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

    `],
    directives: [UploaderComponent]
})

export class IdeComponent implements OnInit
{
    IdeApp: IdeComponent;
    HECRASInputs: Array<String>;
    DisplayView: any;
    ratio: number;
    selectedReach: Reach;
    crossScaleX: number = 1;
    crossScaleY: number = 1;
    crossScaleZ: number = 1;
    Reaches: Array<Reach>;
    showLabels: HTMLElement;
    divCanvas: HTMLElement;
    fileManager: FileManager;
    camera: THREE.OrthographicCamera;
    cameraHUD: THREE.Camera;
    scene: THREE.Scene;
    labelScene: THREE.Scene;
    object3D: THREE.AxisHelper;
    plane: THREE.Plane;
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
        this.DisplayView = { view: 'mesh' };
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
            var point = ray.intersectPlane(ideApp.plane);

            if(point)
            {
                ideApp.controls.target.set(point.x, point.y, point.z);
            }
        }
    }

    Init()
    {
        for (var i = 0; i < this.HECRASInputs.length; i++) 
        {
            var input = this.HECRASInputs[i];
            this.setCamera();
            this.setCameraHUD();
            this.setControls();
            this.createScenes();
            this.reachCollection = new ReachCollection();
            if(input && input != "")
            {
                this.initReachCollection(input, () =>
                {
                    this.DisplayAllReaches();
                    this.animate();  
                });
            }
            this.render();   
        }
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
        this.createRenderer(this.divCanvas);
        this.divCanvas.appendChild(this.renderer.domElement);
        this.reachCollection = new ReachCollection();
        this.HECRASInputs = [];
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
        this.selectedReach = reach.Copy();

        var scaleVector3 = new THREE.Vector3(this.crossScaleX, this.crossScaleY, this.crossScaleZ);
        this.selectedReach.ResetToOrigin();

        if(this.DisplayView.view == 'mesh')
            this.selectedReach.AddToSceneLikeMesh(this.scene, this.labelScene, this.camera, this.cameraHUD, scaleVector3);
        else
            this.selectedReach.AddToSceneLikeLines(this.scene, this.labelScene, this.camera, this.cameraHUD, scaleVector3);
        
        this.selectedReach.CreateLabelAsSprite(this.labelScene,this.camera, scaleVector3, this.ratio);
        this.setLight();
        this.render();
    }

    ResetCameraAndControls()
    {
        var lookAtVector = new THREE.Vector3(0,0, -1);
        lookAtVector.applyQuaternion(this.camera.quaternion);
        this.controls.target0.set(lookAtVector.x, lookAtVector.y, lookAtVector.z);
        this.controls.up0.set( 0, 1, 0 );
        this.controls.reset();
        //7482696.417294 4946990.459081
        this.camera.position.x = -20;
        this.camera.position.y = 40;
        this.camera.position.z = -20;
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
        
        this.setLight();
        this.render();
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

    createRenderer(divCanvas)
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

    setControls()
    {
        this.controls = new THREE.OrthographicTrackballControls(this.camera, this.divCanvas);
        this.controls.addEventListener('change', this.render);
    }
    
    createScenes()
    {
        this.scene = new THREE.Scene();
        this.labelScene = new THREE.Scene();
    }

    setCamera()
    {         
        this.camera = new THREE.OrthographicCamera( this.divCanvas.clientWidth / - 2, 
                                                    this.divCanvas.clientWidth / 2, 
                                                    this.divCanvas.clientHeight / 2, 
                                                    this.divCanvas.clientHeight / - 2, 
                                                    -100000, 100000);
        this.camera.position.x = -20;
        this.camera.position.y = 40;
        this.camera.position.z = -20;
    }
    
    setCameraHUD()
    {
        this.cameraHUD = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    }

    initReachCollectionFile(file, callback)
    {
        this.reachCollection = new ReachCollection();
        this.reachCollection.LoadCrossesFromFile(file, 1, this.ratio, () => 
        {
            var scaleVector3 = new THREE.Vector3(ideApp.crossScaleX, ideApp.crossScaleY, ideApp.crossScaleZ);
            //this.reachCollection.SortCrossesByPositionSelectionSort();
            this.reachCollection.Normalize();
            
            for(var i = 0; i < this.reachCollection.Reaches.length; i++)
            {
                this.reachCollection.Reaches[i].CreateLabelAsSprite(this.labelScene, this.camera, scaleVector3, this.ratio);
            }
            
            callback();
        });
    }

    initReachCollection(input: String, callback: Function)
    {
        this.reachCollection.LoadCrosses(input, 1, this.ratio, () => 
        {
            var scaleVector3 = new THREE.Vector3(ideApp.crossScaleX, ideApp.crossScaleY, ideApp.crossScaleZ);
            this.reachCollection.Normalize();
            for(var i = 0; i < this.reachCollection.Reaches.length; i++)
            {
                this.reachCollection.Reaches[i].CreateLabelAsSprite(this.labelScene, this.camera, scaleVector3, this.ratio);
            }
            callback();
        });
    }

    setLight()
    {
        this.scene.add(new THREE.AmbientLight(0x000000));
        var light = new THREE.PointLight( 0xffffff, 1, 0 );
        light.position.set(100000000, 1000000000, 1000000000);
        this.scene.add(light);
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
    }

    animate()
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
        requestAnimationFrame(ideApp.animate);
        ideApp.render();
    }

    render()
    {
        ideApp.renderer.clear();
        ideApp.renderer.render(ideApp.scene, ideApp.camera);
        ideApp.renderer.clearDepth();
        if(ideApp.showLabels)
            ideApp.renderer.render(ideApp.labelScene, ideApp.cameraHUD);
    }

}

var ideApp: IdeComponent;