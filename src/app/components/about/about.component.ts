import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScriptService } from 'src/app/services/script.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit{
  constructor(private scriptService: ScriptService) { 


       
  }
  isSectionActive=false;
  ngOnInit() {
    // temporizador que se espera 0.5 segundos y setea la variable isSectionActive a true``
    setTimeout(() => {
      this.isSectionActive = true;
    }, 50);
    this.scriptService.loadScript('skillsAnimation',true).then().catch(console.error);
  }
}
