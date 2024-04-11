import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductivityHubRoutingModule } from './productivity-hub-routing.module';
import { ProductivityHubComponent } from './productivity-hub.component';


@NgModule({
  declarations: [ProductivityHubComponent],
  imports: [
    CommonModule,
    ProductivityHubRoutingModule
  ],exports: [ProductivityHubComponent]
})
export class ProductivityHubModule { 


}
