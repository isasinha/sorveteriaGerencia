import { Injectable } from '@angular/core';
import { LoginModel } from './login.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  logar(){

  }
  
  private pesquisar(): LoginModel{
    const repositorio = {usuario: "MADOGUES", senha:"MADOGUES1951"}
    if(repositorio){
      const login = repositorio;
      return login
    }

    const login: LoginModel = {};
    return login;
    
  }
  
  buscarPorUsuario(usuario: string) : LoginModel | undefined{
    const login = {usuario: "MADOGUES", senha:"MADOGUES1951"}
    return login;
  }

  
    salvar(login: LoginModel){
  
    }
  
    atualizar(login: LoginModel){
  
    }
  
    deletar(login: LoginModel){
  
    }
  

}
