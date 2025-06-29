import { Injectable } from '@angular/core';
import {  Firestore, 
          collection, 
          query, 
          collectionData, 
          orderBy, 
          addDoc, 
          updateDoc, 
          deleteDoc, 
          doc, 
          docData,
          runTransaction 
        } from "@angular/fire/firestore"
import { firstValueFrom, Observable } from 'rxjs';
import { PessoaModel } from './pessoa.model';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  listaPessoas: any[] = []

  constructor( private firestore: Firestore) { }
  
    listar(): Observable<PessoaModel[]> {
      const pessoaRef = collection(this.firestore, 'pessoas');
      const q = query(pessoaRef, orderBy('idPessoa'));
      return collectionData(q, { idField: 'firebaseId' }) as Observable<PessoaModel[]>;  
    }
  
    salvar(pessoa: PessoaModel) {
      const pessoaRef = collection(this.firestore, 'pessoas');
      return addDoc(pessoaRef, pessoa);
    }
  
    alterar(pessoa: PessoaModel, firebaseId: string) {
      const pessoaDocRef = doc(this.firestore, `pessoas/${firebaseId}`);
      return updateDoc(pessoaDocRef, { ...pessoa });
    }
  
    deletar(firebaseId: string) {
      const pessoaDocRef = doc(this.firestore, `pessoas/${firebaseId}`);
      return deleteDoc(pessoaDocRef);
    }
  
    buscarPorId(firebaseId: string): Observable<PessoaModel> {
      const pessoaDocRef = doc(this.firestore, `pessoas/${firebaseId}`);
      return docData(pessoaDocRef, { idField: 'firebaseId' }) as Observable<PessoaModel>;
    }
  
    async gerarProximoId(): Promise<number> {
      var idsPessoas: number[]
      var novoValor: number
      this.listaPessoas = await firstValueFrom(this.listar())
      idsPessoas = this.listaPessoas.map(b => b.idPessoa);
      novoValor = idsPessoas.length === 0 ? 1 : Math.max(...idsPessoas) + 1;
      return novoValor;
    }
  
  }
  
  