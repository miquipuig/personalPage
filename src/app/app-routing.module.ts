import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
