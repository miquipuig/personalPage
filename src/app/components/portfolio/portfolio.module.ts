import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfolioRoutingModule } from './portfolio-routing.module';
import { PortfolioComponent } from './portfolio.component';


@NgModule({
  declarations: [PortfolioComponent],
  imports: [
    CommonModule,
    PortfolioRoutingModule
  ],exports: [PortfolioComponent]
})
export class PortfolioModule { }
