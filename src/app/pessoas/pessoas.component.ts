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
  templateUrl: './pessoas.component.html',
  styleUrl: './pessoas.component.scss'
})
export class PessoasComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ){}

  exibirEmGrade: boolean = true;
  colunasTable: string[] = ["id", "nome",  "sexta", "sabado", "domingo"];
  
  alternarExibicao(event: MatButtonToggleChange) {
    this.exibirEmGrade = !this.exibirEmGrade
  }

  cards = [
    { id: 1, nome: 'Carlos Eduardo Ramos', sexta: true, sabado: false, domingo: false},
    { id: 2, nome: 'Eloá da Silva', sexta: true, sabado: true, domingo: false},
    { id: 3, nome: 'Gustavo Vieira de Matos', sexta: false, sabado: false, domingo: false},
    { id: 4, nome: 'Daniela Malu da Cruz', sexta: true, sabado: false, domingo: true},
    { id: 5, nome: 'Marcus Vinicius Sales', sexta: true, sabado: true, domingo: false},
    { id: 6, nome: 'Priscila Naomi Saito', sexta: false, sabado: false, domingo: false},
    { id: 7, nome: 'Márcia Figueiredo', sexta: true, sabado: true, domingo: false},
    { id: 8, nome: 'Joana Gonçalves', sexta: false, sabado: false, domingo: false},
    { id: 9, nome: 'Ana Paula Nogueira', sexta: true, sabado: true, domingo: false},
    { id: 10, nome: 'Maria das Dores Rodrigues', sexta: false, sabado: true, domingo: true},
    { id: 11, nome: 'Vicente Samuel da Mata', sexta: false, sabado: false, domingo: true},
    { id: 12, nome: 'Rosa Cristiane Aragão', sexta: true, sabado: true, domingo: false},
    { id: 13, nome: 'João Henrique Fogaça', sexta: false, sabado: true, domingo: false},
    { id: 14, nome: 'Bruno Ribeiro', sexta: true, sabado: false, domingo: true},
    { id: 15, nome: 'Nair Rodrigues', sexta: true, sabado: false, domingo: true},
    { id: 16, nome: 'Flávia Freitas', sexta: false, sabado: true, domingo: false},
    { id: 17, nome: 'Elisa Pires', sexta: false, sabado: false, domingo: true},
    { id: 18, nome: 'Tatiane Drumond', sexta: false, sabado: true, domingo: false},
  ];

}
