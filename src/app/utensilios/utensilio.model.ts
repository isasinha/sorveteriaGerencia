export class UtensilioModel{
    id?: number;
    nome?: string;
    marca?: string;
    quantidade?: number;
    garantia?: string;
    fonecedor?: string;
    descartavel?: boolean;


    static newUtensilio(){
        const utensilio = new UtensilioModel();


        return utensilio;
    }
}

