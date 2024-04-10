import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JueguitoRoutingModule } from './jueguito-routing.module';
import { JueguitoComponent } from './jueguito.component';


@NgModule({
  declarations: [JueguitoComponent],
  imports: [
    CommonModule,
    JueguitoRoutingModule
  ],exports: [JueguitoComponent]
})
export class JueguitoModule { }
