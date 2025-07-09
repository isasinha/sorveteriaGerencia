import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DiaDaFestaModel } from './dia-da-festa.model';
import { DiaDaFestaService } from './dia-da-festa.service';
import { EquipeModel, FuncaoModel } from '../equipes/equipe.model';
import { EquipeService } from '../equipes/equipe.service';

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
    private diaDaFestaService: DiaDaFestaService,
    private equipeService: EquipeService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  datas: DiaDaFestaModel[] = []
  equipes: EquipeModel[] = []
  funcoes: FuncaoModel[] = []
  firebaseId: string | null = ""

  ngOnInit(){
    this.diaDaFestaService.listar()
      .subscribe({
        next: (response) => {
          this.datas = response;
        },
        error: (err) => {
          console.error(err);
        }
      });
    this.equipeService.listarEquipes()
      .subscribe({
        next: (response) => {
          this.equipes = response;
        },
        error: (err) => {
          console.error(err);
        }
    });
    this.equipeService.listarFuncoes()
      .subscribe({
        next: (response) => {
          this.funcoes = response;
        },
        error: (err) => {
          console.error(err);
        }
    });
  }

  selecionarData(event: MatSelectChange){
    const dataSelecionada = event.value;
    const diaDaFestaSelecionado = this.datas.find(data => data.dia === dataSelecionada)
    this.firebaseId = diaDaFestaSelecionado?.firebaseId ?? '';
  }

  alterarDiadaFesta(){
    this.router.navigate(['diadafesta_cadastro/', this.firebaseId]);
  }
}
