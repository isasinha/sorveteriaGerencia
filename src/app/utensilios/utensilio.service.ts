import { Injectable } from '@angular/core';
import { UtensilioModel } from './utensilio.model';


@Injectable({
  providedIn: 'root'
})
export class UtensilioService {

  constructor() { }

  private pesquisar(): UtensilioModel[]{
    const repositorio = [{id: 1, 
      nome:"liquidificador", 
      marca: "Black & Decker", 
      quantidade: 2, 
      garantia:"", 
      fornecedor:"Magazine Luiza", 
      descartavel:false
    }]
    if(repositorio){
      const utensilios = repositorio;
      return utensilios
    }
    
    const utensilios: UtensilioModel[] = [];
    return utensilios;
  }
  
  buscarPorId(id: number) : UtensilioModel | undefined{
    const utensilios = {id: 1, 
                        nome:"liquidificador", 
                        marca: "Black & Decker", 
                        quantidade: 2, 
                        garantia:"", 
                        fornecedor:"Magazine Luiza", 
                        descartavel:false
                      }
    return utensilios;
  }
  
  salvar(utensilio: UtensilioModel){

  }

  atualizar(utensilio: UtensilioModel){

  }

  deletar(utensilio: UtensilioModel){

  }

  
}