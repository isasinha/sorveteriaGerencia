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
import { EquipeModel, FuncaoModel } from './equipe.model';
import { where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})

export class EquipeService {
  listaEquipes: any[] = []
  listaFuncoes: any[] = []
  
  constructor( private firestore: Firestore) { }

  listarEquipes(): Observable<EquipeModel[]> {
    const equipeRef = collection(this.firestore, 'equipes');
    const q = query(equipeRef, orderBy('idEquipe'));
    return collectionData(q, { idField: 'firebaseId' }) as Observable<EquipeModel[]>;  
  }

  listarFuncoes(): Observable<FuncaoModel[]> {
    const funcaoRef = collection(this.firestore, 'funcoes');
    const q = query(funcaoRef, orderBy('idFuncao'));
    return collectionData(q, { idField: 'firebaseId' }) as Observable<FuncaoModel[]>;  
  }

  salvarEquipe(equipe: EquipeModel) {
    const equipeRef = collection(this.firestore, 'equipes');
    return addDoc(equipeRef, equipe);
  }

  salvarFuncao(funcao: FuncaoModel) {
    const funcaoRef = collection(this.firestore, 'funcoes');
    return addDoc(funcaoRef, funcao);
  }

  alterarEquipe(equipe: EquipeModel, firebaseId: string) {
    const equipeDocRef = doc(this.firestore, `equipes/${firebaseId}`);
    return updateDoc(equipeDocRef, { ...equipe });
  }

  alterarFuncao(funcao: FuncaoModel, firebaseId: string) {
    const funcaoDocRef = doc(this.firestore, `funcoes/${firebaseId}`);
    return updateDoc(funcaoDocRef, { ...funcao });
  }

  deletarEquipe(firebaseId: string) {
    const equipeDocRef = doc(this.firestore, `equipes/${firebaseId}`);
    return deleteDoc(equipeDocRef);
  }
  
  deletarFuncao(firebaseId: string) {
    const funcaoDocRef = doc(this.firestore, `funcoes/${firebaseId}`);
    return deleteDoc(funcaoDocRef);
  }

  buscarEquipePorId(firebaseId: string): Observable<EquipeModel> {
    const equipeDocRef = doc(this.firestore, `equipes/${firebaseId}`);
    return docData(equipeDocRef, { idField: 'firebaseId' }) as Observable<EquipeModel>;
  }

  buscarFuncaoPorId(firebaseId: string): Observable<FuncaoModel> {
    const funcaoDocRef = doc(this.firestore, `funcoes/${firebaseId}`);
    return docData(funcaoDocRef, { idField: 'firebaseId' }) as Observable<FuncaoModel>;
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

async buscarNomesFuncoes(idsFuncoes: number[]): Promise<string[]> {
  const listaFuncoes = collection(this.firestore, 'funcoes');
  const nomesFuncoes: string[] = [];
  for (const id of idsFuncoes) {
    const q = query(listaFuncoes, where('idFuncao', '==', id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data() as FuncaoModel;
      if (data.nome) {
        nomesFuncoes.push(data.nome);
      }
    }
  }
  return nomesFuncoes;
}


  async gerarProximoIdEquipe(): Promise<number> {
    var idsEquipes: number[]
    var novoValor: number
    this.listaEquipes = await firstValueFrom(this.listarEquipes())
    idsEquipes = this.listaEquipes.map(b => b.idEquipe);
    novoValor = idsEquipes.length === 0 ? 1 : Math.max(...idsEquipes) + 1;
    return novoValor;
  }
  
  async gerarProximoIdFuncao(): Promise<number> {
    var idsFuncoes: number[]
    var novoValor: number
    this.listaFuncoes = await firstValueFrom(this.listarFuncoes())
    idsFuncoes = this.listaFuncoes.map(b => b.idFuncao);
    novoValor = idsFuncoes.length === 0 ? 1 : Math.max(...idsFuncoes) + 1;
    return novoValor;
  }

}

