import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { SocialAuthService } from "@abacritt/angularx-social-login";
import { GoogleLoginProvider } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  isSectionActive = false;
  private accessToken = '';
  oauthUser: SocialUser | null = null;
  loggedIn: boolean = false;
  form: FormGroup;
  
  private authSubscription: Subscription | null = null;

  constructor(private authService: SocialAuthService, private auth: AuthService, private router: Router) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.isSectionActive = true;
    }, 100);
    this.authSubscription =this.authService.authState.subscribe((user) => {
      console.log('passoo');
      this.authService.signOut();

      this.onSubmit(user.idToken);
    });
  }
  ngOnDestroy() {
    if (this.authSubscription) {
      console.log('destroy');
      this.authSubscription.unsubscribe();
    }
  }

  googleSignin(googleWrapper: any) {
    googleWrapper.click();
  }



  onSubmit(token?: string) {
    if (this.form.invalid && !token) {
      swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all fields',
      });
      return;
    }
    this.auth.login(this.form.value, token).then((response) => {
      console.log(response);
      if (response.ok) {
        this.router.navigate(['/pomodoro']);

      } else {
        swal.fire({
          title: 'Error',
          text: 'response.message',
          icon: 'error'
        });
      }
    }).catch((error) => {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error'
      });
    });;
  }
}
