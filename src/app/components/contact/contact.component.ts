import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit{
  form = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl(''),
    message: new FormControl('')
  });
  emailLoading=false;
  emailSent=false;
  emailError=false;
  emailError2=false;
  isSectionActive=false;
  
  constructor(private http:HttpClient) {}

  ngOnInit() {
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
  }

  info() {
    this.emailLoading = true;
    if (this.form.controls.email.valid && this.form.controls.name.valid &&( this.form.controls.message.valid || this.form.controls.subject.valid)) {
      this.http.post('api/info', this.form.value).subscribe(
        response => {
          console.log(response);
          this.emailLoading = false;
          this.emailSent=true;
          this.emailError2 = false;
          this.emailError = false;
        },
        error => {
          console.log(error);
          this.emailError2 = false;
          this.emailError = true;
          this.emailLoading = false;
        }
      );
    } else {
      console.log('formulario no valido')
      this.emailError2 = true;
      this.emailLoading = false;
    }
  }
}
