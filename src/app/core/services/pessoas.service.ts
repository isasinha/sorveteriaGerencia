// Baseado em: https://firebase.google.com/docs/firestore/quickstart
import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Observable } from 'rxjs';

export interface Pessoa {
  id?: string;
  idPessoa?: string | number;
  nome: string;
  email?: string;
  imagem?: string;
  data_nascimento?: string;
  idade?: number;
  telefone_cel?: string;
  telefone_rec?: string;
  telefone_res?: string;
  idEquipe?: string;
  comentarios?: string;
  recepcao?: boolean;
  ativo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PessoasService {
  private collectionName = 'pessoas';

  constructor() {}

  // Buscar todas as pessoas
  async getPessoas(): Promise<Pessoa[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pessoa));
  }

  // Buscar pessoa por ID
  async getPessoaById(id: string): Promise<Pessoa | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Pessoa;
    }
    
    return null;
  }

  // Observar mudanças em tempo real
  getPessoasRealtime(): Observable<Pessoa[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(
        collection(db, this.collectionName),
        (snapshot) => {
          const pessoas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Pessoa));
          observer.next(pessoas);
        },
        (error) => {
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }

  // Obter próximo idPessoa incremental
  async getProximoIdPessoa(): Promise<number> {
    const pessoas = await this.getPessoas();
    
    if (pessoas.length === 0) {
      return 1;
    }
    
    const maxId = pessoas.reduce((max, pessoa) => {
      const id = typeof pessoa.idPessoa === 'number' 
        ? pessoa.idPessoa 
        : parseInt(pessoa.idPessoa?.toString() || '0', 10);
      return id > max ? id : max;
    }, 0);
    
    return maxId + 1;
  }

  // Adicionar pessoa
  async addPessoa(pessoa: Pessoa): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), pessoa);
    return docRef.id;
  }

  // Atualizar pessoa
  async updatePessoa(id: string, pessoa: Partial<Pessoa>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, pessoa as any);
  }

  // Deletar pessoa
  async deletePessoa(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}
