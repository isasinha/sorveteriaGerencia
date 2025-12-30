// Baseado em: https://firebase.google.com/docs/firestore/quickstart
import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

export interface DiaDaFesta {
  id?: string;
  idDia?: number;
  dia: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiaDaFestaService {
  private collectionName = 'dia_da_festa';

  constructor() {}

  // Obter todos os dias da festa
  async getDiasDaFesta(): Promise<DiaDaFesta[]> {
    const diasCol = collection(db, this.collectionName);
    const diasSnapshot = await getDocs(diasCol);
    
    return diasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DiaDaFesta));
  }

  // Adicionar novo dia da festa
  async addDiaDaFesta(dia: DiaDaFesta): Promise<void> {
    const diasCol = collection(db, this.collectionName);
    await addDoc(diasCol, dia);
  }

  // Atualizar dia da festa
  async updateDiaDaFesta(id: string, dia: Partial<DiaDaFesta>): Promise<void> {
    const diaDoc = doc(db, this.collectionName, id);
    await updateDoc(diaDoc, dia);
  }

  // Deletar dia da festa
  async deleteDiaDaFesta(id: string): Promise<void> {
    const diaDoc = doc(db, this.collectionName, id);
    await deleteDoc(diaDoc);
  }

  // Obter próximo ID de dia (auto-incremento)
  async getProximoIdDia(): Promise<number> {
    const dias = await this.getDiasDaFesta();
    
    if (dias.length === 0) {
      return 1;
    }

    const ids = dias
      .map(d => d.idDia || 0)
      .filter(id => id > 0);

    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
}
