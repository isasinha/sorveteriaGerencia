import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  
  @ViewChild('inputImagem') inputImagem!: ElementRef<HTMLInputElement>;

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
  }

  carregarUFs(){
    this.brasilApiService.listarUFs().subscribe({
      next: listaEstados => this.estados = this.destacarEstado(listaEstados.sort((a, b) => (a.sigla < b.sigla) ? -1 : 1)),
      error: erro => console.error("ocorreu um erro ao buscar UFs: ", erro)
    });
  }

  carregarMunicipios(event: MatSelectChange){
    const ufSelecionada = event.value;
    this.brasilApiService.listarMunicipios(ufSelecionada).subscribe({
      next: listaMunicipios => this.municipios = this.destacarMunicipio(listaMunicipios),
      error: erro => console.error('ocorreu um erro ao buscar municípios: ', erro)
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

  carregarImagem() {
    this.inputImagem.nativeElement.click();
  }

  ajustarSalvarImagem(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const arquivo = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDim = 200;
        const ratio = img.width / img.height;
        if (ratio > 1) {
          canvas.width = maxDim;
          canvas.height = maxDim / ratio;
        } else {
          canvas.height = maxDim;
          canvas.width = maxDim * ratio;
        }
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64Compactada = canvas.toDataURL('image/jpeg', 0.7); // qualidade 70%
        this.pessoa.imagem = base64Compactada;        
      };
    };
    reader.readAsDataURL(arquivo);
  }
}