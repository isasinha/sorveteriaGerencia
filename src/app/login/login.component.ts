import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBar } from '@angular/material/snack-bar'
import { LoginService } from './login.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MatCardModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  senha = '';
  snack: MatSnackBar = inject(MatSnackBar);
  esconderSenha = true;

  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,
    
  ){}

  async login() {
    try {
      await this.loginService.login(this.email, this.senha).then(() =>{
        this.router.navigate(['/diadafesta']);
      });
    } catch (error) {
      console.error(error);
      this.mostrarMensagem('Erro no login!');
    }
  }

  async esqueciSenha() {
    if (!this.email) {
      this.mostrarMensagem('Informe o e-mail para redefinir a senha.');
      return;
    }
    try {
      await this.loginService.enviarEmailRedefinicaoSenha(this.email);
      this.mostrarMensagem('E-mail de redefinição enviado com sucesso!');
    } catch (error) {
      console.error(error);
      this.mostrarMensagem('Erro ao enviar e-mail de redefinição.');
    }
  }
  
  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }

}
