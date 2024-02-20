import { Component, OnInit } from '@angular/core';
import { ScriptService } from 'src/app/services/script.service';

@Component({
  selector: 'app-jueguito',
  templateUrl: './jueguito.component.html',
  styleUrls: ['./jueguito.component.css']
})
export class JueguitoComponent implements OnInit {
  isSectionActive=false;
  constructor(private ss:ScriptService) { }

  ngOnInit() {
    console.log('jueguito.component.ts');
    this.isSectionActive=true;
    this.ss.loadScript('jueguito',true).then(console.log).catch(error => console.log(error));
    // Aquí puedes poner tu lógica para cuando el componente se inicializa
  }

}