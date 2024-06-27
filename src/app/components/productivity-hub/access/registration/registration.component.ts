import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { count } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
form: FormGroup;
  constructor() { 

    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('', Validators.required),
    });
  }

  isSectionActive = false;
  ngOnInit() {
    setTimeout(() => {
      this.isSectionActive = true;
    }, 100);
  }

  validateForm() {
    const nameControl = this.form.get('name');
    if (nameControl) {
      // console.log('entro1' + nameControl.touched + nameControl.valid);

      if (nameControl.touched && !nameControl.valid) {
        return true;
      }

    } return false;
  }
  onSubmit() {
    console.log(this.form.value);
  }
}
