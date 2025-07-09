import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PessoaService } from './pessoa.service';

@Component({
  selector: 'app-pessoas',
  imports: [CommonModule, 
            MatCardModule, 
            MatGridListModule, 
            FlexLayoutModule, 
            MatIconModule, 
            MatButtonModule,
            MatTableModule,
            MatButtonToggleModule,
            RouterLink
          ],
  providers:[PessoaService],          
  templateUrl: './pessoas.component.html',
  styleUrl: './pessoas.component.scss'
})
export class PessoasComponent {

  constructor(
    private pessoaService: PessoaService,    
    private route: ActivatedRoute,
    private router: Router
  ){}

  cards: any
  exibirEmGrade: boolean = true;
  colunasTable: string[] = ["idPessoa", "nome",  "sexta", "sabado", "domingo"];
    
  ngOnInit(){
    this.pessoaService.listarPessoas()
    .subscribe({
      next: (response) => {
        this.cards = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
  async alternarExibicao(event: MatButtonToggleChange) {
    this.exibirEmGrade = !this.exibirEmGrade   
  }
  
}

