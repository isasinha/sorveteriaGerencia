export interface BarracaModel{
    firebaseId?: string,
    idBarraca: number,
    nome: string
    localizacao: string
}

export function newBarraca(): BarracaModel{
    const barraca: BarracaModel = {
        firebaseId: "",
        idBarraca: 0,
        nome: "",
        localizacao: ""
    }
    return barraca;
}


