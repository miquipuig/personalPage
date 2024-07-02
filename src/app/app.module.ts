import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServicesComponent } from './components/services/services.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmptyComponentComponent } from './components/empty-component/empty-component.component';
import { LoginComponent } from './components/productivity-hub/access/login/login.component';
import { GoogleSigninComponent } from './components/productivity-hub/access/login/google-signin/google-signin.component';
import { GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthServiceConfig, SocialLoginModule, GoogleSigninButtonDirective } from "@abacritt/angularx-social-login";
import { RegistrationComponent } from './components/productivity-hub/access/registration/registration.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeaderComponent } from './component/header/header.component';



@NgModule({
  declarations: [
    AppComponent,
    ServicesComponent,
    EmptyComponentComponent,
    LoginComponent,
    RegistrationComponent,
    GoogleSigninComponent,
    NavbarComponent,
    HeaderComponent,
    TruncatePipe

  ],
  imports: [ReactiveFormsModule,
    BrowserModule,
     HttpClientModule, BrowserAnimationsModule, NgbModule,AppRoutingModule,   SocialLoginModule,
     GoogleSigninButtonModule,
  ],
  providers: [
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              "575980238998-i8ss198g31m6jrjlc5ik2lsh18pq9q3d.apps.googleusercontent.com"
            ),
          },
        ],
        onError: (err: unknown) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    GoogleSigninButtonDirective
  ],
  // providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
    bootstrap: [AppComponent]
})
export class AppModule { }
