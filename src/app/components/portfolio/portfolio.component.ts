import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  isSectionActive = false;

  constructor() { console.log('PortfolioComponent'); }
  
  ngOnInit(): void {
    this.isSectionActive = true;
  }
  
}
