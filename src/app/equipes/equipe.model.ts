export interface EquipeModel{
    firebaseId?: string,
    idEquipe: number,
    nome: string,
    imagem?: string
}

export function newBarraca(): EquipeModel{
    const equipe: EquipeModel = {
        firebaseId: "",
        idEquipe: 0,
        nome: "",
        imagem: ""
    }
    return equipe;
}


