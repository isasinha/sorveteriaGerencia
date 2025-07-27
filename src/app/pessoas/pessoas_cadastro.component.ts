

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
import { EquipeModel, FuncaoModel } from '../equipes/equipe.model';
import { EquipeService } from '../equipes/equipe.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { BrasilapiService } from '../brasilapi.service';
import { NgxMaskDirective, provideNgxMask, NgxMaskPipe} from 'ngx-mask';

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
            NgxMaskDirective,
          ],
  providers: [provideNgxMask()],
  templateUrl: './pessoas_cadastro.component.html',
  styleUrl: './pessoas_cadastro.component.scss'
})
export class Pessoas_CadastroComponent implements OnInit{
  
  @ViewChild('inputImagem') inputImagem!: ElementRef<HTMLInputElement>;

  pessoa: PessoaModel = {
    idPessoa: 0,
    idEquipe: 0,
    idFuncao: [],
    nome: '',
    data_nascimento: '',
    idade: 0,
    telefone_res: '',
    telefone_cel: '',
    telefone_rec: '',
    email: '',
    comentarios: '',
    };
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);
  equipesCadastradas: EquipeModel[] = [];
  equipeNome: string = "";
  funcoesCadastradas: FuncaoModel[] = [];
  funcoesNomes: string[] = [];

  constructor(
    private pessoaService: PessoaService,
    private equipeService: EquipeService,
    //private brasilApiService: BrasilapiService,    
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;
    this.carregarEquipes();
    this.carregarFuncoes();
    if (this.atualizando && this.firebaseId) {
      this.pessoaService.buscarPorIdPessoa(this.firebaseId).subscribe({
        next: (res) => {
          this.pessoa = res;
          if (this.pessoa.idEquipe) {
            const equipeCadastrada = this.equipesCadastradas.find(e => e.idEquipe === this.pessoa.idEquipe);
            this.equipeNome = equipeCadastrada?.nome ?? '';
          }
          if (this.pessoa.idFuncao) {
            this.funcoesNomes = []
            for (const id of this.pessoa.idFuncao) {
              const funcaoCadastrada = this.funcoesCadastradas.find(e => e.idFuncao === id);
              this.funcoesNomes.push(funcaoCadastrada?.nome ?? '')
            }
          }
          if (this.pessoa.data_nascimento){
            this.calcularIdade()
          }
        },
        error: (err) => {
          console.error('Erro ao buscar pessoa: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
  }


//usar a função abaixo para edição em lote -> não chamar em OnInit, criar um botão específico

  // funcaoUnica(){ 
  //   let pessoasCada: PessoaModel[]
  //   this.pessoaService.listarPessoas()
  //   .subscribe({
  //     next: (response) => {
  //       pessoasCada = response;
  //       for (const cadaPessoa of pessoasCada){
  //         if (!cadaPessoa.telefone_res.includes("-") ){
  //           cadaPessoa.telefone_res = this.formatarFone(cadaPessoa.telefone_res)
  //         }
  //         if (!cadaPessoa.telefone_cel.includes("-")){
  //           cadaPessoa.telefone_cel = this.formatarFone(cadaPessoa.telefone_cel)
  //         }
  //         if (!cadaPessoa.telefone_rec.includes("-")){
  //           cadaPessoa.telefone_rec = this.formatarFone(cadaPessoa.telefone_rec);
  //         }
  //         if(cadaPessoa.firebaseId)
  //         this.pessoaService.alterarPessoa(cadaPessoa, cadaPessoa.firebaseId)          
  //       }
  //     }
  //   });
  // }

  carregarEquipes(){
    this.equipeService.listarEquipes().subscribe({
      next: listaEquipes => this.equipesCadastradas = listaEquipes.sort((a, b) => (a.nome < b.nome) ? -1 : 1),
      error: erro => console.error("ocorreu um erro ao buscar Equipes: ", erro)
    });
  }

  carregarFuncoes(){
    this.equipeService.listarFuncoes().subscribe({
      next: listaFuncoes => this.funcoesCadastradas = listaFuncoes.sort((a, b) => (a.nome < b.nome) ? -1 : 1),
      error: erro => console.error("ocorreu um erro ao buscar Funções: ", erro)
    });
  }

  atualizarFuncoes(event: MatSelectChange) {
    this.funcoesNomes = event.value;
  }

  async salvar() {
    if(!this.pessoa.imagem?.startsWith('data:image')){
      const texto:string = this.pessoa.imagem || ''
      await this.ajustarSalvarImagem(undefined,texto)
    }
    const equipeCadastrada = this.equipesCadastradas.find(e => e.nome === this.equipeNome);
    this.pessoa.idEquipe = equipeCadastrada?.idEquipe ?? 0;
    this.pessoa.idFuncao = [];
    for (const nome of this.funcoesNomes) {
      const funcaoCadastrada = this.funcoesCadastradas.find(e => e.nome === nome);
      this.pessoa.idFuncao.push(funcaoCadastrada?.idFuncao ?? 0)
    }
    if (this.pessoa.telefone_res){
      this.pessoa.telefone_res = this.formatarFone(this.pessoa.telefone_res)
    }
    if (this.pessoa.telefone_cel){
      this.pessoa.telefone_cel = this.formatarFone(this.pessoa.telefone_cel)
    }
    if (this.pessoa.telefone_rec){
      this.pessoa.telefone_rec = this.formatarFone(this.pessoa.telefone_rec);
    }
    if (this.atualizando && this.firebaseId) {
      this.pessoaService.alterarPessoa(this.pessoa, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Pessoa atualizada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/pessoas']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
    } else {
      this.pessoaService.salvarPessoa(this.pessoa)
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

  formatarFone(telefone: string): string {
    let fone = telefone.replace(/\D/g, '');
    if (fone.length === 10) {
      return '(' + fone.substring(0, 2) + ') ' + fone.substring(2, 6) + '-' + fone.substring(6);
    }
    if (fone.length === 11) {
      return '(' + fone.substring(0, 2) + ') ' + fone.substring(2, 7) + '-' + fone.substring(7);
    }
    else{
      return telefone
    }
  }

  formatarData(event: any): void {
    let data = event.target.value.replace(/\D/g, '');
    if (data.length >= 8) {
      data = data.slice(0, 8);
      const partes = [];
      if (data.length >= 2) {
        partes.push(data.slice(0, 2));
      }
      if (data.length >= 4) {
        partes.push(data.slice(2, 4));
      }
      if (data.length > 4) {
        partes.push(data.slice(4));
      }
      this.pessoa.data_nascimento = partes.join('/');
      this.calcularIdade()
    }
  }
    
  calcularIdade(){    
    const [dia, mes, ano] = this.pessoa.data_nascimento.split('/').map(Number);
    const dataNasc = new Date(ano, mes - 1, dia); // mês começa do 0 (janeiro)
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const fezAniversarioEsteAno =
      hoje.getMonth() > dataNasc.getMonth() ||
      (hoje.getMonth() === dataNasc.getMonth() && hoje.getDate() >= dataNasc.getDate());
    if (!fezAniversarioEsteAno) {
      idade--;
    }
    this.pessoa.idade = idade  
  }

  async gerarId(){
    try{
      const proximoId = await this.pessoaService.gerarProximoIdPessoas()
      this.pessoa.idPessoa = proximoId;
    } catch (error){
      console.error('Erro ao gerar ID: ', error)
    }
  }
  
  carregarImagem() {
    this.inputImagem.nativeElement.click();
  }

  async ajustarSalvarImagem(event?: Event, url?: string){
    let blob: Blob | null = null;
    try {
      if(event){
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        blob = input.files[0];
      }else if(url){
        blob = await this.obterBlobDaImagem(url);
      }
      if (blob){
        const imagemCompactada = await this.compactarImagemDoBlob(blob);
        this.pessoa.imagem = imagemCompactada;
      }else{
        console.warn('Nenhuma imagem fornecida.');
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
    }
  }

  async obterBlobDaImagem(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar imagem');
    return await response.blob();
  }

  async compactarImagemDoBlob(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
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
          const base64Compactada = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64Compactada);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }  

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
}