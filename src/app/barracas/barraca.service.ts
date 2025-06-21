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
import { BarracaModel } from './barraca.model';

@Injectable({
  providedIn: 'root'
})

export class BarracaService {
  listaBarracas: any[] = []
  
  constructor( private firestore: Firestore) { }

  listar(): Observable<BarracaModel[]> {
    const barracaRef = collection(this.firestore, 'barracas');
    const q = query(barracaRef, orderBy('idBarraca'));
    return collectionData(q, { idField: 'firebaseId' }) as Observable<BarracaModel[]>;  
  }

  salvar(barraca: BarracaModel) {
    const barracaRef = collection(this.firestore, 'barracas');
    return addDoc(barracaRef, barraca);
  }

  atualizar(barraca: BarracaModel, firebaseId: string) {
    const barracaDocRef = doc(this.firestore, `barracas/${firebaseId}`);
    return updateDoc(barracaDocRef, { ...barraca });
  }

  deletar(firebaseId: string) {
    const barracaDocRef = doc(this.firestore, `barracas/${firebaseId}`);
    return deleteDoc(barracaDocRef);
  }

  buscarPorId(firebaseId: string): Observable<BarracaModel> {
    const barracaDocRef = doc(this.firestore, `barracas/${firebaseId}`);
    return docData(barracaDocRef, { idField: 'firebaseId' }) as Observable<BarracaModel>;
  }

  async gerarProximoId(): Promise<number> {
    var idsBarracas: number[]
    var novoValor: number
    this.listaBarracas = await firstValueFrom(this.listar())
    idsBarracas = this.listaBarracas.map(b => b.idBarraca);
    novoValor = Math.max(...idsBarracas) + 1;
    return novoValor;
  }

}

