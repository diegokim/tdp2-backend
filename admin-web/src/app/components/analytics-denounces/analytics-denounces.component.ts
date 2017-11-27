import { DenouncesDataSource, DenouncesDatabase } from './../denouncestable/denouncestable.component';
import { Denounce } from './../denounces/denounces.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';
import { MatSort, MatDatepickerInputEvent, MatSnackBar, DateAdapter } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs/Rx';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ServerResponse, TooltipItem, TooltipData } from './../analytics/analytics.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-analytics-denounces',
  templateUrl: './analytics-denounces.component.html',
  styleUrls: ['./analytics-denounces.component.css']
})
export class AnalyticsDenouncesComponent implements OnInit {
  data: ServerResponse;
  startDate: Date;
  endDate: Date;
  public today: Date = new Date(Date.now())
  minDate: Date;
  startDateDefault: Date;
  endDateDefault: Date;

  perTypeIndex:number;
  mustShowDenounceTypeDetails: boolean = false;

  perTypePieChartTitle: string = '';
  // Pie  
  public pieChartLabels: string[] = [];
  public pieChartData: number[] = [];
  public pieChartType: string = 'pie';

  public pieChartOptions = {}

  public perTypePieChartLabels: string[] = [];
  public perTypePieChartData: number[] = [];
  public perTypePieChartType: string = 'pie';
  public perTypePieChartOptions: {}

  analyticsUrl: string = 'http://localhost:5000/project/reports'


  constructor(private http: HttpClient,
  private router: Router,
  private snackBar: MatSnackBar,
  private adapter: DateAdapter<any>) { 
    adapter.setLocale('es');
  }


  resetData() {
    this.resetDatesToDefault()
    this.updateData()
  }

  resetDatesToDefault(){
    this.startDate = this.startDateDefault;
    this.endDate = this.endDateDefault;
  }

  setStartDate(type: string, event: MatDatepickerInputEvent<Date>) {
    // this.events.push(`${type}: ${event.value}`);
    var date: Date = event.value
    var today = new Date(Date.now());
    if ( date > today ) {
      this.snackBar.open('La fecha debe ser anterior a la fecha actual!', '', {
        duration: 2000,
      });
      this.startDate = this.startDateDefault
    } else {
      this.startDate = event.value
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

  updateData() {
    if ( this.startDate == null || this.endDate == null ) {
      this.snackBar.open('Los campos desde y hasta son obligatorios!', '', {
        duration: 2000,
      });
    } else {
      if ( this.startDate <  this.endDate) {
        this.getDataForDates(this.startDate, this.endDate)
        .then((res: ServerResponse) => {
          // this.data = res;
          this.data.activeUsers = res.activeUsers;
          this.data.denounces = res.denounces;
          this.database.updateDenounces(res.denounces.table)
          this.pieChartData = this.data.denounces.data;
          this.pieChartLabels = this.data.denounces.labels;

          if (this.mustShowDenounceTypeDetails && this.perTypeIndex != null) {
            let index = this.perTypeIndex
            let blockeds = this.data.denounces.blockeds[index];
            let rejecteds = this.data.denounces.rejecteds[index];

            this.perTypePieChartData = [blockeds, rejecteds]
            this.perTypePieChartLabels = ["Bloqueados", "Rechazados"]
          }
          
          this.snackBar.open('Datos actualizados con éxito!', '', {
            duration: 2000,
          });  
        })
        .catch(()=> {
          this.snackBar.open('Ha ocurrido un error al comunicarnos con el server, por favor intenta mas tarde!', '', {
            duration: 2000,
          });  
        }) 
      } else {
        this.snackBar.open('La fecha desde no debe ser posterior a la de hasta!', '', {
          duration: 2000,
        });
      }
    }
  }

  getDataForDates(startDate: Date,endDate: Date) {
    let url = this.analyticsUrl
    let body = {
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString() 
    }
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({ 'Content-type': 'application/json', 'Authorization': token })
    return this.http.post(url, body, { headers }).toPromise()
  }

  getData() {
    this.startDate = this.startDateDefault
    this.endDate = this.endDateDefault
    return this.getDataForDates(this.startDate, this.endDate)
  }

  ngOnInit() {
    this.minDate = new Date(Date.now());
    this.minDate.setFullYear(this.minDate.getFullYear() -1)
    let today = new Date(Date.now())
    let oneMonthAgo = new Date(Date.now())
    oneMonthAgo.setMonth(today.getMonth() - 1)
    this.startDateDefault = oneMonthAgo;
    this.endDateDefault = today;
    this.dataSource = new DenouncesDataSource(this.database, this.sort);
    this.getData()
      .then((res: ServerResponse) => {
        // this.data = res;
        this.data = new ServerResponse();
        this.data.activeUsers = res.activeUsers;
        this.data.denounces = res.denounces;
        this.database.updateDenounces(res.denounces.table)
        this.pieChartData = this.data.denounces.data;
        this.pieChartLabels = this.data.denounces.labels;
        var footerData:DataContainer = new DataContainer();
        footerData.data = this.data; 
        this.pieChartOptions = {
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              footer: function (tooltipItems: TooltipItem, data: TooltipData) {
                let index = tooltipItems[0].index
                let dataset = data.datasets[0].data
                 
                
                if (footerData.data.denounces.blockeds != null) {
                  return 'Bloqueados: ' + footerData.data.denounces.blockeds[index] + " Rechazadas: " + footerData.data.denounces.rejecteds[index] ;
                }
                return '';
              }
            }
          }
        }

        this.perTypePieChartOptions = {
          legend: {
            position: 'right'
          },
        }
      })
  }

  hidePerTypeChart() {
    this.mustShowDenounceTypeDetails = false;
  }

  // events
  public chartClicked(e: any): void {
    this.perTypeIndex = e.active[0]._index
    let index = this.perTypeIndex
    // alert(this.pieChartData[index])
    let blockeds = this.data.denounces.blockeds[index];
    let rejecteds = this.data.denounces.rejecteds[index];
    let pendings = this.pieChartData[index] - blockeds - rejecteds;
    this.perTypePieChartData = [blockeds, rejecteds]
    this.perTypePieChartLabels = ["Bloqueados", "Rechazados"]
    this.mustShowDenounceTypeDetails = true;
    this.perTypePieChartTitle = this.pieChartLabels[index];

    
  }

  public chartHovered(e: any): void {
    let index = e.active[0]._index
    console.log(e);
  }



  displayedColumns = ['month', 'abusive', 'spam', 'inapropiate', 'other'];
  denounces: Denounce[];
  database = new DenouncesDatabase([]);
  dataSource: DenouncesDataSource | null;

  baseUrl = 'http://localhost:5000/project/advertising';

  @ViewChild(MatSort) sort: MatSort;



  getAdvertising() {

  }

}

class DataContainer {
  data: ServerResponse;
}