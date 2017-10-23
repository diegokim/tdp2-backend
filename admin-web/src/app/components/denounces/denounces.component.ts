import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-denounces',
  templateUrl: './denounces.component.html',
  styleUrls: ['./denounces.component.css']
})
export class DenouncesComponent implements OnInit {

  denouncesUrl: string = "http://localhost:5000/users/denounces"
  fillEmptySpaces: number[]
  denounces: Denounce[]

  constructor(private http: HttpClient,
              private router: Router) { 
                this.denounces = []
                this.fillEmptySpaces = []
              }

  showProfile(profileID) {
    this.router.navigate(['/profile', profileID])
  }

  actionOnDenounce(denounce,newStatus) {
    let body = {
      sendUID: denounce.sendUID,
      recUID: denounce.recUID,
      status: newStatus
    }
    let url = this.denouncesUrl
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Authorization': token})
    this.http.put(url,body,{headers}).toPromise()
    .then(console.log)
    .catch((err) => console.log(err))
  }

  rejectDenounce(denounce) {
    this.actionOnDenounce(denounce,'rechazada')
    this.updateDenounces()
  }
  acceptDenounce(denounce) {
    this.actionOnDenounce(denounce,'aceptada')
    this.updateDenounces()
  }

  updateDenounces() {
    let url = this.denouncesUrl
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'aplication/json','Authorization': token})
    this.http.get(url,{headers}).toPromise()
    .then((denounces: Denounce[]) => {
      this.denounces = denounces
      this.denounces.sort((a: Denounce, b: Denounce) => {
        if (a.status == 'pendiente' && b.status != 'pendiente') {
          return -1
        } else if (b.status == 'pendiente' && a.status != 'pendiente') {
          return 1
        }
        return 1
      })

      let fillEmptySpaces: number[] = []
      for (let i = denounces.length ; i < 11 ; i++) {
        fillEmptySpaces.push(0)
      }
      this.fillEmptySpaces = fillEmptySpaces
      
    })
    .catch((err) => console.log(err))
  }

  ngOnInit() {
    this.updateDenounces()
  }

}

class Denounce {
  sendUID: string
  recUID: string
  sendUName: string
  recUName: string
  message: string
  status: string
}