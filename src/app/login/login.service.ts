import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword, signOut } from '@angular/fire/auth';
//import { LoginModel } from './login.model';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  private auth = inject(Auth);

  login(email: string, senha: string) {
    return signInWithEmailAndPassword(this.auth, email, senha);
  }

  cadastrar(email: string, senha: string) {
    return createUserWithEmailAndPassword(this.auth, email, senha);
  }

  logout() {
    return signOut(this.auth);
  }

  usuarioLogado() {
    return this.auth.currentUser;
  } 

  async enviarEmailRedefinicaoSenha(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

}
