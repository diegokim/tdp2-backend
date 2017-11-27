import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FancyImageUploaderOptions, UploadedFile, ResizeOptions } from 'ng2-fancy-image-uploader';
import { MatSnackBar, MatDatepickerInputEvent, DateAdapter } from '@angular/material';
import { sendRequest } from 'selenium-webdriver/http';
var resizebase64 = require('resize-base64');

@Component({
  selector: 'app-settings-add-advertising',
  templateUrl: './settings-add-advertising.component.html',
  styleUrls: ['./settings-add-advertising.component.css']
})
export class SettingsAddAdvertisingComponent implements OnInit {
  public image: string;
  public name: string;
  public file: File;
  public startDate: Date = new Date(Date.now());
  public endDate: Date = new Date(Date.now());

  changeListener($event) : void {
    this.readThis($event.target);
  }

  resetForm() {
    this.image = null
    this.startDate  = new Date(Date.now());
    this.endDate = new Date(Date.now());
    this.name = null
    this.file = null
  }
  
  readThis(inputValue: any): void {
    var file:File = inputValue.files[0];
    var myReader:FileReader = new FileReader();
  
    myReader.onloadend = (e) => {
      // let buffer: string = myReader.result
      // let arr: string[] = buffer.split(';base64,')
      // this.image = arr[0] + ';base64,' +  resizebase64(arr[1],350,105);
      // console.log(this.image)
      this.image = myReader.result
    }
    myReader.readAsDataURL(file);
  }


  sendRequest(body) {
    let url = "http://localhost:5000/project/advertising"
    let token = localStorage.getItem('sessionToken')
    let headers = new HttpHeaders({ 'Content-type': 'application/json', 'Authorization': token })
    return this.http.post(url, body, { headers }).toPromise()
  }


  updateData() {
    if ( this.startDate == null || this.endDate == null || this.image == null || this.name == null) {
      this.snackBar.open('Todos los campos son obligatorios!', '', {
        duration: 2000,
      });
    } else {
      if (this.name.length <= 0) {
        this.snackBar.open('Debes llenar el campo nombre!', '', {
          duration: 2000,
        })
      } else if ( this.startDate <=  this.endDate) {
        let body = {
          name: this.name,
          startDate: this.startDate.toDateString(),
          endDate: this.endDate.toDateString(),
          image: this.image.split(';base64,')[1]
        }
        this.sendRequest(body)
        .then( (res) => {
          this.snackBar.open('Publicidad agregada con exito!', '', {
            duration: 2000,
          })
          this.router.navigateByUrl('/settings/advertising')
        })
        .catch(()=> {
          this.snackBar.open('Ha ocurrido un error al comunicarnos con el server, por favor intenta mas tarde!', '', {
            duration: 2000,
          })
        }) 
      } else {
        this.snackBar.open('La Fecha de Inicio no debe ser posterior a la de Fin!', '', {
          duration: 2000,
        });
      }
    }
  }


  setStartDate(type: string, event: MatDatepickerInputEvent<Date>) {
    // this.events.push(`${type}: ${event.value}`);
    var date: Date = event.value
    var today = new Date(Date.now());
    this.startDate = event.value
    console.log(this.startDate.getMonth())
  }

  setEndDate(type: string, event: MatDatepickerInputEvent<Date>) {
    var date: Date = event.value
    var today = new Date(Date.now());
    if ( date < today ) {
      this.snackBar.open('La fecha de fin no puede ser una fecha pasada!', '', {
        duration: 2000,
      });
      this.endDate = null
    } else {
      this.endDate = event.value
    }
    
  }

  get previewImage() {
    if (this.image != null) {
      return this._sanitizer.bypassSecurityTrustUrl( this.image );
    } else {
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
    }
  }


onUpload(file: UploadedFile) {
  // console.log(file.response);
}

  constructor(private _sanitizer: DomSanitizer,
  private snackBar: MatSnackBar,
  private http: HttpClient,
  private router: Router,
  private adapter: DateAdapter<any>) { 
    adapter.setLocale('es');
  }
  
  ngOnInit() {
  }

}
