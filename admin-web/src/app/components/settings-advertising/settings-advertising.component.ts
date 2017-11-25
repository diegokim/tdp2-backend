import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';
import { MatSort, MatSnackBar } from '@angular/material';
import { Denounce } from './../denounces/denounces.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-settings-advertising',
  templateUrl: './settings-advertising.component.html',
  styleUrls: ['./settings-advertising.component.css'],

})
export class SettingsAdvertisingComponent implements OnInit {

  displayedColumns = ['image', 'name', 'startDate', 'endDate',  'delete'];
  advertising: Advertising[];
  database = new AdvertisingDatabase([]);
  dataSource: AdvertisingDataSource | null;

  baseUrl = 'http://localhost:5000/project/advertising';

  @ViewChild(MatSort) sort: MatSort;

  constructor(private _sanitizer: DomSanitizer,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar) {
    this.updateData()
  }

  updateData() {
    let url = this.baseUrl;
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({ 'Content-type': 'application/json', 'Authorization': token })
    this.http.get(url, { headers }).toPromise()
      .then((advertising: Advertising[]) => {
        console.log(advertising)
        this.advertising = advertising;
        this.database.updateAdvertising(advertising);
      })
  }

  deleteAdvertising(id) {
    let url = this.baseUrl + '/' + id;
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({ 'Content-type': 'application/json', 'Authorization': token })
    this.http.delete(url, { headers }).toPromise()
    .then ((res) => {
      this.updateData();
    } )
      .catch(() => {
        this.snackBar.open('Ha ocurrido un error, por favor intenta mas tarde!', '', {
          duration: 2000,
        });
      })

  }

  getImage(image) {
    console.log(image)
    if (image != null) {
      return this._sanitizer.bypassSecurityTrustUrl( 'data:image/png;base64,' + image);
    } else {
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
    }
  }

  ngOnInit() {
    this.dataSource = new AdvertisingDataSource(this.database, this.sort);

  }

}

class Advertising {
  id: string;
  image: string;
  startDate: string;
  endDate: string;
  name: string;
}



/** An example database that the data source uses to retrieve data for the table. */
export class AdvertisingDatabase {
  updateAdvertising(newAdvertising: Advertising[]) {
    this.dataChange.next(newAdvertising);
  }
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<Advertising[]> = new BehaviorSubject<Advertising[]>([]);
  get data(): Advertising[] { return this.dataChange.value; }

  constructor(advertising: Advertising[]) {
    // Fill up the database with 100 users.
    advertising.forEach(advertising => {
      this.addAdvertising(advertising);
    });
  }

  /** Adds a new user to the database. */
  addAdvertising(advertising: Advertising) {
    const copiedData = this.data.slice();
    copiedData.push(advertising);
    this.dataChange.next(copiedData);
  }

}


export class AdvertisingDataSource extends DataSource<any> {

  constructor(private _exampleDatabase: AdvertisingDatabase, private _sort: MatSort) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Advertising[]> {
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this.getSortedData();
    });
  }

  disconnect() { }

  /** Returns a sorted copy of the database data. */
  getSortedData(): Advertising[] {
    const data = this._exampleDatabase.data.slice();
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'startDate': [propertyA, propertyB] = [a.startDate, b.startDate]; break;
        case 'endDate': [propertyA, propertyB] = [a.endDate, b.endDate]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}