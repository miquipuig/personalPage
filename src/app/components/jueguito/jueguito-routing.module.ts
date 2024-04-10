import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JueguitoComponent } from './jueguito.component';

const routes: Routes = [{
  path: '',
  component: JueguitoComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JueguitoRoutingModule { }
