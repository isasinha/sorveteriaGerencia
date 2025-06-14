import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatCardModule} from '@angular/material/card'
import { MatFormFieldModule} from '@angular/material/form-field'
import { MatInputModule} from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DiaDaFestaModel } from './dia-da-festa.model';
import { DiaDaFestaService } from './dia-da-festa.service'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-dia-da-festa_cadastro',
  imports: [RouterLink,
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule,
            MatOptionModule,
            MatSelectModule
  ],
  templateUrl: './dia-da-festa_cadastro.component.html',
  styleUrl: './dia-da-festa_cadastro.component.scss'
})
export class DiaDaFesta_CadastroComponent implements OnInit{
  atualizando: boolean = false;
  dia_da_festa: DiaDaFestaModel = DiaDaFestaModel.newDiaDaFesta();
  snack: MatSnackBar = inject(MatSnackBar);
  diasSemana: string[] =['','Sexta-feira', 'Sábado', 'Domingo'];

  constructor(
    private service: DiaDaFestaService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((query:any) => {
      const params = query['params']
      const dia = params['dia']
      if(dia){
        let diaEncontrado = this.service.buscarPorDia(dia);
        if(diaEncontrado){
          this.atualizando = true;
          this.dia_da_festa = diaEncontrado;          
        }
      }
    })
  }

  async salvar(){
    if(!this.atualizando){
      this.service.salvar(this.dia_da_festa);
      this.dia_da_festa = DiaDaFestaModel.newDiaDaFesta();
      this.mostrarMensagem('Salvo com sucesso!');
    }else{
      this.service.atualizar(this.dia_da_festa);
      this.router.navigate(['/diadafesta']);
      this.mostrarMensagem('Atualizado!');
    }    
    await new Promise(f => setTimeout(f, 1000));
    this.router.navigate(['/diadafesta']);
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }

}
