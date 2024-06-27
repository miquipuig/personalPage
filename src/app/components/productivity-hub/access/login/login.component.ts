import { Component } from '@angular/core';

import { SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  isSectionActive = false;
  private accessToken = '';
  user: SocialUser | null = null;
  loggedIn: boolean = false;

  constructor(private authService: SocialAuthService, private auth:AuthService ) { }

  ngOnInit() {
    setTimeout(() => {
      this.isSectionActive = true;
    }, 100);
    this.authService.authState.subscribe((user) => {
      this.auth.loginOAuth(user).then((token) => {
        console.log(token);
      });
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
