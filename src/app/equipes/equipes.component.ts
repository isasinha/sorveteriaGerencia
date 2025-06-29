import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EquipeService } from './equipe.service';

@Component({
  selector: 'app-equipes',
  imports: [MatCardModule, 
            MatGridListModule, 
            CommonModule, 
            FlexLayoutModule, 
            MatIconModule, 
            MatButtonModule, 
            RouterLink
          ],
  providers: [EquipeService],          
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.scss'
})
export class EquipesComponent {
  
  constructor(
    private equipeService: EquipeService,
    private route: ActivatedRoute,
    private router: Router,
  ){}   

  cards: any

  ngOnInit(){
    this.equipeService.listar()
      .subscribe({
        next: (response) => {
          this.cards = response;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

}
