import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EquipeService } from './equipe.service';

@Component({
  selector: 'app-equipes',
  imports: [MatCardModule, 
            MatGridListModule, 
            MatTableModule,
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

  equipes: any
  funcoes: any
  colunasTable: string[] = ["nome"];

  ngOnInit(){
    this.equipeService.listarEquipes()
      .subscribe({
        next: lista => {
          this.equipes = lista.sort((a, b) => {
            if (a.idEquipe === 1) return 1;
            if (b.idEquipe === 1) return -1;
            return a.idEquipe - b.idEquipe;
          }),
          this.equipes = lista.filter(lista => lista.nome !== 'Temporariamente sem equipe')
        },
        error: (err) => {
          console.error(err);
        }
      });
    this.equipeService.listarFuncoes()
      .subscribe({
        next: lista => {
          this.funcoes = lista.sort((a, b) => {
            if (a.idFuncao === 1) return 1;
            if (b.idFuncao === 1) return -1;
            return a.idFuncao - b.idFuncao;
          })
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

}
