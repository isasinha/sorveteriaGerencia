import { Injectable } from '@angular/core';
import {  Firestore, 
          collection, 
          query, 
          collectionData, 
          orderBy, 
          addDoc, 
          getDocs,
          updateDoc, 
          deleteDoc, 
          doc, 
          docData,
          runTransaction 
        } from "@angular/fire/firestore"
import { firstValueFrom, Observable } from 'rxjs';
import { EquipeModel } from './equipe.model';
import { where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})

export class EquipeService {
  listaEquipes: any[] = []
  
  constructor( private firestore: Firestore) { }

  listar(): Observable<EquipeModel[]> {
    const equipeRef = collection(this.firestore, 'equipes');
    const q = query(equipeRef, orderBy('idEquipe'));
    return collectionData(q, { idField: 'firebaseId' }) as Observable<EquipeModel[]>;  
  }

  salvar(equipe: EquipeModel) {
    const equipeRef = collection(this.firestore, 'equipes');
    return addDoc(equipeRef, equipe);
  }

  alterar(equipe: EquipeModel, firebaseId: string) {
    const equipeDocRef = doc(this.firestore, `equipes/${firebaseId}`);
    return updateDoc(equipeDocRef, { ...equipe });
  }

  deletar(firebaseId: string) {
    const equipeDocRef = doc(this.firestore, `equipes/${firebaseId}`);
    return deleteDoc(equipeDocRef);
  }

  buscarPorId(firebaseId: string): Observable<EquipeModel> {
    const equipeDocRef = doc(this.firestore, `equipes/${firebaseId}`);
    return docData(equipeDocRef, { idField: 'firebaseId' }) as Observable<EquipeModel>;
  }

  async buscarNomeEquipe(idEquipe: number): Promise<string | null>{
    const listaEquipes = collection(this.firestore, 'equipes');
    const q = query(listaEquipes, where('idEquipe', '==', idEquipe));
    const querySnapshot = await getDocs(q);

    if(!querySnapshot.empty){
      const doc = querySnapshot.docs[0];
      const data = doc.data() as EquipeModel;
      return data.nome;
    }
    return null;
  }

  async gerarProximoId(): Promise<number> {
    var idsEquipes: number[]
    var novoValor: number
    this.listaEquipes = await firstValueFrom(this.listar())
    idsEquipes = this.listaEquipes.map(b => b.idEquipe);
    novoValor = idsEquipes.length === 0 ? 1 : Math.max(...idsEquipes) + 1;
    return novoValor;
  }

}

