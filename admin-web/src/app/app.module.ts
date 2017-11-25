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

import { ImageUploadModule } from "angular2-image-upload";
import { FancyImageUploaderModule } from 'ng2-fancy-image-uploader';
import { FlashMessagesModule} from 'angular2-flash-messages'
import { MatListModule, MatCardModule, MatSelectModule, MatGridListModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule, MatTooltipModule } from '@angular/material';
import {MatTabsModule, MatSidenavModule, MatToolbarModule, MatTableModule, MatSortModule, MatButtonModule, MatInputModule} from '@angular/material';
import { MainComponent } from './components/main/main.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CdkTableModule } from '@angular/cdk/table';
import { DenouncestableComponent } from './components/denouncestable/denouncestable.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ChartsModule } from 'ng2-charts';
import { SettingsAdvertisingComponent } from './components/settings-advertising/settings-advertising.component';
import { SettingsLanguageComponent } from './components/settings-language/settings-language.component';
import { SettingsAddAdvertisingComponent } from './components/settings-add-advertising/settings-add-advertising.component';
import { AnalyticsDenouncesComponent } from './components/analytics-denounces/analytics-denounces.component';
import { AnalyticsActiveUsersComponent } from './components/analytics-active-users/analytics-active-users.component';
import { Ng2FileSizeModule } from 'ng2-file-size';

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
  },
  {
    path: 'settings/advertising',    
    component: SettingsAdvertisingComponent
  },
  {
    path: 'settings/language',
    component: SettingsLanguageComponent
  },
  {
    path: 'settings/advertising/new',
    component: SettingsAddAdvertisingComponent
  },
  {
    path: 'analytics/denounces',
    component: AnalyticsDenouncesComponent
  },
  {
    path: 'analytics/activeusers',
    component: AnalyticsActiveUsersComponent
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
    AnalyticsComponent,
    SettingsAdvertisingComponent,
    SettingsLanguageComponent,
    SettingsAddAdvertisingComponent,
    AnalyticsDenouncesComponent,
    AnalyticsActiveUsersComponent

    
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
    ChartsModule,
    MatSelectModule,
    MatGridListModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FancyImageUploaderModule,
    ImageUploadModule.forRoot(),
    MatTooltipModule,
    Ng2FileSizeModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
