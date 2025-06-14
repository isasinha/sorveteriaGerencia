import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BarracaService } from './barraca.service';
import { BarracaModel } from './barraca.model';

@Component({
  selector: 'app-barracas',
  imports: [MatCardModule, 
            MatGridListModule, 
            CommonModule, 
            FlexLayoutModule, 
            MatIconModule, 
            MatButtonModule, 
            RouterLink,
          ],
  templateUrl: './barracas.component.html',
  styleUrl: './barracas.component.scss'
})
export class BarracasComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myService: BarracaService
  ){

   }
   

  cards = [
    { nome: 'Açaí'},
    { nome: 'Casquinha'},
    { nome: 'Coxinha'},
    { nome: 'Carrinhos'},
    { nome: 'Taça de frutas vermelhas'}
  ];

}
