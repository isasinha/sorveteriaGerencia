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
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { UtensilioModel } from './utensilio.model';
import { UtensilioService } from './utensilio.service'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-utensilios_cadastro',
  imports: [RouterLink,
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule,
            MatCheckboxModule,
            MatRadioModule,
            MatSelectModule
          ],
  templateUrl: './utensilios_cadastro.component.html',
  styleUrl: './utensilios_cadastro.component.scss'
})
export class Utensilios_CadastroComponent implements OnInit{
  atualizando: boolean = false;
  utensilio: UtensilioModel = UtensilioModel.newUtensilio();
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
    private service: UtensilioService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((query:any) => {
      const params = query['params']
      const id = params['id']
      if(id){
        let utensilioEncontrado = this.service.buscarPorId(id);
        if(utensilioEncontrado){
          this.atualizando = true;
          this.utensilio = utensilioEncontrado;          
        }
      }
    })
  }

  alterarFoto(event: any){

  }
  async salvar(){
    if(!this.atualizando){
      this.service.salvar(this.utensilio);
      this.utensilio = UtensilioModel.newUtensilio();
      this.mostrarMensagem('Salvo com sucesso!');
    }else{
      this.service.atualizar(this.utensilio);
      this.router.navigate(['/utensilios']);
      this.mostrarMensagem('Atualizado!');
    }    
    await new Promise(f => setTimeout(f, 1000));
    this.router.navigate(['/utensilios']);
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
 
}
