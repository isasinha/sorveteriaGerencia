import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule,  } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'
import { DiaDaFestaModel } from './dia-da-festa.model';
import { DiaDaFestaService } from './dia-da-festa.service';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-dia-da-festa_cadastro',
  imports: [RouterLink,
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule,
            MatSelectModule
  ],
  templateUrl: './dia-da-festa_cadastro.component.html',
  styleUrl: './dia-da-festa_cadastro.component.scss'
})
export class DiaDaFesta_CadastroComponent implements OnInit{

  @ViewChild('inputImagem') inputImagem!: ElementRef<HTMLInputElement>;

  diaDaFesta: DiaDaFestaModel = {
    idDia: 0,
    dia: '',
    hora_inicio: new Date(),
    hora_fim: new Date(),
    dia_semana: '',
  };
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);
  diasSemana: string[] =['Sexta-feira', 'Sábado', 'Domingo'];

  constructor(
    private diaDaFestaService: DiaDaFestaService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;    
    if (this.atualizando && this.firebaseId) {
      this.diaDaFestaService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.diaDaFesta = res;
        },
        error: (err) => {
          console.error('Erro ao buscar dia da festa: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
  }

  salvar(): void {
    if (this.atualizando && this.firebaseId) {
      this.diaDaFestaService.alterar(this.diaDaFesta, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Dia da Festa atualizado com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/diadafesta']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
    } else {
      this.diaDaFestaService.salvar(this.diaDaFesta)
        .then(() => {
          this.mostrarMensagem('Dia da Festa cadastrado com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/diadafesta']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
    }
  }

    excluir() {
    if (this.firebaseId) {
      this.diaDaFestaService.deletar(this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Dia da Festa excluído com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/diadafesta']);
        })
        .catch(err => {
          console.error('Erro ao excluir: ', err);
        });
    }
  }
  
  async gerarId(){
    try{
      const proximoId = await this.diaDaFestaService.gerarProximoId()
      this.diaDaFesta.idDia = proximoId;
    } catch (error){
      console.error('Erro ao gerar ID: ', error)
    }
  }
  
  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }

}
