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
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { app, db } from '../config/firebase.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isEquipeTI = signal<boolean>(false);
  permissaoLoginVerificada = signal<boolean | null>(null); // null = ainda não verificado
  erroPermissao = signal<string | null>(null);
  authState$: Observable<User | null>;

  constructor(private router: Router) {
    // Usar o auth do Firebase
    this.auth = getAuth(app);
    
    // Criar Observable do estado de autenticação
    this.authState$ = new Observable<User | null>(subscriber => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(!!user);
        subscriber.next(user); // emite imediatamente

        if (user?.email) {
          this.verificarEquipeTI(user.uid, user.email).then(isTI => {
            this.isEquipeTI.set(isTI);
          }).catch(() => this.isEquipeTI.set(false));
        } else {
          this.isEquipeTI.set(false);
          this.permissaoLoginVerificada.set(null); // reseta ao sair
        }
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
      this.permissaoLoginVerificada.set(null); // será verificado no guard
      this.router.navigate(['/escala']);
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
      this.isEquipeTI.set(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  // Busca pessoaId no Firestore por uid ou email (case-insensitive)
  private async getPessoaIdDeAuth(uid: string, email: string): Promise<string | null> {
    // Primeiro tenta por uid (mais confiável)
    if (uid) {
      const byUid = await getDocs(
        query(collection(db, 'usuarios'), where('uid', '==', uid))
      );
      if (!byUid.empty) {
        return byUid.docs[0].data()['pessoaId'] as string;
      }
    }
    // Fallback: busca todos e filtra por email case-insensitive
    const all = await getDocs(collection(db, 'usuarios'));
    const match = all.docs.find(d =>
      String(d.data()['email'] ?? '').toLowerCase() === email.toLowerCase()
    );
    if (match) return match.data()['pessoaId'] as string;

    // Fallback: usuário não está em 'usuarios' (ex: admin criado direto no Firebase Auth)
    // Busca diretamente em 'pessoas' pelo email
    const pessoasSnap = await getDocs(collection(db, 'pessoas'));
    const pessoaMatch = pessoasSnap.docs.find(d =>
      String(d.data()['email'] ?? '').toLowerCase() === email.toLowerCase()
    );
    if (pessoaMatch) return pessoaMatch.id; // retorna o doc ID da pessoa diretamente

    return null;
  }

  async verificarPermissaoLogin(uid: string, email: string): Promise<boolean> {
    try {
      const pessoaId = await this.getPessoaIdDeAuth(uid, email);
      if (!pessoaId) {
        console.warn('verificarPermissao: sem registro em usuarios para uid=', uid, 'email=', email);
        return false;
      }

      const pessoaSnap = await getDoc(doc(db, 'pessoas', pessoaId));
      if (!pessoaSnap.exists()) {
        console.warn('verificarPermissao: pessoa não encontrada, pessoaId=', pessoaId);
        return false;
      }

      const pessoa = pessoaSnap.data();
      console.log('verificarPermissao: idEquipe=', pessoa['idEquipe']);

      const isTI = await this.verificarEquipeNomeComDados(pessoa['idEquipe'], 'TI');
      if (isTI) return true;

      return this.verificarEquipeNomeComDados(pessoa['idEquipe'], 'Recepção');
    } catch (e) {
      console.error('verificarPermissao erro:', e);
      return false;
    }
  }

  async verificarEquipeTI(uid: string, email: string): Promise<boolean> {
    try {
      const pessoaId = await this.getPessoaIdDeAuth(uid, email);
      if (!pessoaId) return false;

      const pessoaSnap = await getDoc(doc(db, 'pessoas', pessoaId));
      if (!pessoaSnap.exists()) return false;

      return this.verificarEquipeNomeComDados(pessoaSnap.data()['idEquipe'], 'TI');
    } catch (e) {
      console.error('verificarEquipeTI erro:', e);
      return false;
    }
  }

  private normalizeNome(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private async verificarEquipeNomeComDados(idEquipePessoa: any, nomeEquipe: string): Promise<boolean> {
    if (!idEquipePessoa) return false;

    const equipesSnap = await getDocs(collection(db, 'equipes'));
    if (equipesSnap.empty) return false;

    const nomeNorm = this.normalizeNome(nomeEquipe);
    const equipeDoc = equipesSnap.docs.find(d =>
      this.normalizeNome(String(d.data()['nome'] ?? '')) === nomeNorm
    );
    if (!equipeDoc) return false;

    const equipeId = String(equipeDoc.data()['idEquipe'] ?? equipeDoc.id);

    const equipesStr = String(idEquipePessoa);
    const equipes = equipesStr.split(/[,\s]+/).map(e => e.trim()).filter(e => e);
    return equipes.includes(equipeId) || equipes.includes(equipeDoc.id);
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
