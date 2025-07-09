import { Injectable, Query } from '@angular/core';
import {  Firestore, 
          collection, 
          query, 
          where,
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
import { PessoaDiaModel, PessoaModel } from './pessoa.model';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  listaPessoas: any[] = []
  listaPessoaDia: any[] = []
  // listaPessoaDiaUtensilio: any[] = []

  constructor( private firestore: Firestore) { }
  
    listarPessoas(): Observable<PessoaModel[]> {
      const pessoaRef = collection(this.firestore, 'pessoas');
      const q = query(pessoaRef, orderBy('idPessoa'));
      return collectionData(q, { idField: 'firebaseId' }) as Observable<PessoaModel[]>;  
    }

    listarPessoaDia(idPessoa?: number, idDia?: number): Observable<PessoaDiaModel[]>{
      let q: any | null = null;
      const pessoaRef = collection(this.firestore, 'pessoaDia');
      if(idPessoa && idDia){q = query(pessoaRef, where('idPessoa', '==', idPessoa), where('idDia', '==', idDia), orderBy('idPessoa'), orderBy('idDia'));}
      else if(idPessoa)    {q = query(pessoaRef, where('idPessoa', '==', idPessoa), orderBy('idDia'));}
      else if(idDia)       {q = query(pessoaRef, where('idDia', '==', idDia), orderBy('idPessoa'));}
      else                 {q = query(pessoaRef, orderBy('idPessoa'), orderBy('idDia'));}
      return collectionData(q, { idField: 'firebaseId' }) as Observable<PessoaDiaModel[] >;  
    }
    
    // listarPessoaDiaUtensilio(idPessoaDia?: number): Observable<PessoaDiaUtensilioModel[]> {
    //   let q: any | null = null;
    //   const pessoaRef = collection(this.firestore, 'pessoaDiaUtensilio');
    //   if(idPessoaDia){q = query(pessoaRef, where('idPessoaDia', '==', idPessoaDia), orderBy('idUtensilio'));}
    //   else           {q = query(pessoaRef, orderBy('idPessoaDia'), orderBy('idUtensilio'));}
    //   return collectionData(q, { idField: 'firebaseId' }) as Observable<PessoaDiaUtensilioModel[]>;  
    // }
  
    salvarPessoa(pessoa: PessoaModel) {
      const pessoaRef = collection(this.firestore, 'pessoas');
      return addDoc(pessoaRef, pessoa);
    }
  
    salvarPessoaDia(pessoaDia: PessoaDiaModel) {
      const pessoaRef = collection(this.firestore, 'pessoaDia');
      return addDoc(pessoaRef, pessoaDia);
    }

    // salvarPessoaDiaUtensilio(pessoaDiaUtensilio: PessoaDiaUtensilioModel) {
    //   const pessoaRef = collection(this.firestore, 'pessoaDiaUtensilio');
    //   return addDoc(pessoaRef, pessoaDiaUtensilio);
    // }

    alterarPessoa(pessoa: PessoaModel, firebaseId: string) {
      const pessoaDocRef = doc(this.firestore, `pessoas/${firebaseId}`);
      return updateDoc(pessoaDocRef, { ...pessoa });
    }

    alterarPessoaDia(pessoaDia: PessoaDiaModel, firebaseId: string) {
      const pessoaDocRef = doc(this.firestore, `pessoaDia/${firebaseId}`);
      return updateDoc(pessoaDocRef, { ...pessoaDia });
    }

    // alterarPessoaDiaUtensilio(pessoaDiaUtensilio: PessoaDiaUtensilioModel, firebaseId: string) {
    //   const pessoaDocRef = doc(this.firestore, `pessoaDiaUtensilio/${firebaseId}`);
    //   return updateDoc(pessoaDocRef, { ...pessoaDiaUtensilio });
    // }
  
    deletarPessoa(firebaseId: string) {
      const pessoaDocRef = doc(this.firestore, `pessoas/${firebaseId}`);
      return deleteDoc(pessoaDocRef);
    }

    deletarPessoaDia(firebaseId: string) {
      const pessoaDocRef = doc(this.firestore, `pessoaDia/${firebaseId}`);
      return deleteDoc(pessoaDocRef);
    }

    deletarPessoaDiaUtensilio(firebaseId: string) {
      const pessoaDocRef = doc(this.firestore, `pessoaDiaUtensilio/${firebaseId}`);
      return deleteDoc(pessoaDocRef);
    }
      
    buscarPorIdPessoa(firebaseId: string): Observable<PessoaModel> {
      const pessoaDocRef = doc(this.firestore, `pessoas/${firebaseId}`);
      return docData(pessoaDocRef, { idField: 'firebaseId' }) as Observable<PessoaModel>;
    }

    buscarPorIdPessoaDIa(firebaseId: string): Observable<PessoaDiaModel> {
      const pessoaDocRef = doc(this.firestore, `pessoaDia/${firebaseId}`);
      return docData(pessoaDocRef, { idField: 'firebaseId' }) as Observable<PessoaDiaModel>;
    }

    // buscarPorIdPessoaDiaUtensilio(firebaseId: string): Observable<PessoaDiaUtensilioModel> {
    //   const pessoaDocRef = doc(this.firestore, `pessoaDiaUtensilio/${firebaseId}`);
    //   return docData(pessoaDocRef, { idField: 'firebaseId' }) as Observable<PessoaDiaUtensilioModel>;
    // }
  
    async gerarProximoIdPessoas(): Promise<number> {
      var idsPessoas: number[]
      var novoValor: number
      this.listaPessoas = await firstValueFrom(this.listarPessoas())
      idsPessoas = this.listaPessoas.map(b => b.idPessoa);
      novoValor = idsPessoas.length === 0 ? 1 : Math.max(...idsPessoas) + 1;
      return novoValor;
    }
  
    async gerarProximoIdPessoaDia(): Promise<number> {
      var idsPessoaDia: number[]
      var novoValor: number
      this.listaPessoaDia = await firstValueFrom(this.listarPessoaDia())
      idsPessoaDia = this.listaPessoaDia.map(b => b.idPessoaDia);
      novoValor = idsPessoaDia.length === 0 ? 1 : Math.max(...idsPessoaDia) + 1;
      return novoValor;
    }

    // async gerarProximoIdPessoaDiaUtensilio(): Promise<number> {
    //   var idsPessoaDiaUtensilio: number[]
    //   var novoValor: number
    //   this.listaPessoaDiaUtensilio = await firstValueFrom(this.listarPessoaDiaUtensilio())
    //   idsPessoaDiaUtensilio = this.listaPessoaDiaUtensilio.map(b => b.idPessoaDiaUtensilio);
    //   novoValor = idsPessoaDiaUtensilio.length === 0 ? 1 : Math.max(...idsPessoaDiaUtensilio) + 1;
    //   return novoValor;
    // }
  }
  
  