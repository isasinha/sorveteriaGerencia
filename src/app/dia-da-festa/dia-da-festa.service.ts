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
import { DiaDaFestaModel } from './dia-da-festa.model';

@Injectable({
  providedIn: 'root'
})

export class DiaDaFestaService {
  listaDiasDaFesta: any[] = []
  
  constructor( private firestore: Firestore) { }

  listar(): Observable<DiaDaFestaModel[]> {
    const diaDaFestaRef = collection(this.firestore, 'dia_da_festa');
    const q = query(diaDaFestaRef, orderBy('dia'));
    return collectionData(q, { idField: 'firebaseId' }) as Observable<DiaDaFestaModel[]>;  
  }

  salvar(diaDaFesta: DiaDaFestaModel) {
    const diaDaFestaRef = collection(this.firestore, 'dia_da_festa');
    return addDoc(diaDaFestaRef, diaDaFesta);
  }

  alterar(diaDaFesta: DiaDaFestaModel, firebaseId: string) {
    const diaDaFestaDocRef = doc(this.firestore, `dia_da_festa/${firebaseId}`);
    return updateDoc(diaDaFestaDocRef, { ...diaDaFesta });
  }

  deletar(firebaseId: string) {
    const diaDaFestaDocRef = doc(this.firestore, `dia_da_festa/${firebaseId}`);
    return deleteDoc(diaDaFestaDocRef);
  }

  buscarPorId(firebaseId: string): Observable<DiaDaFestaModel> {
    const diaDaFestaDocRef = doc(this.firestore, `dia_da_festa/${firebaseId}`);
    return docData(diaDaFestaDocRef, { idField: 'firebaseId' }) as Observable<DiaDaFestaModel>;
  }

  async gerarProximoId(): Promise<number> {
    var idsDiasDaFesta: number[]
    var novoValor: number
    this.listaDiasDaFesta = await firstValueFrom(this.listar())
    idsDiasDaFesta = this.listaDiasDaFesta.map(b => b.idDia);
    novoValor = idsDiasDaFesta.length === 0 ? 1 : Math.max(...idsDiasDaFesta) + 1;
    return novoValor;
  }

}

