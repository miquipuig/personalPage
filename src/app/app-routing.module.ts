import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmptyComponentComponent } from './components/empty-component/empty-component.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  // Tus otras rutas aquí...

 
  {
    path: 'contact',
    loadChildren: () => import('./components/contact/contact.module').then(m => m.ContactModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./components/about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'portfolio',
    loadChildren: () => import('./components/portfolio/portfolio.module').then(m => m.PortfolioModule)
  },
  {
    path: 'mickeyDino',
    loadChildren: () => import('./components/jueguito/jueguito.module').then(m => m.JueguitoModule)
  },
  {
    path: 'resume',
    loadChildren: () => import('./components/resume/resume.module').then(m => m.ResumeModule)
  },
  {
    path: 'pomodoro',
    loadChildren: () => import('./components/productivity-hub/productivity-hub.module').then(m => m.ProductivityHubModule)
  },
  // { path: '**',     loadChildren: () => import('./components/jueguito/jueguito.module').then(m => m.JueguitoModule)
  // }
  { path: '', component: EmptyComponentComponent },
  { path: '**', pathMatch: 'full', redirectTo: ''}

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: "ignore",
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
    scrollOffset: [0, 64] // [x, y]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
