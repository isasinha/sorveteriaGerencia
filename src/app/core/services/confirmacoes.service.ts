// Baseado em: https://firebase.google.com/docs/firestore/quickstart
import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

export interface Confirmacao {
  id?: string;
  idPessoa: string | number;
  idDia: number;
  idEquipe: string | number;
  horaInicio: string;
  horaFim: string;
  confirmado: boolean;
  dataConfirmacao?: string;
  observacoes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmacoesService {
  private collectionName = 'confirmacoes';

  constructor() {}

  // Buscar todas as confirmações
  async getConfirmacoes(): Promise<Confirmacao[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        idDia: Number(data['idDia'])
      } as Confirmacao;
    });
  }

  // Buscar confirmações por dia
  async getConfirmacoesByDia(idDia: number): Promise<Confirmacao[]> {
    const q = query(
      collection(db, this.collectionName),
      where('idDia', '==', idDia)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        idDia: Number(data['idDia'])
      } as Confirmacao;
    });
  }

  // Buscar confirmações por pessoa
  async getConfirmacoesByPessoa(idPessoa: string | number): Promise<Confirmacao[]> {
    const q = query(
      collection(db, this.collectionName),
      where('idPessoa', '==', idPessoa)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        idDia: Number(data['idDia'])
      } as Confirmacao;
    });
  }

  // Buscar confirmações por pessoa e dia (pode retornar múltiplas)
  async getConfirmacoesByPessoaEDia(idPessoa: string | number, idDia: number): Promise<Confirmacao[]> {
    const q = query(
      collection(db, this.collectionName),
      where('idPessoa', '==', idPessoa),
      where('idDia', '==', idDia)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        idDia: Number(data['idDia'])
      } as Confirmacao;
    });
  }

  // Adicionar confirmação
  async addConfirmacao(confirmacao: Omit<Confirmacao, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...confirmacao,
      confirmado: true,
      dataConfirmacao: new Date().toISOString()
    });
    return docRef.id;
  }

  // Atualizar confirmação
  async updateConfirmacao(id: string, confirmacao: Partial<Confirmacao>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, confirmacao);
  }

  // Deletar confirmação
  async deleteConfirmacao(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Buscar pessoas confirmadas por dia (retorna apenas os IDs)
  async getPessoasConfirmadasByDia(idDia: number): Promise<(string | number)[]> {
    const confirmacoes = await this.getConfirmacoesByDia(idDia);
    return confirmacoes
      .filter(c => c.confirmado)
      .map(c => c.idPessoa);
  }
}
