import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSectionActive = false;
  ngOnInit() {
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
  }
}
