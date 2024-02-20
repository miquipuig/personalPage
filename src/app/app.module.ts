import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AboutComponent } from './components/about/about.component';
import { ResumeComponent } from './components/resume/resume.component';
import { ServicesComponent } from './components/services/services.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { ContactComponent } from './components/contact/contact.component';
import { JueguitoComponent } from './components/jueguito/jueguito.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    ResumeComponent,
    ServicesComponent,
    PortfolioComponent,
    ContactComponent,
    JueguitoComponent
  ],
  imports: [ReactiveFormsModule, 
    BrowserModule,
    AppRoutingModule,HttpClientModule,BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
