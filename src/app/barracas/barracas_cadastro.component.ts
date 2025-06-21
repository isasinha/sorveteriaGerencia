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
import { BarracaModel } from './barraca.model';
import { BarracaService } from './barraca.service'; 
import { RouterLink, ActivatedRoute, Router,  } from '@angular/router';

@Component({
  selector: 'app-barracas-cadastro',
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
  templateUrl: './barracas_cadastro.component.html',
  styleUrl: './barracas_cadastro.component.scss'
})
export class Barracas_CadastroComponent implements OnInit{

  barraca: BarracaModel = {
    idBarraca: 0,
    nome: '',
    localizacao: '',
  };
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
    private barracaService: BarracaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('idBarraca');
    this.atualizando = !!this.firebaseId;

    if (this.atualizando && this.firebaseId) {
      this.barracaService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.barraca = res;
        },
        error: (err) => {
          console.error('Erro ao buscar barraca: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
  }

  salvar(): void {
    if (this.atualizando && this.firebaseId) {
      this.barracaService.atualizar(this.barraca, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Barraca atualizada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/barracas']);
        })
        .catch(err => {
          console.error('Erro ao atualizar: ', err);
        });
    } else {
      this.barracaService.salvar(this.barraca)
        .then(() => {
          this.mostrarMensagem('Barraca cadastrada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/barracas']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
    }
  }

  alterarFoto(event: Event) {
    event.preventDefault();
    console.log('Cliquei em Alterar foto');
  }

  async gerarId(){
    try{
      const proximoId = await this.barracaService.gerarProximoId()
      this.barraca.idBarraca = proximoId;
    } catch (error){
      console.error('Erro ao gerar ID: ', error)
    }
  }

    mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
    }
  }
