export interface PessoaModel{
    firebaseId?: string,
    idPessoa: number,
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
    endereco_uf: string
}


export function newPessoa(): PessoaModel{
    const pessoa: PessoaModel = {
    firebaseId: "",
    idPessoa: 0,
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
    endereco_uf: ""
    }
    return pessoa;
}