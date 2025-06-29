import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaService } from './pessoa.service';
import { PessoaModel } from './pessoa.model';
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
  selector: 'app-pessoas_detalhe',
  imports: [RouterLink,
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
  templateUrl: './pessoas_detalhe.component.html',
  styleUrl: './pessoas_detalhe.component.scss'
})
export class Pessoas_DetalheComponent implements OnInit{

  
    pessoa: PessoaModel = {
    idPessoa: 0,
    nome: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    endereco_logradouro: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cep: '',
    endereco_cidade: '',
    endereco_uf: ''
    };
  
    firebaseId: string | null = null;
    snack: MatSnackBar = inject(MatSnackBar);
  
    constructor(
                private pessoaService: PessoaService,
                private route: ActivatedRoute,
                private router: Router
              ) { }
  
    ngOnInit(): void {
      this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
      console.log("passei aqui", this.firebaseId)
      if (this.firebaseId) {
        this.pessoaService.buscarPorId(this.firebaseId).subscribe({
          next: (res) => {
            this.pessoa = res;
          },
          error: (err) => {
            console.error('Erro ao buscar utensílio: ', err);
          }
        });
      }
    }
  
    excluir() {
      if (this.firebaseId) {
        this.pessoaService.deletar(this.firebaseId)
          .then(() => {
            this.mostrarMensagem('Pessoa excluído com sucesso!');
            //await new Promise(f => setTimeout(f, 1000));
            this.router.navigate(['/pessoas']);
          })
          .catch(err => {
            console.error('Erro ao excluir: ', err);
          });
      }
    }
  
    mostrarMensagem(mensagem: string){
      this.snack.open(mensagem, "Ok", {duration: 2000});
    }
  
  }
  
