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
import { UtensilioService } from './utensilio.service';


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
  providers:[UtensilioService],
  templateUrl: './utensilios.component.html',
  styleUrl: './utensilios.component.scss'
})
export class UtensiliosComponent {

  constructor(
    private utensilioService: UtensilioService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  cards: any
  exibirEmGrade: boolean = true;
  colunasTable: string[] = ["idUtensilio", "nome",  "marca", "quantidade"];
    
  ngOnInit(){
    this.utensilioService.listar()
    .subscribe({
      next: (response) => {
        this.cards = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
  alternarExibicao(event: MatButtonToggleChange) {
    this.exibirEmGrade = !this.exibirEmGrade
  }
}

