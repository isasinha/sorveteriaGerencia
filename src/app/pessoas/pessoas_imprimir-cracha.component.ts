import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { PessoaModel } from './pessoa.model';
import { PessoaService } from './pessoa.service';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-pessoas_imprimir-cracha',
  imports: [
            CommonModule,
            FlexLayoutModule,
            MatCardModule, 
            MatIconModule,
            MatButtonModule,
            MatGridListModule,
            MatListModule,
            MatButtonToggleModule,
            QRCodeComponent,
            RouterLink
          ],
  templateUrl: './pessoas_imprimir-cracha.component.html',
  styleUrl: './pessoas_imprimir-cracha.component.scss'
})
export class Pessoas_ImprimirCrachaComponent implements OnInit{

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    this.mostrarBotaoTopo = scrollTop > 300;
    this.mostrarBotaoFinal = scrollTop + windowHeight < docHeight - 100;
  }

  pessoa: PessoaModel = {
    idPessoa: 0,
    idEquipe: 0,
    nome: '',
    data_nascimento: '',
    idade: 0,
    telefone_res: '',
    telefone_cel: '',
    telefone_rec: '',
    email: '',
    comentarios: '',
  };
  firebaseIdPessoa: string | null = null;
  urlPagina: string = '';
  varios: boolean = false;
  horizontal: boolean = false;
  cards: any[] = [];
  cardTemp: any[] = [];
  mostrarBotaoTopo: boolean = false;
  mostrarBotaoFinal: boolean = true; 


  constructor(
            private pessoaService: PessoaService,
            private route: ActivatedRoute,
            private router: Router
          ) {}

  ngOnInit(): void {
    this.firebaseIdPessoa = this.route.snapshot.paramMap.get('firebaseId');
    
    if (this.firebaseIdPessoa) {
      this.urlPagina = `https://sorveteria-perseveranca.web.app/pessoas_detalhe/${this.firebaseIdPessoa}`;
      this.pessoaService.buscarPorIdPessoa(this.firebaseIdPessoa).subscribe({
        next: (res) => {
          this.pessoa = res;          
        },
        error: (err) => {
          console.error('Erro ao buscar pessoa ou equipe: ', err);
        }
      });
    }
    else{
      this.varios = true;
      this.pessoaService.listarPessoas()
      .subscribe({
        next: (response) => {
          this.cards = response.map(pessoa => ({
            ...pessoa,
            urlPagina: `https://sorveteria-perseveranca.web.app/pessoas_detalhe/${pessoa.firebaseId}`
          }));
          //this.cardTemp = this.cards.slice(0,12)
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  async alternarExibicao(event: MatButtonToggleChange) {
    this.horizontal = event.value === 'horizontal';   
  }

  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

imprimirCracha(): void {
  const style = document.createElement('style');
  style.setAttribute('id', 'print-orientation');
  style.innerHTML = `
    @page {
      size: ${this.horizontal ? 'A4 landscape' : 'A4 portrait'};
      margin: 5mm;
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    window.print();
    document.getElementById('print-orientation')?.remove();
  }, 100);
}

}
