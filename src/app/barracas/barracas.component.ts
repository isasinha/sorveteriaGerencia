import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BarracaService } from './barraca.service';

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
  providers: [BarracaService],
  templateUrl: './barracas.component.html',
  styleUrl: './barracas.component.scss'
})
export class BarracasComponent {
  dataSource: any;

  constructor(
    private barracaService: BarracaService,
    private route: ActivatedRoute,
    private router: Router,
  ){}   

  cards: any

  ngOnInit(){
    this.barracaService.listar()
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
