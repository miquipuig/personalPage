import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServicesComponent } from './components/services/services.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmptyComponentComponent } from './components/empty-component/empty-component.component';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    ServicesComponent,
    EmptyComponentComponent
  ],
  imports: [ReactiveFormsModule,
    BrowserModule,
     HttpClientModule, BrowserAnimationsModule, NgbModule,AppRoutingModule
  ],
  // providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
    bootstrap: [AppComponent]
})
export class AppModule { }
