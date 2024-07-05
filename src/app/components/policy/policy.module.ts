import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PolicyRoutingModule } from './policy-routing.module';
import { PolicyComponent } from './policy.component';
import { MarkdownComponent } from '../shared/markdown/markdown.component';



@NgModule({
  declarations: [
    PolicyComponent, MarkdownComponent
  ],
  imports: [
    CommonModule,
    PolicyRoutingModule, 
  ],exports: [PolicyComponent]
})
export class PolicyModule { }
