export class FileManager 
{    
    constructor()
    {
        
    }
    
    FileOpen(url: string, obj, callback?: Function) : void
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET",url,true);
        xmlhttp.send();
        
        xmlhttp.onload = function(event){
            callback(xmlhttp.responseText, obj);
        }
        
    }
    
    
}