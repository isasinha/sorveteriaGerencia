import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarracaService } from './barraca.service';
import { BarracaModel } from './barraca.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';


@Component({
  selector: 'app-barracas_detalhe',
  imports: [ 
            RouterLink,
            CommonModule,
            FlexLayoutModule, 
            MatCardModule, 
            MatIconModule,
            MatButtonModule,
            MatInputModule,
            FormsModule,
            MatSelectModule,
            MatListModule
          ],
  templateUrl: './barracas_detalhe.component.html',
  styleUrl: './barracas_detalhe.component.scss'
})

export class Barracas_DetalheComponent implements OnInit{

  barraca: BarracaModel = {
    idBarraca: 0,
    nome: '',
    localizacao: '',
  };
  firebaseId: string | null = null;
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
              private barracaService: BarracaService,
              private route: ActivatedRoute,
              private router: Router
            ) { }

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    if (this.firebaseId) {
      this.barracaService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.barraca = res;
        },
        error: (err) => {
          console.error('Erro ao buscar barraca: ', err);
        }
      });
    }
  }

  excluir() {
    if (this.firebaseId) {
      this.barracaService.deletar(this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Barraca excluída com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/barracas']);
        })
        .catch(err => {
          console.error('Erro ao excluir: ', err);
        });
    }
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }

}
