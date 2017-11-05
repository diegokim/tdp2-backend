import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router,
  private activatedRoute: ActivatedRoute) { }
  
  ngOnInit() {
  }

  shouldBeShown() {
    if (this.router.url != '/') {
      return true;
    }
    return false;
  }

  logOut() {
    localStorage.clear();
    this.router.navigateByUrl('/'); 
  }

}
