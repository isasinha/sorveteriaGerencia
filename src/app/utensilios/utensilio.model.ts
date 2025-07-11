export interface UtensilioModel{
    firebaseId?: string,
    idUtensilio: number,
    nome: string,
    marca: string,
    quantidade: number,
    garantia: string,
    fonecedor: string,
    descartavel: boolean,
    imagem?: string
}


export function newUtensilio(): UtensilioModel{
    const utensilio: UtensilioModel = {
        firebaseId: "",
        idUtensilio: 0,
        nome: "",
        marca: "",
        quantidade: 0,
        garantia: "",
        fonecedor: "",
        descartavel: false,
        imagem: ""
    }
    return utensilio;
}
