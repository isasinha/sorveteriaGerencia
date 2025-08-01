import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PessoaService } from './pessoa.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-pessoas',
  imports: [CommonModule, 
            MatCardModule, 
            MatGridListModule, 
            FlexLayoutModule, 
            MatIconModule, 
            MatButtonModule,
            MatTableModule,
            MatFormFieldModule,
            MatInputModule,
            FormsModule,
            MatButtonToggleModule,
            RouterLink
          ],
  providers:[PessoaService],          
  templateUrl: './pessoas.component.html',
  styleUrl: './pessoas.component.scss'
})
export class PessoasComponent implements OnInit{

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    this.mostrarBotaoTopo = scrollTop > 300;
    this.mostrarBotaoFinal = scrollTop + windowHeight < docHeight - 100;
  }
  
  cards: any
  exibirEmGrade: boolean = true;
  colunasTable: string[] = ["idPessoa", "nome",  "sexta", "sabado", "domingo"];
  filtro: string = '';
  cardsOriginal: any[] = [];
  mostrarBotaoTopo: boolean = false;
  mostrarBotaoFinal: boolean = true; 

  constructor(
    private pessoaService: PessoaService,    
    private route: ActivatedRoute,
    private router: Router
  ){}
    
  ngOnInit(){
    this.pessoaService.listarPessoas()
    .subscribe({
      next: (response) => {
        this.cardsOriginal = response;
        this.cards = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  filtrarLista() {
    const termo = this.filtro.toLowerCase();
    this.cards = this.cardsOriginal.filter(card => {
      const nome = card.nome?.toLowerCase() ?? '';
      const id = String(card.idPessoa ?? '');
      return nome.includes(termo) || id.includes(termo);
    });
  }
  
  async alternarExibicao(event: MatButtonToggleChange) {
    this.exibirEmGrade = !this.exibirEmGrade   
  }

  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
}

