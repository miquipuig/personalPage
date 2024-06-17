import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  isSectionActive = true;
  private accessToken = '';
  user: SocialUser | null = null;
  loggedIn: boolean = false;

  constructor(private authService: SocialAuthService, private httpClient: HttpClient) { }

  ngOnInit() {
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }


  googleSignin(googleWrapper: any) {
    googleWrapper.click();
  }
  // refreshToken(): void {
  //   this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  // }
  // getAccessToken(): void {
  //   this.authService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then(accessToken => this.accessToken = accessToken);
  // }

  // getGoogleCalendarData(): void {
  //   if (!this.accessToken) return;

  //   this.httpClient
  //     .get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  //       headers: { Authorization: `Bearer ${this.accessToken}` },
  //     })
  //     .subscribe((events) => {
  //       alert('Look at your console');
  //       console.log('events', events);
  //     });
  // }
}
