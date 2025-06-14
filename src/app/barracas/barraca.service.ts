import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BarracaModel } from './barraca.model';

@Injectable({
  providedIn: 'root'
})
export class BarracaService {

  baseUrl: string = 'http://localhost:8080/';

  constructor(private http: HttpClient) { }


  getSomeData(id: number): Observable<BarracaModel[]>{
    return this.http.get<BarracaModel[]>(this.baseUrl + id)
  }

  private pesquisar(): BarracaModel[]{
    const repositorio = [{id: 1, nome:"barraca do Açaí", localizacao: "setor laranja"}]
    if(repositorio){
      const barracas = repositorio;
      return barracas
    }

    const barracas: BarracaModel[] = [];
    return barracas;
    
  }
 
  buscarPorId(id: number) : BarracaModel | undefined{
    const barracas = {id: 1, nome:"barraca do Açaí", localizacao: "setor laranja"}
    return barracas;
  }

  salvar(Barraca: BarracaModel){

  }

  atualizar(Barraca: BarracaModel){

  }

  deletar(Barraca: BarracaModel){

  }

  
}
