import { element } from 'protractor';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {


  minPhotosToLogin: number;
  settingsUrl: string = 'http://localhost:5000/project/configs'
  settings: Settings;

  linksForFreeAccount: number;
  linksForPremiumAccount: number;
  maxCandidatesToShow: number;
  maxPhotosToLogin: number;

  constructor(private http: HttpClient) { }

  getSettings() {
    let url = this.settingsUrl
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'aplication/json','Authorization': token})
    return this.http.get(url,{headers}).toPromise()
  }

  ngOnInit() {
    this.getSettings().then( (settings: Settings) => {
      this.settings = settings
      this.resetForm()
    })
  }

  updateSettings () {
    
    console.log(this.minPhotosToLogin);
  }

  resetForm() {
    this.linksForFreeAccount = this.settings.linksForFreeAccount.value
    this.linksForPremiumAccount = this.settings.linksForPremiumAccount.value
    this.maxCandidatesToShow = this.settings.maxCandidatesToShow.value
    this.maxPhotosToLogin = this.settings.maxPhotosToLogin.value
  }

}


class Settings {
  linksForFreeAccount: Setting;
  linksForPremiumAccount: Setting;
  maxCandidatesToShow: Setting;
  maxPhotosToLogin: Setting;
}

class Setting {
  prettyName: string;
  name: string;
  value: any
}