import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { DenouncesComponent } from './components/denounces/denounces.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ProfileComponent } from './components/profile/profile.component';


import { FlashMessagesModule} from 'angular2-flash-messages'
import {MatListModule} from '@angular/material';
import {MatTabsModule} from '@angular/material';
import { MainComponent } from './components/main/main.component';


const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'denounces',
    component: DenouncesComponent
  },
  {
    path: 'profile/:id',
    component: ProfileComponent
  },
  {
    path: 'main',
    component: MainComponent
  }
  
]


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DenouncesComponent,
    ProfileComponent,
    MainComponent
    
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTabsModule,
    FlashMessagesModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
