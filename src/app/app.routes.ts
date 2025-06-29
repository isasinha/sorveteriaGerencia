import { Routes } from '@angular/router';
import { DiaDaFestaComponent } from './dia-da-festa/dia-da-festa.component';
import { DiaDaFesta_CadastroComponent } from './dia-da-festa/dia-da-festa_cadastro.component';
import { LoginComponent } from './login/login.component';
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
    {path:'', component: LoginComponent },
    {path:'diadafesta', component: DiaDaFestaComponent },
    {path:'diadafesta_cadastro', component: DiaDaFesta_CadastroComponent },
    {path:'diadafesta_cadastro/:firebaseId', component: DiaDaFesta_CadastroComponent },
    {path:'pessoas', component: PessoasComponent },
    {path:'pessoas_cadastro', component: Pessoas_CadastroComponent },
    {path:'pessoas_cadastro/:firebaseId', component: Pessoas_CadastroComponent },
    {path:'pessoas_detalhe/:firebaseId', component: Pessoas_DetalheComponent },
    {path:'pessoas_imprimircracha', component: Pessoas_ImprimirCrachaComponent },
    {path:'pessoas_imprimirlista', component: Pessoas_ImprimirListaComponent },
    {path:'equipes', component: EquipesComponent },
    {path:'equipes_cadastro', component: Equipes_CadastroComponent },
    {path:'equipes_cadastro/:firebaseId', component: Equipes_CadastroComponent },
    {path:'equipes_detalhe/:firebaseId', component: Equipes_DetalheComponent },
    {path:'utensilios', component: UtensiliosComponent },
    {path:'utensilios_cadastro', component: Utensilios_CadastroComponent },
    {path:'utensilios_cadastro/:firebaseId', component: Utensilios_CadastroComponent },
    {path:'utensilios_detalhe/:firebaseId', component: Utensilios_DetalheComponent },
    {path:'barracas', component: BarracasComponent },
    {path:'barracas_cadastro', component: Barracas_CadastroComponent },
    {path:'barracas_cadastro/:firebaseId', component: Barracas_CadastroComponent },
    {path:'barracas_detalhe/:firebaseId', component: Barracas_DetalheComponent },
];
