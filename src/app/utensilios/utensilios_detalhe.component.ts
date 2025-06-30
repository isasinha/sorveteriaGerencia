import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtensilioService } from './utensilio.service';
import { UtensilioModel } from './utensilio.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatCheckbox } from '@angular/material/checkbox';


@Component({
  selector: 'app-utensilios_detalhe',
  imports: [ 
            RouterLink,
            CommonModule,
            FlexLayoutModule, 
            MatCardModule, 
            MatIconModule,
            MatTableModule,
            MatButtonModule,
            MatInputModule,
            FormsModule,
            MatSelectModule,
            MatListModule,
            MatCheckbox
          ],
  templateUrl: './utensilios_detalhe.component.html',
  styleUrl: './utensilios_detalhe.component.scss'
})

export class Utensilios_DetalheComponent implements OnInit{

  utensilio: UtensilioModel = {
    idUtensilio: 0,
    nome: '',
    marca: '',
    quantidade: 0,
    garantia: '',
    fonecedor: '',
    descartavel: false
  };

  firebaseId: string | null = null;
  snack: MatSnackBar = inject(MatSnackBar);
  colunasTable: string[] = ["pessoa", "quantidade", "devolvido"];

  constructor(
              private utensilioService: UtensilioService,
              private route: ActivatedRoute,
              private router: Router
            ) { }

  
    datas=[
      {data: '29/08/2025'},
      {data: '30/08/2025'},
      {data: '31/08/2025'}
    ]


    listaUtensiliosPessoaDia = [
      {pessoa: "Carlos Eduardo Ramos", quantidade: 1, devolvido: true},
      {pessoa: "Maria das Dores Rodrigues", quantidade: 1, devolvido: false},
      {pessoa: "Ana Paula Nogueira", quantidade: 1, devolvido: false},
      {pessoa: "Eloá da Silva", quantidade: 1, devolvido: true},
    ]


  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    if (this.firebaseId) {
      this.utensilioService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.utensilio = res;
        },
        error: (err) => {
          console.error('Erro ao buscar utensílio: ', err);
        }
      });
    }
  }

  excluir() {
    if (this.firebaseId) {
      this.utensilioService.deletar(this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Utensilio excluído com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/utensilios']);
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
