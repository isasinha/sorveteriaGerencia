// Baseado em: https://firebase.google.com/docs/auth/web/manage-users
import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, firebaseConfig, app } from '../config/firebase.config';

const SENHA_PADRAO = '1234Sorveteria';

export interface UsuarioLogin {
  id?: string;
  uid?: string;
  pessoaId: string;
  nome: string;
  email: string;
  criadoEm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private collectionName = 'usuarios';
  private functions = getFunctions(app, 'us-central1');

  private getSecondaryAuth() {
    const existing = getApps().find(a => a.name === 'secondary');
    const secondaryApp = existing ?? initializeApp(firebaseConfig, 'secondary');
    return getAuth(secondaryApp);
  }

  async getUsuariosLogin(): Promise<UsuarioLogin[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as UsuarioLogin));
  }

  async criarLogin(pessoaId: string, nome: string, email: string): Promise<void> {
    const secondaryAuth = this.getSecondaryAuth();
    let uid = '';

    try {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, SENHA_PADRAO);
      uid = credential.user.uid;
      await signOut(secondaryAuth);
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'auth/email-already-in-use') {
        throw e;
      }
      // Usuário já existe no Auth — uid será preenchido pelo Firestore existente
    }

    await addDoc(collection(db, this.collectionName), {
      pessoaId,
      nome,
      email,
      uid,
      criadoEm: new Date().toISOString()
    });
  }

  async atualizarEmailLogin(pessoaId: string, emailAntigo: string, emailNovo: string): Promise<void> {
    const q = query(collection(db, this.collectionName), where('pessoaId', '==', pessoaId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const loginDoc = snapshot.docs[0];
    const loginData = loginDoc.data() as UsuarioLogin;

    // Atualiza e-mail no Firebase Auth via Cloud Function (Admin SDK)
    const fn = httpsCallable(this.functions, 'atualizarEmailAuth');
    await fn({ uid: loginData.uid || undefined, emailAntigo, emailNovo });

    // Atualiza registro no Firestore
    await updateDoc(doc(db, this.collectionName, loginDoc.id), { email: emailNovo });
  }

  async removerLogin(id: string, email: string): Promise<void> {
    const loginSnap = await getDocs(
      query(collection(db, this.collectionName), where('email', '==', email))
    );
    const uid = loginSnap.empty ? undefined : (loginSnap.docs[0].data() as UsuarioLogin).uid;

    // Remove usuário do Firebase Auth via Cloud Function (Admin SDK)
    const fn = httpsCallable(this.functions, 'excluirUsuarioAuth');
    await fn({ uid: uid || undefined, email });

    await deleteDoc(doc(db, this.collectionName, id));
  }
}
