import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'app';

  constructor (private router: Router,
  private activatedRoute: ActivatedRoute) {

  }

  thePageHasToolbar() {
    if (this.router.url != '/') { 
      return true;
    }
    return false;
  }

  changeOfRoutes() {
    if ( localStorage.getItem('sessionToken') != null ) {
      return true;
    }
    this.router.navigateByUrl('/'); 
    return false;
  }
}
