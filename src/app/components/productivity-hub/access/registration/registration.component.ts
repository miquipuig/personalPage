import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { count } from 'rxjs';
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  form: FormGroup;
  oauthUser: SocialUser | null = null;
  constructor(private authService: SocialAuthService, private auth: AuthService, private router: Router) {

    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  isSectionActive = false;
  ngOnInit() {
    setTimeout(() => {
      this.isSectionActive = true;
    }, 100);

    this.authService.authState.subscribe((user) => {
      //
      this.oauthUser = user;
      this.form.get('name')?.setValue(user.name);
      this.form.get('email')?.setValue(user.email);
    });
  }


  validateForm(inputName: string = 'name') {
    const nameControl = this.form.get(inputName);
    if (nameControl) {
      // console.log('entro1' + nameControl.touched + nameControl.valid);

      if (nameControl.touched && !nameControl.valid) {
        return true;
      }

    } return false;
  }

  clearForm() {
    this.form.reset();
    this.oauthUser = null;
  }

  isDisabled() {
    return !(this.oauthUser || !(this.form.get('name')?.value === null || this.form.get('name')?.value === '' || this.form.get('name')?.value === undefined) || !(this.form.get('email')?.value === null || this.form.get('email')?.value === '' || this.form.get('email')?.value === undefined));
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      let token = null;
      if (this.oauthUser && this.oauthUser.idToken) {
        token = this.oauthUser.idToken;
      }
      this.auth.register(this.form.value, token).then((response) => {
        if (response.ok) {
          this.router.navigate(['/pomodoro']);

        } else {
          swal.fire({
            title: 'Error',
            text: response.message,
            icon: 'error'
          });
        }
      }).catch((error) => {

        swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error'
        }).then(() => {
          this.clearForm();
        });
      });
    }
  }
}
