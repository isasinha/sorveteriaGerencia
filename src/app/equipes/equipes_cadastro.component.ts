import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'
import { EquipeModel } from './equipe.model';
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
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
    private equipeService: EquipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;    
    if (this.atualizando && this.firebaseId) {
      this.equipeService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.equipe = res;
        },
        error: (err) => {
          console.error('Erro ao buscar equipe: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
  }

  salvar(): void {
    if (this.atualizando && this.firebaseId) {
      this.equipeService.alterar(this.equipe, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Equipe atualizada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/equipes']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
    } else {
      this.equipeService.salvar(this.equipe)
        .then(() => {
          this.mostrarMensagem('Equipe cadastrada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/equipes']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
    }
  }

  alterarFoto(event: Event) {
    //event.preventDefault();    
  }

  async gerarId(){
    try{
      const proximoId = await this.equipeService.gerarProximoId()
      this.equipe.idEquipe = proximoId;
    } catch (error){
      console.error('Erro ao gerar ID: ', error)
    }
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }

}
