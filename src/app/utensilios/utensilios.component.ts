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


@Component({
  selector: 'app-utensilios',
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
  templateUrl: './utensilios.component.html',
  styleUrl: './utensilios.component.scss'
})
export class UtensiliosComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ){}

  exibirEmGrade: boolean = true;
  colunasTable: string[] = ["id", "nome",  "marca", "quantidade"];
  
  alternarExibicao(event: MatButtonToggleChange) {
    this.exibirEmGrade = !this.exibirEmGrade
  }
  
  cards = [
    { id: 1, nome: 'Avental', marca: "Arcomed", quantidade: 200},
    { id: 2, nome: 'Luva', marca: "Arcomed", quantidade: 500},
    { id: 3, nome: 'Touca', marca: "Arcomed", quantidade: 200},
    { id: 4, nome: 'Liquidificador', marca: "Walita", quantidade: 5},
    { id: 5, nome: 'Batedeira', marca: "Black&Decker", quantidade: 3},
    { id: 6, nome: 'Carrinho', marca: "Thermototal", quantidade: 30},
    { id: 7, nome: 'Crachá', marca: "N/A", quantidade: 200},
    { id: 8, nome: 'Colher', marca: "Tramontina", quantidade: 100},
    { id: 9, nome: 'Faca', marca: "Tramontina", quantidade: 50},
    { id: 10, nome: 'Garfo', marca: "Tramontina", quantidade: 50},
    { id: 11, nome: 'Caixa registradora', marca: "Quantun", quantidade: 3},
    { id: 12, nome: 'Porta guardanapo', marca: "Premisse", quantidade: 15},
    { id: 13, nome: 'Pote', marca: "Tuppeware", quantidade: 22},
    { id: 14, nome: 'Escumadeira', marca: "Tramontina", quantidade: 10},
    { id: 15, nome: 'Pegador de sorvete', marca: "Tramontina", quantidade: 10}
  ];
}
