import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  activeUsers: Array<ActiveUsersRegistry>;
  denounces: {
    comp: DenouncesRegistry;
    otro: DenouncesRegistry;
    spam: DenouncesRegistry;
  }

  analyticsUrl: string = 'http://localhost:5000/project/reports'

  constructor(private http: HttpClient) { }

  getData() {
    let url = this.analyticsUrl
    let body = {
      startDate: '15/9/16',
      endDate: '15/9/17'
    }
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({'Content-type': 'aplication/json','Authorization': token})
    return this.http.post(url, body, {headers}).toPromise()
  }

  ngOnInit() {
    this.getData()
    .then( (res:ServerResponse) => {
      this.activeUsers = res.activeUsers.sampling
      this.denounces = res.denounces  
      console.log(res)
      //this.pieChartData = [this.denounces.comp.count, this.denounces.otro.count, this.denounces.spam.count]
    }

    )

  }

  // Pie
  public pieChartLabels:string[] = ['Comportamiento Abusivo', 'Otro', 'Spam'];
  public pieChartData:number[] = [300, 500, 100];
  public pieChartType:string = 'pie';
 
  // events
  public chartClicked(e:any):void {
    let index = e.active[0]._index
    alert( this.pieChartData[index])
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }


// lineChart
public lineChartData:Array<any> = [
  {data: [65, 59, 80, 81, 56, 55, 40], label: 'Usuarios Totales'},
  {data: [28, 48, 40, 19, 40, 27, 20], label: 'Usuarios Premium'}
];
public lineChartLabels:Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
public lineChartOptions:any = {
  responsive: true
};  
public lineChartLegend:boolean = true;
public lineChartType:string = 'line';


// events
public lineChartClicked(e:any):void {
  console.log(e);
}

public lineChartHovered(e:any):void {
  console.log(e);
}










}

class ServerResponse {
  activeUsers: {
    sampling: Array<ActiveUsersRegistry>
  };
  denounces: {
    comp: DenouncesRegistry;
    otro: DenouncesRegistry;
    spam: DenouncesRegistry;
  }
}

class ActiveUsersRegistry {
  x: number;
  y: number;
}

class DenouncesRegistry {
  count: number;
  percentaje: number;
  blocked: number;
}