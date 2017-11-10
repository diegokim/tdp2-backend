import { Denounce } from './../denounces/denounces.component';
import { DenouncesService } from './../../services/denounces.service';
import { MatSort } from '@angular/material';
import { DenouncesDatabase, DenouncesDataSource } from './../denouncestable/denouncestable.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {ActivatedRoute} from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [DenouncesService]
})
export class ProfileComponent implements OnInit {
  profile: Profile
  displayedColumns = ['sendUName', 'recUName', 'type', 'message', 'status', 'accept', 'reject'];
  database = new DenouncesDatabase([]);
  dataSource: DenouncesDataSource | null;
  
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(private route: ActivatedRoute,
              private http: HttpClient,
              private _sanitizer: DomSanitizer,
              private denouncesService: DenouncesService,
              private router: Router) {

    
  }
  


  updateDenounces() {
    this.denouncesService.getDenounces()
    .then( (denounces:Denounce[]) => {
      denounces.filter( (denounce:Denounce) => {
        return denounce.recUID == this.profile.id || denounce.sendUID == this.profile.id
      })
      this.database.updateDenounces(denounces);
    })
    .catch(console.log)
  }
  

  showProfile(profileID) {
    this.router.navigate(['/profile', profileID])
    }
  
    rejectDenounce(denounce) {
      this.denouncesService.updateDenounce(denounce,'rechazada')
      .then( (res) => {
        this.updateDenounces();
      })
      .catch(console.log)
      this.updateDenounces();
    }
    acceptDenounce(denounce) {
      this.denouncesService.updateDenounce(denounce,'aceptada')
      .then( (res) => {
        this.updateDenounces();
      })
      .catch(console.log)
      this.updateDenounces();
    }

  get getPhotos() {
    return this.profile.photos
  }

  getPhoto(index) {
    return this._sanitizer.bypassSecurityTrustUrl( `data:image/jpeg;base64,${this.profile.photos[index]}`);
  } 

  get getProfilePhoto() {
    return this._sanitizer.bypassSecurityTrustUrl( `data:image/jpeg;base64,${this.profile.photo}`);
  }

  ngOnInit() {
    this.dataSource = new DenouncesDataSource(this.database, this.sort);

    let id = this.route.snapshot.params['id']
    let url = 'http://localhost:5000/users/' + id + '/profile';
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'aplication/json','Authorization': token})
    this.http.get(url,{headers}).toPromise()
    .then((profile: Profile) => {
      this.profile = profile
      this.updateDenounces()
    } )
    .catch((err) => console.log(err))
  }
}

class Profile {
  photo: string
  photos: Array<string>
  description: string
  work: string
  id: string
  name: string
  gender: string
  age: number
  interests: Array<string>
  education: string
}