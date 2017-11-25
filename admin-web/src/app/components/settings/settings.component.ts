import { element } from 'protractor';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  providers: [MatSnackBar]
})
export class SettingsComponent implements OnInit {


  minPhotosToLogin: number;
  settingsUrl: string = 'http://localhost:5000/project/configs'
  settings: Settings;

  linksForFreeAccount: number;
  linksForPremiumAccount: number;
  maxCandidatesToShow: number;
  maxPhotosToLogin: number;

  constructor(private http: HttpClient,
  private snackBar: MatSnackBar) { }

  getSettings() {
    let url = this.settingsUrl
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'application/json','Authorization': token})
    return this.http.get(url,{headers}).toPromise()
  }

  ngOnInit() {
    this.getSettings().then( (settings: Settings) => {
      this.settings = settings
      this.resetForm()
    })
  }

  updateSetting(name, value) {
    let url = this.settingsUrl + '/' + name
    let body = {
      value
    }
    console.log(body)
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Authorization': token})
    this.http.put(url, body, {headers}).toPromise()
    .then(console.log)
    .catch(console.log)
  }

  updateSettings () {
    const emptyFields =
    !this.linksForPremiumAccount ||
    !this.linksForFreeAccount ||
    !this.maxCandidatesToShow ||
    !this.maxPhotosToLogin

    if (emptyFields) {
      return this.snackBar.open('No se pueden dejar campos vacios!', '', {
        duration: 2000,
      });
    }

    if (this.linksForFreeAccount != this.settings.linksForFreeAccount.value) {
      this.updateSetting(this.settings.linksForFreeAccount.name, this.linksForFreeAccount)
    }
    if (this.linksForPremiumAccount != this.settings.linksForPremiumAccount.value) {
      this.updateSetting(this.settings.linksForPremiumAccount.name, this.linksForPremiumAccount)
    }
    if (this.maxCandidatesToShow != this.settings.maxCandidatesToShow.value) {
      this.updateSetting(this.settings.maxCandidatesToShow.name, this.maxCandidatesToShow)
    }
    if (this.maxPhotosToLogin != this.settings.maxPhotosToLogin.value) {
      this.updateSetting(this.settings.maxPhotosToLogin.name, this.maxPhotosToLogin)
    }
    this.snackBar.open('Configuracion guardada con exito!', '', {
      duration: 2000,
    });
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