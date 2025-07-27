import { Routes, ExtraOptions } from '@angular/router';
import { authGuard } from './login/auth.guard';
import { DiaDaFestaComponent } from './dia-da-festa/dia-da-festa.component';
import { DiaDaFesta_CadastroComponent } from './dia-da-festa/dia-da-festa_cadastro.component';
//import { LoginComponent } from './login/login.component';
import { PessoasComponent } from './pessoas/pessoas.component';
import { Pessoas_CadastroComponent } from './pessoas/pessoas_cadastro.component';
import { Pessoas_DetalheComponent } from './pessoas/pessoas_detalhe.component';
import { Pessoas_ImprimirCrachaComponent } from './pessoas/pessoas_imprimir-cracha.component';
import { Pessoas_ImprimirListaComponent } from './pessoas/pessoas_imprimir-lista.component';
import { UtensiliosComponent } from './utensilios/utensilios.component';
import { Utensilios_CadastroComponent } from './utensilios/utensilios_cadastro.component';
import { Utensilios_DetalheComponent } from './utensilios/utensilios_detalhe.component';
import { BarracasComponent } from './barracas/barracas.component';
import { Barracas_CadastroComponent } from './barracas/barracas_cadastro.component';
import { Barracas_DetalheComponent } from './barracas/barracas_detalhe.component';
import { EquipesComponent } from './equipes/equipes.component';
import { Equipes_CadastroComponent } from './equipes/equipes_cadastro.component';
import { Equipes_DetalheComponent } from './equipes/equipes_detalhe.component';

export const routes: Routes = [
    {path:'', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
    // {path: '', redirectTo: 'login', pathMatch: 'full' },
    // {path:'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
    {path:'diadafesta', canActivate:[authGuard], component: DiaDaFestaComponent },
    {path:'diadafesta_cadastro', canActivate:[authGuard],component: DiaDaFesta_CadastroComponent },
    {path:'diadafesta_cadastro/:firebaseId', canActivate:[authGuard], component: DiaDaFesta_CadastroComponent },
    {path:'pessoas', canActivate:[authGuard], component: PessoasComponent },
    {path:'pessoas_cadastro', canActivate:[authGuard], component: Pessoas_CadastroComponent },
    {path:'pessoas_cadastro/:firebaseId', canActivate:[authGuard], component: Pessoas_CadastroComponent },
    {path:'pessoas_detalhe/:firebaseId', canActivate:[authGuard], component: Pessoas_DetalheComponent },
    {path:'pessoas_imprimircracha/:firebaseId', canActivate:[authGuard], component: Pessoas_ImprimirCrachaComponent },
    {path:'pessoas_imprimirlista', canActivate:[authGuard], component: Pessoas_ImprimirListaComponent },
    {path:'equipes', canActivate:[authGuard], component: EquipesComponent },
    {path:'equipes_cadastro/:tipo', canActivate:[authGuard], component: Equipes_CadastroComponent },
    {path:'equipes_cadastro/:tipo/:firebaseId', canActivate:[authGuard], component: Equipes_CadastroComponent },
    //{path:'equipes_detalhe/:firebaseId/:tipo', canActivate:[authGuard], component: Equipes_DetalheComponent },
    {path:'utensilios', canActivate:[authGuard], component: UtensiliosComponent },
    {path:'utensilios_cadastro', canActivate:[authGuard], component: Utensilios_CadastroComponent },
    {path:'utensilios_cadastro/:firebaseId', canActivate:[authGuard], component: Utensilios_CadastroComponent },
    {path:'utensilios_detalhe/:firebaseId', canActivate:[authGuard], component: Utensilios_DetalheComponent },
    {path:'barracas', canActivate:[authGuard], component: BarracasComponent },
    {path:'barracas_cadastro', canActivate:[authGuard], component: Barracas_CadastroComponent },
    {path:'barracas_cadastro/:firebaseId', canActivate:[authGuard], component: Barracas_CadastroComponent },
    {path:'barracas_detalhe/:firebaseId', canActivate:[authGuard], component: Barracas_DetalheComponent },
];



