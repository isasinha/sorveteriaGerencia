export class PessoaModel{
    idPessoa?: number;
    nome?: string;
    data_nascimento?: string;
    telefone?: string;
    email?: string;
    endereco_logradouro?: string;
    endereco_numero?: string;
    endereco_complemento?: string;
    endereco_bairro?: string;
    endereco_cep?: string;
    endereco_cidade?: string;
    endereco_uf?: string;


    static newPessoa(){
        const pessoa = new PessoaModel();


        return pessoa;
    }
}

