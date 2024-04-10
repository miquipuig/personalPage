import { Component, EventEmitter, OnInit, Output, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ScriptService } from 'src/app/services/script.service';

@Component({
  selector: 'app-jueguito',
  templateUrl: './jueguito.component.html',
  styleUrls: ['./jueguito.component.css']
})
export class JueguitoComponent implements OnInit {
  // @Output() onClose = new EventEmitter<void>();
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeJueguito();
    }
  }
  isSectionActive = false;
  constructor(private ss: ScriptService, private router: Router) { }


  ngOnInit() {
    console.log('jueguito.component.ts');
    this.isSectionActive = true;
    this.ss.loadScript('jueguito', true).then(console.log).catch(error => console.log(error));
    // Aquí puedes poner tu lógica para cuando el componente se inicializa
  }

  closeJueguito() {
    this.isSectionActive = false;
    // this.onClose.emit();
    this.ss.unloadScript('jueguito').then(console.log).catch(error => console.log(error));
    //Ir a la página principal
    this.router.navigate(['/']);

  }

}