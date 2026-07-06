// Baseado em: https://firebase.google.com/docs/firestore/quickstart
import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase.config';

export interface Item {
  id?: string;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItensService {
  private collectionName = 'itens';

  async getItens(): Promise<Item[]> {
    const snap = await getDocs(collection(db, this.collectionName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Item));
  }

  async addItem(nome: string): Promise<Item> {
    // evita duplicata (case-insensitive)
    const snap = await getDocs(collection(db, this.collectionName));
    const existe = snap.docs.find(
      d => (d.data()['nome'] as string).trim().toLowerCase() === nome.trim().toLowerCase()
    );
    if (existe) return { id: existe.id, nome: existe.data()['nome'] };
    const ref = await addDoc(collection(db, this.collectionName), { nome: nome.trim() });
    return { id: ref.id, nome: nome.trim() };
  }

  async updateItem(id: string, nome: string): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), { nome: nome.trim() });
  }

  async deleteItem(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}
