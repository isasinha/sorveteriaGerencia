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
import { UtensilioModel } from './utensilio.model';

@Injectable({
  providedIn: 'root'
})

export class UtensilioService {
  listaUtensilios: any[] = []
  
  constructor( private firestore: Firestore) { }

  listar(): Observable<UtensilioModel[]> {
    const utensilioRef = collection(this.firestore, 'utensilios');
    const q = query(utensilioRef, orderBy('idUtensilio'));
    return collectionData(q, { idField: 'firebaseId' }) as Observable<UtensilioModel[]>;  
  }

  salvar(utensilio: UtensilioModel) {
    const utensilioRef = collection(this.firestore, 'utensilios');
    return addDoc(utensilioRef, utensilio);
  }

  alterar(utensilio: UtensilioModel, firebaseId: string) {
    const utensilioDocRef = doc(this.firestore, `utensilios/${firebaseId}`);
    return updateDoc(utensilioDocRef, { ...utensilio });
  }

  deletar(firebaseId: string) {
    const utensilioDocRef = doc(this.firestore, `utensilios/${firebaseId}`);
    return deleteDoc(utensilioDocRef);
  }

  buscarPorId(firebaseId: string): Observable<UtensilioModel> {
    const utensilioDocRef = doc(this.firestore, `utensilios/${firebaseId}`);
    return docData(utensilioDocRef, { idField: 'firebaseId' }) as Observable<UtensilioModel>;
  }

  async gerarProximoId(): Promise<number> {
    var idsUtensilios: number[]
    var novoValor: number
    this.listaUtensilios = await firstValueFrom(this.listar())
    idsUtensilios = this.listaUtensilios.map(b => b.idUtensilio);
    novoValor = idsUtensilios.length === 0 ? 1 : Math.max(...idsUtensilios) + 1;
    return novoValor;
  }

}

