import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ApiBaseInterceptor } from './interceptors/api-base.interceptor';
import { ServicesComponent } from './components/services/services.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmptyComponentComponent } from './components/empty-component/empty-component.component';
import { LoginComponent } from './components/productivity-hub/access/login/login.component';
import { GoogleSigninComponent } from './components/productivity-hub/access/login/google-signin/google-signin.component';
import { GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthServiceConfig, SocialLoginModule, GoogleSigninButtonDirective } from "@abacritt/angularx-social-login";
import { RegistrationComponent } from './components/productivity-hub/access/registration/registration.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SharedModule } from './shared.module';
import { NgcCookieConsentModule } from 'ngx-cookieconsent';
import { cookieConfig } from './cookie.config';
// import { MarkdownModule, MarkedOptions } from 'ngx-markdown';


@NgModule({
  declarations: [
    AppComponent,
    ServicesComponent,
    EmptyComponentComponent,
    LoginComponent,
    RegistrationComponent,
    GoogleSigninComponent,
    NavbarComponent

  ],
  imports: [ReactiveFormsModule,
    BrowserModule,
     HttpClientModule, BrowserAnimationsModule, NgbModule,AppRoutingModule,   SocialLoginModule,
     GoogleSigninButtonModule,SharedModule,
     NgcCookieConsentModule.forRoot(cookieConfig),
    //  MarkdownModule.forRoot({
    //   loader: HttpClient, // optional, only if you use [src] attribute
    //   markedOptions: {
    //     provide: MarkedOptions,
    //     useValue: {
    //       gfm: true,
    //       breaks: false,
    //       pedantic: false,
    //       smartLists: true,
    //       smartypants: false,
    //     },
    //   },
    // }),
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
              "890461686537-e4s232ra16rcq23mnnkq9p9fah4n60t0.apps.googleusercontent.com",
              { oneTapEnabled: false }
            ),
          },
        ],
        onError: (err: unknown) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    GoogleSigninButtonDirective,
    { provide: HTTP_INTERCEPTORS, useClass: ApiBaseInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideClientHydration()
  ],
  // providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
    bootstrap: [AppComponent]
})
export class AppModule { }
