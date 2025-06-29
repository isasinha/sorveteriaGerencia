export interface EquipeModel{
    firebaseId?: string,
    idEquipe: number,
    nome: string
}

export function newBarraca(): EquipeModel{
    const equipe: EquipeModel = {
        firebaseId: "",
        idEquipe: 0,
        nome: "",
    }
    return equipe;
}


