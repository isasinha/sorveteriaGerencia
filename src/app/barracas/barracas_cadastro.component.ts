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
import { BarracaModel } from './barraca.model';
import { BarracaService } from './barraca.service'; 
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-barracas-cadastro',
  imports: [ 
            RouterLink,
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule
          ],
  templateUrl: './barracas_cadastro.component.html',
  styleUrl: './barracas_cadastro.component.scss'
})
export class Barracas_CadastroComponent implements OnInit{
  atualizando: boolean = false;
  barraca: BarracaModel = BarracaModel.newBarraca();
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
    private service: BarracaService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((query:any) => {
      const params = query['params']
      const id = params['id']
      if(id){
        let barracaEncontrada = this.service.buscarPorId(id);
        if(barracaEncontrada){
          this.atualizando = true;
          this.barraca = barracaEncontrada;          
        }
      }
    })
  }

  alterarFoto(event: any){

  }

  async salvar(){
    if(!this.atualizando){
      this.service.salvar(this.barraca);
      this.barraca = BarracaModel.newBarraca();
      this.mostrarMensagem('Salvo com sucesso!');
    }else{
      this.service.atualizar(this.barraca);
      this.router.navigate(['/barracas']);
      this.mostrarMensagem('Atualizado!');
    }    
    await new Promise(f => setTimeout(f, 1000));
    this.router.navigate(['/barracas']);
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
}
