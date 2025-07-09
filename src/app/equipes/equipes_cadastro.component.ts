import { Component, inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'
import { EquipeModel, FuncaoModel } from './equipe.model';
import { EquipeService } from './equipe.service'; 
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-equipes_cadastro',
  imports: [ 
            RouterLink,
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule,
          ],
  templateUrl: './equipes_cadastro.component.html',
  styleUrl: './equipes_cadastro.component.scss'
})
export class Equipes_CadastroComponent implements OnInit{

  equipe: EquipeModel = {
    idEquipe: 0,
    nome: '',
  };
  funcao: FuncaoModel = {
    idFuncao: 0,
    nome: '',
  };
  tipo: string | null = null;
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
    private equipeService: EquipeService,
    private route: ActivatedRoute,
    private router: Router,
    //private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tipo = this.route.snapshot.paramMap.get('tipo');
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;    
    if (this.atualizando && this.firebaseId) {
      if(this.tipo == 'Equipe'){
        this.equipeService.buscarEquipePorId(this.firebaseId).subscribe({
          next: (res) => {
            this.equipe = res;
          },
          error: (err) => {
            console.error('Erro ao buscar equipe: ', err);
          }
        });
      }
      if(this.tipo == 'Função'){
        this.equipeService.buscarFuncaoPorId(this.firebaseId).subscribe({
          next: (res) => {
            this.funcao = res;
          },
          error: (err) => {
            console.error('Erro ao buscar função: ', err);
          }
        });
      }
    }
    else {
      this.gerarId();
    }
  }

  async salvar() {
    if(this.tipo=='Equipe'){
      if (this.atualizando && this.firebaseId) {
        this.equipeService.alterarEquipe(this.equipe, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Equipe atualizada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/equipes']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
      } else {
        this.equipeService.salvarEquipe(this.equipe)
        .then(() => {
          this.mostrarMensagem('Equipe cadastrada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/equipes']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
      }
    } else if(this.tipo=='Função'){
      if (this.atualizando && this.firebaseId) {
        this.equipeService.alterarFuncao(this.funcao, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Função atualizada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/equipes']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
      } else {
        this.equipeService.salvarFuncao(this.funcao)
        .then(() => {
          this.mostrarMensagem('Função cadastrada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/equipes']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
      }
    }

  }

  async gerarId(){
    if(this.tipo == "Equipe"){
      try{
        const proximoId = await this.equipeService.gerarProximoIdEquipe()
        this.equipe.idEquipe = proximoId;
      } catch (error){
        console.error('Erro ao gerar ID: ', error)
      }
    }
    if(this.tipo == "Função"){
      try{
        const proximoId = await this.equipeService.gerarProximoIdFuncao()
        this.funcao.idFuncao = proximoId;
      } catch (error){
        console.error('Erro ao gerar ID: ', error)
      }
    }
  }  

  excluir() {
    if (this.firebaseId) {
      if(this.tipo == 'Equipe'){
        this.equipeService.deletarEquipe(this.firebaseId)
          .then(() => {
            this.mostrarMensagem('Equipe excluída com sucesso!');
            //await new Promise(f => setTimeout(f, 1000));
            this.router.navigate(['/equipes']);
          })
          .catch(err => {
            console.error('Erro ao excluir: ', err);
          });
      }
      if(this.tipo == 'Função'){
        this.equipeService.deletarFuncao(this.firebaseId)
          .then(() => {
            this.mostrarMensagem('Função excluída com sucesso!');
            //await new Promise(f => setTimeout(f, 1000));
            this.router.navigate(['/equipes']);
          })
          .catch(err => {
            console.error('Erro ao excluir: ', err);
          });
      }
    }
  }
  
  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
}
