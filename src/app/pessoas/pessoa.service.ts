import { Injectable } from '@angular/core';
import { PessoaModel } from './pessoa.model';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {

  constructor() { }
  
  private pesquisar(): PessoaModel[]{
    const repositorio = [{  id: 1, 
                            nome: "Maria das Dores Rodrigues", 
                            data_nascimento: "1951-05-20", 
                            telefone: "(11) 99947-5583",
                            email: "isasi.simone@gmail.com",
                            endereco_logradouro: "Rua Taquari", 
                            endereco_numero: "956", 
                            endereco_complemento: "apto 52", 
                            endereco_bairro: "Mooca", 
                            endereco_cep: "03166-001", 
                            endereco_cidade: "São Paulo", 
                            endereco_uf: "SP"
                        }]
    if(repositorio){
      const pessoas = repositorio;
      return pessoas
    }

    const pessoas: PessoaModel[] = [];
    return pessoas;    
  }

  buscarPorId(id: number) : PessoaModel | undefined{
      const pessoas = {   id: 1, 
                          nome: "Maria das Dores Rodrigues", 
                          data_nascimento: "1951-05-20", 
                          telefone: "(11) 99947-5583", 
                          email: "isasi.simone@gmail.com",
                          endereco_logradouro: "Rua Taquari", 
                          endereco_numero: "956", 
                          endereco_complemento: "apto 52", 
                          endereco_bairro: "Mooca", 
                          endereco_cep: "03166-001", 
                          endereco_cidade: "São Paulo", 
                          endereco_uf: "SP"
                      }
      return pessoas  
  }

  salvar(pessoa: PessoaModel){

  }

  atualizar(pessoa: PessoaModel){

  }

  deletar(pessoa: PessoaModel){

  }


}
