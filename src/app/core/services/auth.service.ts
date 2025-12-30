// Baseado em: https://firebase.google.com/docs/auth/web/start
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { app } from '../config/firebase.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  authState$: Observable<User | null>;

  constructor(private router: Router) {
    // Usar o auth do Firebase
    this.auth = getAuth(app);
    
    // Criar Observable do estado de autenticação
    this.authState$ = new Observable<User | null>(subscriber => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(!!user);
        subscriber.next(user);
      });
      
      return () => unsubscribe();
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      this.currentUser.set(userCredential.user);
      this.isAuthenticated.set(true);
      this.router.navigate(['/dia-da-festa']);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      throw this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  private handleAuthError(error: any): Error {
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('Usuário não encontrado');
      case 'auth/wrong-password':
        return new Error('Senha incorreta');
      case 'auth/invalid-email':
        return new Error('Email inválido');
      case 'auth/user-disabled':
        return new Error('Usuário desabilitado');
      case 'auth/too-many-requests':
        return new Error('Muitas tentativas. Tente novamente mais tarde');
      case 'auth/network-request-failed':
        return new Error('Erro de conexão. Verifique sua internet');
      case 'auth/invalid-credential':
        return new Error('Email ou senha incorretos');
      default:
        return new Error('Erro ao fazer login. Tente novamente');
    }
  }
}
