import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dia-da-festa',
  imports: [CommonModule,
            FlexLayoutModule, 
            MatCardModule,     
            MatGridListModule, 
            MatIconModule, 
            MatButtonModule, 
            MatInputModule,
            MatSelectModule,
            MatFormFieldModule,
            RouterLink
          ],
  templateUrl: './dia-da-festa.component.html',
  styleUrl: './dia-da-festa.component.scss'
})
export class DiaDaFestaComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ){}
  
  datas=[
        {data: '29/08/2025'},
        {data: '30/08/2025'},
        {data: '31/08/2025'}
      ]

  barracas=[
    { nome: 'Açaí'},
    { nome: 'Casquinha'},
    { nome: 'Coxinha'},
    { nome: 'Carrinhos'},
    { nome: 'Taça de frutas vermelhas'}
    ]
  }
