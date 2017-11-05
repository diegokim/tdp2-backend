import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Rx";

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor() {}

  canActivate():Observable<boolean>|boolean {
    if ( localStorage.getItem('sessionToken') != null) {
        return true;
    }
    return false;
  }
}