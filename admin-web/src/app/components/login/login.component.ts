import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';
import { FlashMessagesService } from 'angular2-flash-messages'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user: string;
  password: string
  loginUrl: string = "http://localhost:5000/admin/login"

  constructor(private http: HttpClient,
              private router: Router,
            private flashMessage: FlashMessagesService) { }

  ngOnInit() {
  }

  loginSucced(token: string) {
    localStorage.setItem('sessionToken', token)
    // TODO: Go to the corresponding page.
    this.router.navigateByUrl('/denounces');
  }

  loginAction() {
    let user = this.user
    let password = this.password
    let headers = new HttpHeaders({'Content-type': 'aplication/json'})

    if (user && password) {
      this.http.post(this.loginUrl,{user, password})
      .toPromise()
      .then(response => this.loginSucced(response['token']))
      // TODO: Handle error
      .catch( err => this.showLoginError())
    }
  }
  showLoginError() {
    this.flashMessage.show('Los datos ingresados son incorrectos!', {cssClass: 'alert-danger', timeout: 3000})
  }
}
