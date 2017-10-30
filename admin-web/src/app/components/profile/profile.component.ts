import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ActivatedRoute} from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: Profile
  constructor(private route: ActivatedRoute,
              private http: HttpClient,
              private _sanitizer: DomSanitizer) {

    let id = route.snapshot.params['id']
    let url = 'http://localhost:5000/users/' + id + '/profile';
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'aplication/json','Authorization': token})
    this.http.get(url,{headers}).toPromise()
    .then((profile: Profile) => this.profile = profile)
    .catch((err) => console.log(err))
   
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