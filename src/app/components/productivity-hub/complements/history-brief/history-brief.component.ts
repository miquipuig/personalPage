import { Component } from '@angular/core';
import { HistoryService } from 'src/app/services/productivity-hub/history.service';

@Component({
  selector: 'app-history-brief',
  templateUrl: './history-brief.component.html',
  styleUrls: ['./history-brief.component.css']
})
export class HistoryBriefComponent {


  constructor(public history: HistoryService) {
  }
  ngOnInit() {
    
  }


}
