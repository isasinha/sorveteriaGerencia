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
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
    private utensilioService: UtensilioService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;    
    if (this.atualizando && this.firebaseId) {
      this.utensilioService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.utensilio = res;
        },
        error: (err) => {
          console.error('Erro ao buscar utensílio: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
  }

  salvar(): void {
    if (this.atualizando && this.firebaseId) {
      this.utensilioService.alterar(this.utensilio, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Utensílio atualizado com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/utensilios']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
    } else {
      this.utensilioService.salvar(this.utensilio)
        .then(() => {
          this.mostrarMensagem('Utensílio cadastrado com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/utensilios']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
    }
  }

  alterarFoto(event: Event) {
    //event.preventDefault();    
  }

  async gerarId(){
    try{
      const proximoId = await this.utensilioService.gerarProximoId()
      this.utensilio.idUtensilio = proximoId;
    } catch (error){
      console.error('Erro ao gerar ID: ', error)
    }
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
 
}
