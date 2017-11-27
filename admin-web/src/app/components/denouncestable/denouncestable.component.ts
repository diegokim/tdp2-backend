import { element } from 'protractor';
import { Denounce } from './../denounces/denounces.component';
import { DenouncesService } from './../../services/denounces.service';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material';
import { Component, ViewChild, Injectable, Input } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-denouncestable',
  templateUrl: './denouncestable.component.html',
  styleUrls: ['./denouncestable.component.css'],
  providers: [DenouncesService]
})




export class DenouncestableComponent {
  displayedColumns = ['sendUName', 'recUName', 'type', 'status', 'accept', 'reject'];
  denounces: Denounce[];
  database = new DenouncesDatabase([]);
  dataSource: DenouncesDataSource | null;

  selected = 'receiver';

  filterValue: string;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    var denouncesFiltered = this.denounces.filter( element => {
      
      if ( filterValue.length != 0 ) {
        switch(this.selected) {
          case 'receiver':
              if (element.recUName.toLowerCase().includes(filterValue) ) {
                return true;
              }
              return false;
            case 'sender':
              if (element.sendUName.toLowerCase().includes(filterValue) ) {
                return true;
              }
              return false;
            case 'type':
            if (element.type.toLowerCase().includes(filterValue) ) {
              return true;
            }
            return false;
          default:
              return true;
        }
      }
      return true
    });
    this.database.updateDenounces(denouncesFiltered);
  }

  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router,
  private denouncesService: DenouncesService) {

  }

  updateDenounces() {
    this.denouncesService.getDenounces()
    .then( (denounces:Denounce[]) => {
      this.denounces = denounces;
      this.database.updateDenounces(denounces);
    })
    .catch(console.log)
  }

  ngOnInit() {
    this.dataSource = new DenouncesDataSource(this.database, this.sort);
    this.updateDenounces();
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

}
/** An example database that the data source uses to retrieve data for the table. */
export class DenouncesDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<Denounce[]> = new BehaviorSubject<Denounce[]>([]);
  get data(): Denounce[] { return this.dataChange.value; }

  constructor(denounces: Denounce[]) {
    // Fill up the database with 100 users.
    denounces.forEach(denounce => {
      this.addDenounce(denounce);
    });
  }

  /** Adds a new user to the database. */
  addDenounce(denounce) {
    const copiedData = this.data.slice();
    copiedData.push(denounce);
    this.dataChange.next(copiedData);
  }

  updateDenounces(newDenounces) {
    
    this.dataChange.next(newDenounces);
  }

}


export class DenouncesDataSource extends DataSource<any> {

  constructor(private _exampleDatabase: DenouncesDatabase, private _sort: MatSort) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Denounce[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this.getSortedData();
    });
  }

  disconnect() {}

  /** Returns a sorted copy of the database data. */
  getSortedData(): Denounce[] {
    const data = this._exampleDatabase.data.slice();
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'userName' : [propertyA, propertyB] = [a.userName, b.userName]; break;
        case 'sendUName': [propertyA, propertyB] = [a.sendUName, b.sendUName]; break;
        case 'recUName': [propertyA, propertyB] = [a.recUName, b.recUName]; break;
        case 'type': [propertyA, propertyB] = [a.type, b.type]; break;
        case 'status': [propertyA, propertyB] = [a.status, b.status]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}





