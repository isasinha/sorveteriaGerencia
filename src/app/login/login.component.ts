import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { LoginModel } from './login.model'; 
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
  atualizando: boolean = false;
  login: LoginModel = LoginModel.newLogin();

  constructor(
    private service: LoginService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  logar(){
     console.log("dados da barraca: ", this.login)
  }

}
