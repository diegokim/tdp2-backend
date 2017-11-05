import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import 'rxjs/add/operator/toPromise';
import { MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-denounces',
  templateUrl: './denounces.component.html',
  styleUrls: ['./denounces.component.css']
})
export class DenouncesComponent implements OnInit {



  constructor(private http: HttpClient,
              private router: Router) { 
              }

  ngOnInit() {
  }
  
}





export class Denounce {
  sendUID: string
  recUID: string
  sendUName: string
  recUName: string
  message: string
  status: string
}