import { LoggedInGuard } from './ultils/login.guard';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { FormsModule } from '@angular/forms';
import { CanActivate, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { DenouncesComponent } from './components/denounces/denounces.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ProfileComponent } from './components/profile/profile.component';


import { FlashMessagesModule} from 'angular2-flash-messages'
import { MatListModule, MatCardModule } from '@angular/material';
import {MatTabsModule, MatSidenavModule, MatToolbarModule, MatTableModule, MatSortModule, MatButtonModule, MatInputModule} from '@angular/material';
import { MainComponent } from './components/main/main.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CdkTableModule } from '@angular/cdk/table';
import { DenouncestableComponent } from './components/denouncestable/denouncestable.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ChartsModule } from 'ng2-charts';

const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'denounces',
    component: DenouncesComponent,
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
  },
  {
    path: 'main',
    component: MainComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'analytics',
    component: AnalyticsComponent
  }
]



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DenouncesComponent,
    ProfileComponent,
    MainComponent,
    NavbarComponent,
    SidebarComponent,
    DenouncestableComponent,
    SettingsComponent,
    AnalyticsComponent

    
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTabsModule,
    FlashMessagesModule,
    MatListModule,
    MatCardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTableModule,
    CdkTableModule,
    MatSortModule,
    MatButtonModule,
    MatInputModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
