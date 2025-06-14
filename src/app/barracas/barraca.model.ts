export class BarracaModel{
    id?: number;
    nome?: string;
    localizacao?: string

    static newBarraca(){
        const barraca = new BarracaModel();


        return barraca;
    }
}

