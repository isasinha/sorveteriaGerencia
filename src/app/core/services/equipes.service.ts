// Baseado em: https://firebase.google.com/docs/firestore/quickstart
import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Observable } from 'rxjs';

export interface Equipe {
  id?: string;
  idEquipe?: string | number;
  nome: string;
  itensPadrao?: string[]; // ids dos itens padrão
}

@Injectable({
  providedIn: 'root'
})
export class EquipesService {
  private collectionName = 'equipes';

  constructor() {}

  // Obter todas as equipes
  async getEquipes(): Promise<Equipe[]> {
    const equipesCol = collection(db, this.collectionName);
    const equipesSnapshot = await getDocs(equipesCol);
    
    return equipesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Equipe));
  }

  // Adicionar nova equipe
  async addEquipe(equipe: Equipe): Promise<void> {
    const equipesCol = collection(db, this.collectionName);
    await addDoc(equipesCol, equipe);
  }

  // Atualizar equipe
  async updateEquipe(id: string, equipe: Partial<Equipe>): Promise<void> {
    const equipeDoc = doc(db, this.collectionName, id);
    await updateDoc(equipeDoc, equipe);
  }

  // Deletar equipe
  async deleteEquipe(id: string): Promise<void> {
    const equipeDoc = doc(db, this.collectionName, id);
    await deleteDoc(equipeDoc);
  }

  // Obter próximo ID de equipe (auto-incremento)
  async getProximoIdEquipe(): Promise<number> {
    const equipes = await this.getEquipes();
    
    if (equipes.length === 0) {
      return 1;
    }

    const ids = equipes
      .map(e => {
        const id = typeof e.idEquipe === 'string' ? parseInt(e.idEquipe, 10) : e.idEquipe;
        return isNaN(id as number) ? 0 : (id as number);
      })
      .filter(id => id > 0);

    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  // Observable para mudanças em tempo real
  getEquipesObservable(): Observable<Equipe[]> {
    return new Observable(observer => {
      const equipesCol = collection(db, this.collectionName);
      
      const unsubscribe = onSnapshot(equipesCol, (snapshot) => {
        const equipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Equipe));
        
        observer.next(equipes);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }
}
