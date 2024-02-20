import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css']
})
export class ResumeComponent implements OnInit {
  constructor() { }
  isSectionActive=false;
  ngOnInit() {
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
  }
}
