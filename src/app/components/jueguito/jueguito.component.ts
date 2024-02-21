import { Component, EventEmitter, OnInit, Output,HostListener } from '@angular/core';
import { ScriptService } from 'src/app/services/script.service';

@Component({
  selector: 'app-jueguito',
  templateUrl: './jueguito.component.html',
  styleUrls: ['./jueguito.component.css']
})
export class JueguitoComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.key === 'Escape') {
this.closeJueguito();    }
  }
  isSectionActive=false;
  constructor(private ss:ScriptService) { }

  ngOnInit() {
    console.log('jueguito.component.ts');
    this.isSectionActive=true;
    this.ss.loadScript('jueguito',true).then(console.log).catch(error => console.log(error));
    // Aquí puedes poner tu lógica para cuando el componente se inicializa
  }

  closeJueguito(){
    this.isSectionActive=false;
    this.onClose.emit();
  }

}