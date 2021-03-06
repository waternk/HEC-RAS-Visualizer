import { Component, OnInit, Injectable, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES, NgClass, NgStyle } from '@angular/common';
import { FILE_UPLOAD_DIRECTIVES, FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { IdeComponent } from './ide.component'; 
import * as _ from 'lodash';
import * as $ from 'jquery';

@Component({
    selector: 'uploader',
    templateUrl: '/Components/uploader.component.html',
    styles:[
    `
    a {
        color: #00B7FF;
    }

    #canvas{
        border:1px solid gray;
    }
    #viewport{

    }
    .my-drop-zone { border: dotted 3px lightgray; }
    .nv-file-over { border: dotted 3px red; } /* Default class applied to drop zones on over */
    .another-file-over-class { border: dotted 3px green; }

    html, body { height: 100%; }

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

    `],
    directives: [FILE_UPLOAD_DIRECTIVES, NgClass, NgStyle, CORE_DIRECTIVES, FORM_DIRECTIVES]
})

export class UploaderComponent implements OnInit
{
    @Input() IdeApp: IdeComponent;
    @ViewChild('InputFile') InputFile: ElementRef;

    public uploader:FileUploader = new FileUploader({url: 'http://localhost:3000/geometry', filters: [{name: 'fileType', fn: this.CheckFile }] });
        
    constructor()
    {
        uploaderComponent = this;
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => 
        {
            this.IdeApp.PushInput(response);
        }

        this.uploader.onCompleteAll = () => 
        {
            var opts : UIkit.NotifyOptions = {};
            opts.message = "<i class='uk-icon-upload'></i> Upload successfully finished.";
            opts.pos = "top-center";
            opts.status = "success";
            opts.timeout = 5000;
            UIkit.notify(opts);
        }
        
    }

    Upload(file: any)
    {
        file.upload();
    }
    
    Remove(file: any)
    {
        file.remove();
    }
    
    Cancel(file: any)
    {
        file.cancel();
    }
    
    UploadAll()
    {
        uploaderComponent.uploader.uploadAll();
    }

    CancelAll()
    {
        uploaderComponent.uploader.cancelAll();
    }

    RemoveAll()
    {
        uploaderComponent.uploader.clearQueue();
    }

    ngOnInit()
    {
     
    }

    CheckFile(file: any) : boolean
    {
        console.log(file);
        var regex = /[a-zA-Z0-9]+\.g[0-9]*/;
        if(regex.test(file.name))
        {
            console.log(true);
            return true;
        }
        uploaderComponent.InputFile.nativeElement.value = "";
        var opts : UIkit.NotifyOptions = {};
        opts.message = "<i class='uk-icon-warning'></i> Error: File format is inadequate.";
        opts.pos = "top-center";
        opts.status = "danger";
        opts.timeout = 5000;
        UIkit.notify(opts);
        return false;
    }

    Clear()
    {
        this.uploader.clearQueue();
        this.uploader.cancelAll();
        this.InputFile.nativeElement.value = "";
    }
}
var uploaderComponent : UploaderComponent; 