import { Request, Response } from  "express";
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from "os";

export function uploadGeometry(req: any, res: Response)
{
    console.log(os);
    if(os.platform() == "win32")
    {
        child_process.exec("cd HEC-RAS-Geometry-file-parser && hec uploads/" + req.file.originalname , (error, stdout, stderr) => 
        {
            if (error !== null)
            {
                console.log(error);
                res.statusMessage = error.message;
                res.status(500).end();
            }
            else
            {
                res.sendFile(path.join(__dirname, '../HEC-RAS-Geometry-file-parser/finalno.txt'));
            }  
        });
    }
    else
    {
        child_process.exec("cd HEC-RAS-Geometry-file-parser && ./hec uploads/" + req.file.originalname , (error, stdout, stderr) => 
        {
            if (error !== null)
            {
                console.log(error);
                res.statusMessage = error.message;
                res.status(500).end();
            }
            else
            {
                res.sendFile(path.join(__dirname, '../HEC-RAS-Geometry-file-parser/finalno.txt'));
            }  
        });
    }
    
}