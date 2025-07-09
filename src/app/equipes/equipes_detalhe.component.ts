import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipeService } from './equipe.service';
import { EquipeModel, FuncaoModel } from './equipe.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-equipes_detalhe',
  imports: [ 
            //RouterLink,
            CommonModule,
            FlexLayoutModule, 
            MatCardModule, 
            MatIconModule,
            MatButtonModule,
            MatInputModule,
            FormsModule,
            MatSelectModule,
            MatListModule
          ],
  templateUrl: './equipes_detalhe.component.html',
  styleUrl: './equipes_detalhe.component.scss'
})
export class Equipes_DetalheComponent implements OnInit {

  // equipe: EquipeModel = {
  //   idEquipe: 0,
  //   nome: '',
  // };
  // funcao: FuncaoModel = {
  //   idFuncao: 0,
  //   nome: '',
  // };
  // firebaseId: string | null = null;
  // tipo: string | null = null;
  // snack: MatSnackBar = inject(MatSnackBar);

  constructor(
              // private equipeService: EquipeService,
              // private route: ActivatedRoute,
              // private router: Router
            ) { }

  ngOnInit(): void {
  //   this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
  //   this.tipo = this.route.snapshot.paramMap.get('tipo');
  //   if (this.firebaseId ) {
  //     if(this.tipo == 'equipe'){
  //       this.equipeService.buscarEquipePorId(this.firebaseId).subscribe({
  //         next: (res) => {
  //           this.equipe = res;
  //         },
  //         error: (err) => {
  //           console.error('Erro ao buscar equipe: ', err);
  //         }
  //       });
  //     }
  //     if(this.tipo == 'funcao'){
  //       this.equipeService.buscarFuncaoPorId(this.firebaseId).subscribe({
  //         next: (res) => {
  //           this.funcao = res;
  //         },
  //         error: (err) => {
  //           console.error('Erro ao buscar função: ', err);
  //         }
  //       });
  //     }
  //   }
 }

  // excluir() {
  //   if (this.firebaseId) {
  //     if(this.tipo == 'equipe'){
  //       this.equipeService.deletarEquipe(this.firebaseId)
  //         .then(() => {
  //           this.mostrarMensagem('Equipe excluída com sucesso!');
  //           //await new Promise(f => setTimeout(f, 1000));
  //           this.router.navigate(['/equipes']);
  //         })
  //         .catch(err => {
  //           console.error('Erro ao excluir: ', err);
  //         });
  //     }
  //     if(this.tipo == 'funcao'){
  //       this.equipeService.deletarFuncao(this.firebaseId)
  //         .then(() => {
  //           this.mostrarMensagem('Função excluída com sucesso!');
  //           //await new Promise(f => setTimeout(f, 1000));
  //           this.router.navigate(['/equipes']);
  //         })
  //         .catch(err => {
  //           console.error('Erro ao excluir: ', err);
  //         });
  //     }
  //   }
  // }

  // mostrarMensagem(mensagem: string){
  //   this.snack.open(mensagem, "Ok", {duration: 2000});
  // }

}
