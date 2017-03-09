import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class FileUploadService {
  constructor (
    private http: Http
  ) { }

  uploadFile(file: any, endpoint: string) : Observable<File> {
    let formData = new FormData();

    formData.append('file', file);

    return this.http.post(endpoint, formData)
      .map((response: Response) => {
        return response.json();
      });
  }
}
