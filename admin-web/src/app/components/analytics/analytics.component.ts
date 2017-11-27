import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  data: ServerResponse;

  // lineChart
  public lineChartData:Array<any> = [
    {data: [], label: ''},
    {data: [], label: ''}
  ];

  public defaultPeriod: string;

  // Pie  
  public pieChartLabels:string[] = [];
  public pieChartData:number[] = [];
  public pieChartType:string = 'pie';
  public pieChartOptions = {  }
  
  public lineChartLabels:Array<any> = [];
  public lineChartOptions:any = {
    responsive: true
  };  
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

  

  analyticsUrl: string = 'http://localhost:5000/project/reports'

  constructor(private http: HttpClient) { }


  getData() {
    let url = this.analyticsUrl
    let today = new Date(Date.now())
    let oneMonthAgo = new Date(Date.now())
    oneMonthAgo.setMonth(today.getMonth() - 1 )
    
    let body = {
      startDate: oneMonthAgo.toDateString(),
      endDate:  today.toDateString()
    }
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'application/json','Authorization': token})
    return this.http.post(url, body, {headers}).toPromise()
  }

  ngOnInit() {

    let today: Date = new Date(Date.now())
    let oneMonthAgo = new Date(Date.now())
    oneMonthAgo.setMonth(today.getMonth() - 1 )
    console.log(today.getMonth())
    this.defaultPeriod =  (oneMonthAgo.getMonth() + 1) + '/' + oneMonthAgo.getFullYear() + ' - ' + (today.getMonth() + 1) + '/' + today.getFullYear()
    console.log(this.defaultPeriod)

    this.getData()
    .then( (res:ServerResponse) => {
      this.data = res;      
      this.pieChartData = this.data.denounces.data;
      this.pieChartLabels = this.data.denounces.labels;
      this.lineChartLabels = this.data.activeUsers.labels;
      this.lineChartData = this.data.activeUsers.data;

      

      this.pieChartOptions = {
        tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                footer: function(tooltipItems: TooltipItem, data: TooltipData) { 
                  let index = tooltipItems[0].index
                  let dataset = data.datasets[0].data
                  var blockeds = res.denounces.blockeds
                  var rejecteds = res.denounces.rejecteds
                  if (blockeds != null) {
                    
                    return 'Bloqueados: ' + blockeds[index] + " Rechazadas: " + rejecteds[index];
                  }
                  return '';
              }
            }
        }   
    }
    }
    )
  }

  // events
  public chartClicked(e:any):void {
    let index = e.active[0]._index
    alert( this.pieChartData[index])
  }
 
  public chartHovered(e:any):void {
    let index = e.active[0]._index
    console.log(e);
  }

// events
public lineChartClicked(e:any):void {
  console.log(e);
}

public lineChartHovered(e:any):void {
  console.log(e);
}


}

export class ServerResponse {
  activeUsers: {
    labels: Array<string>;
    data: Array<Line>;
    
    table: Array<{
      premium: string;
      label: string;
      total: number;
      
    }>
  };
  denounces: {
    labels: string[];
    data: number[];
    blockeds: Array<number>;
    rejecteds: Array<number>;
    table: Array<{
      label: string
      spam: number
      otro: number
      'mensaje inapropiado': number;
      'comportamiento abusivo': number
    }>
  }
}

class Line {
  data: Array<number>;
  label: string;
}

export class TooltipItem {
  index: number;
}

export class TooltipData {
  datasets: Array<{
    data: Array<any>
  }>
}