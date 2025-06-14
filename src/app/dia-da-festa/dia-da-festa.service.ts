import { Injectable } from '@angular/core';
import { DiaDaFestaModel } from './dia-da-festa.model'

@Injectable({
  providedIn: 'root'
})
export class DiaDaFestaService {

  constructor() { }

  private pesquisar(): DiaDaFestaModel[]{
    const repositorio = [{dia:'2026-08-28', hora_inicio:'12:00:00', hora_fim:'21:00:00', dia_semana:'Sexta-feira'}]
    if(repositorio){
      const dia_da_festa = repositorio;
      return dia_da_festa
    }
    
    const dia_da_festa: DiaDaFestaModel[] = [];
    return dia_da_festa;
    
  }
  
  buscarPorDia(dia: string) : DiaDaFestaModel | undefined{
    const dia_da_festa = {dia:'2026-08-28', hora_inicio:'12:00:00', hora_fim:'21:00:00', dia_semana:'Sexta-feira'}
    return dia_da_festa;
  }

  salvar(dia_da_festa: DiaDaFestaModel){

  }

  atualizar(dia_da_festa: DiaDaFestaModel){

  }

  deletar(dia_da_festa: DiaDaFestaModel){

  }

  

}

