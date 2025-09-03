import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BeagleBoard } from '../models/beagleBoard';

@Injectable({
  providedIn: 'root'
})
export class BeagleBoardService {

  private apiUrl = 'https://stralax-dfp-streznik.onrender.com/api/beagleBoard';

  constructor(private http: HttpClient) { }

  getAllBeagleBoards(): Observable<BeagleBoard[]> {
    return this.http.get<BeagleBoard[]>(this.apiUrl);
  }

  setJob(KEY: string, JOB: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/set-the-job`, { KEY, JOB });
  }

  setName(KEY: string, NAME: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/set-the-name`, { KEY, NAME });
  }

}