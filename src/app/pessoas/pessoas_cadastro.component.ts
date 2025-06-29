import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout'
import { MatCardModule} from '@angular/material/card'
import { MatFormFieldModule} from '@angular/material/form-field'
import { MatInputModule} from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button'
import { MatSnackBar } from '@angular/material/snack-bar'
import { PessoaModel } from './pessoa.model';
import { PessoaService } from './pessoa.service'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { BrasilapiService } from '../brasilapi.service';
import { Estado, Municipio } from '../brasilapi.model';
import { NgxMaskDirective, provideNgxMask} from 'ngx-mask';

@Component({
  selector: 'app-pessoas_cadastro',
  imports: [RouterLink,          
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule,
            MatSelectModule,
            NgxMaskDirective
          ],
  providers: [provideNgxMask()],
  templateUrl: './pessoas_cadastro.component.html',
  styleUrl: './pessoas_cadastro.component.scss'
})
export class Pessoas_CadastroComponent implements OnInit{

  pessoa: PessoaModel = {
    idPessoa: 0,
    nome: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    endereco_logradouro: '',
    endereco_numero: '',
    endereco_complemento: '',
    endereco_bairro: '',
    endereco_cep: '',
    endereco_cidade: '',
    endereco_uf: ''
    };
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);
  estados: Estado[] = [];
  municipios: Municipio[] = [];

  constructor(
    private pessoaService: PessoaService,
    private brasilApiService: BrasilapiService,    
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;    
    if (this.atualizando && this.firebaseId) {
      this.pessoaService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.pessoa = res;
          if(this.pessoa.endereco_uf){
              const event = {value: this.pessoa.endereco_uf}
              this.carregarMunicipios(event as MatSelectChange);
            }     
        },
        error: (err) => {
          console.error('Erro ao buscar utensílio: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
    this.carregarUFs();
    // this.route.queryParamMap.subscribe((query:any) => {
    //   const params = query['params']
    //   const id = params['id']
    //   if(id){
    //     let pessoaEncontrada = this.pessoaService.buscarPorId(id);
    //     if(pessoaEncontrada){
    //       this.atualizando = true;
    //       this.pessoa = pessoaEncontrada;
    //        if(this.pessoa.endereco_uf){
    //           const event = {value: this.pessoa.endereco_uf}
    //           this.carregarMunicipios(event as MatSelectChange);
    //         }        
    //     }
    //   }
    // })
    // this.carregarUFs();
  }

  carregarUFs(){
    //observable notifica o subscriber (porque a requisição é assíncrona)
    this.brasilApiService.listarUFs().subscribe({
      next: listaEstados => this.estados = this.destacarEstado(listaEstados.sort((a, b) => (a.sigla < b.sigla) ? -1 : 1)),
      error: erro => console.log("ocorreu um erro ao buscar UFs: ", erro)
    });
  }

  carregarMunicipios(event: MatSelectChange){
    const ufSelecionada = event.value;
    this.brasilApiService.listarMunicipios(ufSelecionada).subscribe({
      next: listaMunicipios => this.municipios = this.destacarMunicipio(listaMunicipios),
      error: erro => console.log('ocorreu um erro ao buscar municípios: ', erro)
    })
  }

  
  destacarEstado(listaEstados: Estado[]){
    const estadoDestacado = 'SP'; 
    const index = listaEstados.findIndex(municipio => municipio.sigla === estadoDestacado);

    if (index > -1) {
      const municipio = listaEstados.splice(index, 1)[0];
      listaEstados.unshift(municipio); // Move para o início
    }
    return listaEstados;
  }

  destacarMunicipio(listaMunicipios: Municipio[]){
    const municipioDestacado = 'SÃO PAULO'; 
    const index = listaMunicipios.findIndex(municipio => municipio.nome === municipioDestacado);

    if (index > -1) {
      const municipio = listaMunicipios.splice(index, 1)[0];
      listaMunicipios.unshift(municipio); // Move para o início
    }
    return listaMunicipios;
  }

  salvar(): void {
    if (this.atualizando && this.firebaseId) {
      this.pessoaService.alterar(this.pessoa, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Pessoa atualizada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/pessoas']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
    } else {
      this.pessoaService.salvar(this.pessoa)
        .then(() => {
          this.mostrarMensagem('Pessoa cadastrada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/pessoas']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
    }
  }

  alterarFoto(event: Event) {
    //event.preventDefault();    
  }

  async gerarId(){
    try{
      const proximoId = await this.pessoaService.gerarProximoId()
      this.pessoa.idPessoa = proximoId;
    } catch (error){
      console.error('Erro ao gerar ID: ', error)
    }
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
  
}
