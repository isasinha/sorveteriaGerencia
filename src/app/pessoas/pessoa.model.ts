export interface PessoaModel{
    firebaseId?: string,
    idPessoa: number,
    idEquipe?: number,
    idFuncao?: number[],
    nome: string,
    data_nascimento: string,
    idade: number,
    telefone_res: string,
    telefone_cel: string,
    telefone_rec: string,
    email: string,
    comentarios: string,
    // endereco_logradouro: string,
    // endereco_numero: string,
    // endereco_complemento: string,
    // endereco_bairro: string,
    // endereco_cep: string,
    // endereco_cidade: string,
    // endereco_uf: string,
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

// export interface PessoaDiaUtensilioModel{
//     firebaseId?: string,
//     idPessoaDiaUtensilio: number,
//     idPessoaDia: number,
//     idUtensilio: number,
//     quantidade: number,
//     devolvido?: boolean
// }