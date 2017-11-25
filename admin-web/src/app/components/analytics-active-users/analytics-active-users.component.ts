import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { DataSource } from '@angular/cdk/table';
import { MatDatepickerInputEvent, MatSnackBar, MatSort, DateAdapter } from '@angular/material';
import { ServerResponse, TooltipItem, TooltipData } from './../analytics/analytics.component';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-analytics-active-users',
  templateUrl: './analytics-active-users.component.html',
  styleUrls: ['./analytics-active-users.component.css']
})
export class AnalyticsActiveUsersComponent implements OnInit {
  minDate: Date;
  data: ServerResponse;
  analyticsUrl: string = 'http://localhost:5000/project/reports';
  public startDate: Date;
  public endDate: Date;
  public today: Date = new Date(Date.now())
  
  startDateDefault: Date;
  endDateDefault: Date;

  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['month-year', 'name','accountType'];
  dataSet: ActiveUserRegistry[];
  database = new ActiveUsersDatabase([]);
  dataSource: ActiveUsersDataSource | null;

  startDateFormatted;


  updateStartDate(newValue: Date) {
    this.startDate = newValue;
    console.log(this.startDate.toDateString())
    console.log(this.startDate.toISOString())
    this.startDateFormatted = newValue.toLocaleDateString();
  }

  // lineChart
  public lineChartData: Array<any> = [
    { data: [], label: '' },
    { data: [], label: '' }
  ];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  expanded: boolean = false;

  

  contract() {
    this.expanded = false;
  }

  constructor(private http: HttpClient,
    private snackBar: MatSnackBar,
    private adapter: DateAdapter<any>) { 
      adapter.setLocale('es'); }

  

  getDataForDates(startDate: Date, endDate: Date) {
    let url = this.analyticsUrl
    
    let body = {
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString()
    }
    console.log(body)
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({ 'Content-type': 'application/json', 'Authorization': token })
    return this.http.post(url, body, { headers }).toPromise()
  }
  
  getData() {
    let url = this.analyticsUrl
    this.resetDatesToDefault()
   return this.getDataForDates(this.startDate,this.endDate);
  }


  expand() {
    this.expanded = true;
  }

  resetData() {
    this.resetDatesToDefault()
    this.updateData()
  }

  resetDatesToDefault(){
    this.updateStartDate(this.startDateDefault)
    this.endDate = this.endDateDefault;
  }

  updateData() {
    if (this.startDate == null || this.endDate == null) {
      this.snackBar.open('Los campos desde y hasta son obligatorios!', '', {
        duration: 2000,
      });
    } else {
      if (this.startDate < this.endDate) {
        this.getDataForDates(this.startDate, this.endDate)
          .then((res: ServerResponse) => {
            this.data = res;
            console.log(res)
            this.database.updateActiveUserRegistrys(res.activeUsers.table);
            this.lineChartLabels = this.data.activeUsers.labels;
            setTimeout(() => {
              this.lineChartData = this.data.activeUsers.data;
            }, 1);
          }
        )
        .catch(() => {
        this.snackBar.open('Ha ocurrido un error al comunicarnos con el server, por favor intenta mas tarde!', '', {
          duration: 2000,
        });
      }) 
      } else {
      this.snackBar.open('La fecha desde no debe ser posterior a la de hasta!', '', {
        duration: 2000,
      });
    }
  }}



  setStartDate(type: string, event: MatDatepickerInputEvent<Date>) {
    // this.events.push(`${type}: ${event.value}`);
    var date: Date = event.value
    var today = new Date(Date.now());
    if ( date > today ) {
      this.snackBar.open('La fecha debe ser anterior a la fecha actual!', '', {
        duration: 2000,
      });
      this.updateStartDate(this.startDateDefault)
    } else {
      this.updateStartDate(event.value)
    }
    
  }

  setEndDate(type: string, event: MatDatepickerInputEvent<Date>) {
    var date: Date = event.value
    var today = new Date(Date.now());
    if ( date > today ) {
      this.snackBar.open('La fecha debe ser anterior a la fecha actual!', '', {
        duration: 2000,
      });
      this.endDate = this.endDateDefault
    } else {
      this.endDate = event.value
    }
    
  }
  ngOnInit() {
    this.minDate = new Date(Date.now());
    this.minDate.setFullYear(this.minDate.getFullYear() -1)
    let today = new Date(Date.now())
    let oneMonthAgo = new Date(Date.now())
    oneMonthAgo.setMonth(today.getMonth() - 1)
    this.startDateDefault = oneMonthAgo;
    this.updateStartDate(oneMonthAgo) 
    this.endDateDefault = today;
    this.dataSource = new ActiveUsersDataSource(this.database, this.sort);
    this.getData()
      .then((res: ServerResponse) => {
        this.data = res;
        console.log(res)
        this.database.updateActiveUserRegistrys(res.activeUsers.table)
        this.lineChartLabels = this.data.activeUsers.labels;
        this.lineChartData = this.data.activeUsers.data;
      }
      )
  }
}


class ActiveUserRegistry {
  id: string;
  name: string;
  month: number;
  year: number;
  accountType: string;
}


export class ActiveUsersDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<ActiveUserRegistry[]> = new BehaviorSubject<ActiveUserRegistry[]>([]);
  get data(): ActiveUserRegistry[] { return this.dataChange.value; }

  constructor(activeUsers: ActiveUserRegistry[]) {
    // Fill up the database with 100 users.
    this.updateActiveUserRegistrys(activeUsers)
  }

  updateActiveUserRegistrys(newActiveUserRegistrys) {
    this.dataChange.next(newActiveUserRegistrys);
  }

}






class ActiveUsersDataSource extends DataSource<any> {

  constructor(private _exampleDatabase: ActiveUsersDatabase, private _sort: MatSort) {
    super();
  }
  connect(): Observable<ActiveUserRegistry[]> {
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
  getSortedData(): ActiveUserRegistry[] {
    const data = this._exampleDatabase.data.slice();
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'id' : [propertyA, propertyB] = [a.id, b.id]; break;
        case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'month': [propertyA, propertyB] = [a.month, b.month]; break;
        case 'year': [propertyA, propertyB] = [a.year, b.year]; break;
        case 'accountType': [propertyA, propertyB] = [a.accountType, b.accountType]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
  
}