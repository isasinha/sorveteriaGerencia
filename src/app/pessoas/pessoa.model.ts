import { Timestamp } from "firebase/firestore";

export interface PessoaModel{
    firebaseId?: string,
    idPessoa: number,
    idEquipe?: number,
    nome: string,
    data_nascimento: string,
    telefone: string,
    email: string,
    endereco_logradouro: string,
    endereco_numero: string,
    endereco_complemento: string,
    endereco_bairro: string,
    endereco_cep: string,
    endereco_cidade: string,
    endereco_uf: string,
    imagem?: string
}

export interface PessoaDiaModel{
    firebaseId?: string,
    idPessoaDia: number,
    idPessoa: number,
    idDia: number,
    previsaoParticipacao: boolean,
    previsaoChegada: string,
    previsaoSaida: string
    concretoParticipacao: boolean,
    concretoChegada: string,
    concretoSaida: string
}

export interface PessoaDiaUtensilioModel{
    firebaseId?: string,
    idPessoaDiaUtensilio: number,
    idPessoaDia: number,
    idUtensilio: number,
    quantidade: number,
    devolvido?: boolean
}

export function newPessoa(): PessoaModel{
    const pessoa: PessoaModel = {
    firebaseId: "",
    idPessoa: 0,
    idEquipe: 0,
    nome: "",
    data_nascimento: "",
    telefone: "",
    email: "",
    endereco_logradouro: "",
    endereco_numero: "",
    endereco_complemento: "",
    endereco_bairro: "",
    endereco_cep: "",
    endereco_cidade: "",
    endereco_uf: "",
    imagem: ""
    }
    return pessoa;
}