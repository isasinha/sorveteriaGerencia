// Baseado em: https://firebase.google.com/docs/firestore/quickstart
import { Injectable } from '@angular/core';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase.config';

export interface ItemStatus {
  entregue: boolean;
  devolvido: boolean;
}

export interface ChapelariaStatus {
  numero: string;
  entregue: boolean;
  devolvido: boolean;
}

export interface Presenca {
  id?: string;
  idPessoa: string | number;
  idDia: number;
  ano: number;
  sequencia: number;
  horaChegada: string;
  horaSaida: string;
  idEquipe: string;
  itensStatus?: Record<string, ItemStatus>;
  chapelaria?: ChapelariaStatus;
}

@Injectable({
  providedIn: 'root'
})
export class PresencaService {
  private collectionName = 'presenca';

  async getPresencasByAno(ano: number): Promise<Presenca[]> {
    const q = query(collection(db, this.collectionName), where('ano', '==', ano));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        sequencia: data['sequencia'] ?? 1,
        idEquipe: data['idEquipe'] ?? '',
        itensStatus: data['itensStatus'] ?? {},
        chapelaria: data['chapelaria'] ?? { numero: '', entregue: false, devolvido: false }
      } as Presenca;
    });
  }

  async savePresenca(presenca: Presenca): Promise<string> {
    const fields = {
      idPessoa: presenca.idPessoa,
      idDia: presenca.idDia,
      ano: presenca.ano,
      sequencia: presenca.sequencia,
      horaChegada: presenca.horaChegada,
      horaSaida: presenca.horaSaida,
      idEquipe: presenca.idEquipe,
      itensStatus: presenca.itensStatus ?? {},
      chapelaria: presenca.chapelaria ?? { numero: '', entregue: false, devolvido: false }
    };
    if (presenca.id) {
      await updateDoc(doc(db, this.collectionName, presenca.id), fields);
      return presenca.id;
    }
    const q = query(
      collection(db, this.collectionName),
      where('idPessoa', '==', presenca.idPessoa),
      where('idDia', '==', presenca.idDia),
      where('ano', '==', presenca.ano),
      where('sequencia', '==', presenca.sequencia)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(doc(db, this.collectionName, snap.docs[0].id), fields);
      return snap.docs[0].id;
    }
    const ref = await addDoc(collection(db, this.collectionName), fields);
    return ref.id;
  }

  async deletePresenca(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}
