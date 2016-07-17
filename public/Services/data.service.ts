import { Injectable }    from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService 
{
  private url = 'http://localhost:3000/Assets/finalno.txt';
  
  constructor(private http: Http) { }
  
  public getData() : Promise<Response>
  {
    return this.http.get(this.url)
               .toPromise()
               .then(response => response)
               .catch(this.handleError);
  }

  private handleError(error: any) : Promise<void>
  {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
