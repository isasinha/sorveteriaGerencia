export interface BarracaModel{
    firebaseId?: string,
    idBarraca: number,
    nome: string,
    localizacao: string,
    imagem?: string
}

export function newBarraca(): BarracaModel{
    const barraca: BarracaModel = {
        firebaseId: "",
        idBarraca: 0,
        nome: "",
        localizacao: "",
        imagem: ""
    }
    return barraca;
}


