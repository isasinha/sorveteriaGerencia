// Baseado em: https://angular.dev/guide/routing
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'pessoas',
    loadComponent: () => import('./pessoas/pessoas.component').then(m => m.PessoasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pessoa/:id',
    loadComponent: () => import('./pessoas/pessoa-view/pessoa-view.component').then(m => m.PessoaViewComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cracha/:id',
    loadComponent: () => import('./pessoas/cracha/cracha.component').then(m => m.CrachaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'crachas',
    loadComponent: () => import('./pessoas/crachas-multiplos/crachas-multiplos.component').then(m => m.CrachasMultiplosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dia-da-festa',
    loadComponent: () => import('./dia-da-festa/dia-da-festa.component').then(m => m.DiaDaFestaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'equipes',
    loadComponent: () => import('./equipes/equipes.component').then(m => m.EquipesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'confirmacoes',
    loadComponent: () => import('./confirmacoes/confirmacoes.component').then(m => m.ConfirmacoesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tutorial',
    loadComponent: () => import('./tutorial/tutorial.component').then(m => m.TutorialComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
