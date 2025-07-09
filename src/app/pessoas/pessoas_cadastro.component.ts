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
  equipes: EquipeModel[] = [];
  equipeNome: string = "";
  funcoes: FuncaoModel[] = [];
  funcoesNomes: string[] = [];

  constructor(
    private pessoaService: PessoaService,
    private equipeService: EquipeService,
    private brasilApiService: BrasilapiService,    
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
            const equipeCadastrada = this.equipes.find(e => e.idEquipe === this.pessoa.idEquipe);
            this.equipeNome = equipeCadastrada?.nome ?? '';
          }
          if (this.pessoa.idFuncao) {
            for (const id of this.pessoa.idFuncao) {
              const funcaoCadastrada = this.funcoes.find(e => e.idFuncao === id);
              this.funcoesNomes.push(funcaoCadastrada?.nome ?? '')
            }
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

  carregarEquipes(){
    this.equipeService.listarEquipes().subscribe({
      next: listaEquipes => this.equipes = listaEquipes.sort((a, b) => (a.nome < b.nome) ? -1 : 1),
      error: erro => console.error("ocorreu um erro ao buscar Equipes: ", erro)
    });
  }

  carregarFuncoes(){
    this.equipeService.listarFuncoes().subscribe({
      next: listaFuncoes => this.funcoes = listaFuncoes.sort((a, b) => (a.nome < b.nome) ? -1 : 1),
      error: erro => console.error("ocorreu um erro ao buscar Funções: ", erro)
    });
  }

  async salvar() {
    console.log('funções: ', this.pessoa.idFuncao)    
    if(!this.pessoa.imagem?.startsWith('data:image')){
      const texto:string = this.pessoa.imagem || ''
      await this.ajustarSalvarImagem(undefined,texto)
    }
    const equipeCadastrada = this.equipes.find(e => e.nome === this.equipeNome);
    this.pessoa.idEquipe = equipeCadastrada?.idEquipe ?? 0;
    for (const nome of this.funcoesNomes) {
      const funcaoCadastrada = this.funcoes.find(e => e.nome === nome);
        this.pessoa.idFuncao ??= [];
        this.pessoa.idFuncao.push(funcaoCadastrada?.idFuncao ?? 0)
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


//{idPessoa: NOVO, nome:'FELIPE FRANÇA BUENO (filho Denis)', idade:24, telefone_res: '', telefone_cel: '97576-9966', telefone_rec: '', email: 'felipe10bueno@hotmail.com', data_nascimento: '', comentarios: ''},
//{idPessoa: NOVO, nome:'GILVANA DO NASCIMENTO(filha Luciana)', idade:17, telefone_res: '', telefone_cel: '96606-3117', telefone_rec: '', email: 'gilvanadonascimento@hotmail.com', data_nascimento: '', comentarios: ''},
//{idPessoa: , nome:'ISA SIMONE', idade:41, telefone_res: '', telefone_cel: '99947-5583', telefone_rec: '', email: 'isasi.simone@gmail.com', data_nascimento: '', comentarios: ''},
//{idPessoa: NOVO, nome:'LUCAS ESPINOSA DO AMARAL PEREIRA(sobrinho Waldir)', idade:16, telefone_res: '', telefone_cel: '99372-0615', telefone_rec: '', email: 'lucas.espinosa081108@gmail.com', data_nascimento: '', comentarios: ''},
//{idPessoa: NOVO, nome:'LUIGI BIANCHINI OLIVEIRA(filho Luciana)', idade:16, telefone_res: '', telefone_cel: '94714-1372', telefone_rec: '', email: 'luigibianchini2008@gmail.com', data_nascimento: '', comentarios: ''},
//{idPessoa: NOVA, nome:'MARCIA PEREIRA DA FONSECA (amiga Rosangela)', idade:63, telefone_res: '', telefone_cel: '', telefone_rec: '', email: 'mpfonse@yahoo.com.br', data_nascimento: '', comentarios: ''},
//{idPessoa: , nome:'MELISSA BREE RAMOS DA SILVA(filha Rosilândia/José Maria) ', idade:19, telefone_res: '', telefone_cel: '95302-9051', telefone_rec: '', email: 'rosibree@gmail.com', data_nascimento: '', comentarios: ''},
//{idPessoa: , nome:'SUELI GARCIA', idade: 0, telefone_res: '', telefone_cel: '99172-7497', telefone_rec: '', email: '', data_nascimento: '', comentarios: ''},

    



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