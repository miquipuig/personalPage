import { Component, EventEmitter, Output } from '@angular/core';
import { LocalService } from 'src/app/services/productivity-hub/local.service';

@Component({
  selector: 'app-filter-buttons',
  templateUrl: './filter-buttons.component.html',
  styleUrls: ['./filter-buttons.component.css']
})
export class FilterButtonsComponent {
  constructor(public local: LocalService) { }
  @Output() filterSearchEmitter = new EventEmitter<any>();


  filterSearch() {
    this.local.saveClock();
    this.filterSearchEmitter.emit();
  }


  filterSegment(){
    this.local.clock.filteredAllSegments = !this.local.clock.filteredAllSegments;

    if(this.local.clock.filteredAllSegments){
      this.local.clock.orderedView = false; 
    }

    this.filterSearch();
  }

  filterOrderedView(){
    this.local.clock.orderedView = !this.local.clock.orderedView;
    if(this.local.clock.orderedView){
      this.local.clock.filteredAllSegments = false; 
    }
    this.filterSearch();
  }
}
