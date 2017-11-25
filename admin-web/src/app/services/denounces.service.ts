import { Denounce } from './../components/denounces/denounces.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class DenouncesService {

  denouncesUrl: string = "http://localhost:5000/users/denounces"

  constructor(private http: HttpClient,
    private router: Router) { }

  getDenounces() {
    let url = this.denouncesUrl
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'application/json','Authorization': token})
    return this.http.get(url,{headers}).toPromise()
  }


  updateDenounce(denounce,newStatus) {
    let body = {
      sendUID: denounce.sendUID,
      recUID: denounce.recUID,
      status: newStatus
    }
    let url = this.denouncesUrl
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Authorization': token})
    return this.http.put(url,body,{headers}).toPromise()
  }

}










