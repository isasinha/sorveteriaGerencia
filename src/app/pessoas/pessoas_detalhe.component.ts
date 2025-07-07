import { Component, inject, model, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaService } from './pessoa.service';
import { PessoaModel, PessoaDiaModel, PessoaDiaUtensilioModel } from './pessoa.model';
import { EquipeService } from '../equipes/equipe.service';
import { DiaDaFestaService } from '../dia-da-festa/dia-da-festa.service';
import { DiaDaFestaModel } from '../dia-da-festa/dia-da-festa.model';
import { UtensilioService } from '../utensilios/utensilio.service';
import { UtensilioModel } from '../utensilios/utensilio.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-pessoas_detalhe',
  imports: [RouterLink,
            CommonModule,
            FlexLayoutModule, 
            MatCardModule, 
            MatIconModule,
            MatTableModule,
            MatButtonModule,
            MatInputModule,
            FormsModule,
            MatSelectModule,
            MatListModule,
            MatCheckbox
          ],
  templateUrl: './pessoas_detalhe.component.html',
  styleUrl: './pessoas_detalhe.component.scss'
})
export class Pessoas_DetalheComponent implements OnInit{
  
  pessoa: PessoaModel = {
    idPessoa: 0,
    idEquipe: 0,
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
  pessoaDia: PessoaDiaModel = {
    idPessoaDia: 0,
    idPessoa: 0,
    idDia: 0,
    previsaoParticipacao: false,
    previsaoChegada: this.formataHora('01/01/2001 00:00'),
    previsaoSaida: this.formataHora('01/01/2001 00:00'),
    concretoParticipacao: false,
    concretoChegada: this.formataHora('01/01/2001 00:00'),
    concretoSaida: this.formataHora('01/01/2001 00:00')
  }

  // pessoaDiaUtensilio: PessoaDiaUtensilioModel = {
  //   idPessoaDiaUtensilio: 0,
  //   idPessoaDia: 0,
  //   idUtensilio: 0,
  //   quantidade: 0,
  //   devolvido: false
  // }

  utensilioSelecionado = {
    nome: "",
    quantidade: 0,
    devolvido: false
  }

  nomeEquipe: string = '';
  datas: DiaDaFestaModel [] = []
  utensiliosCadastrados: UtensilioModel [] = []
  utensiliosSelecionados: any[] = []
  pessoaDiaUtensilios: PessoaDiaUtensilioModel [] = []
  firebaseIdPessoa: string | null = null;
  idDia: number | null = 0;
  snack: MatSnackBar = inject(MatSnackBar);
  colunasTable: string[] = ["entregue", "quantidade", "devolvido", "remover"];
  atualizando: boolean = false  // isa padrão false
  //disabledParticipara: boolean = true // isa padrão true
  alterarLinha: boolean = false
    
  constructor(
              private pessoaService: PessoaService,
              private equipeService: EquipeService,
              private diaDaFestaService: DiaDaFestaService,
              private utensilioService: UtensilioService,
              private route: ActivatedRoute,
              private router: Router
            ) {}
  
  ngOnInit(): void {
    console.log(
      "no init ......",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )

    this.firebaseIdPessoa = this.route.snapshot.paramMap.get('firebaseId');
    if (this.firebaseIdPessoa) {
      this.pessoaService.buscarPorIdPessoa(this.firebaseIdPessoa).subscribe({
        next: (res) => {
          this.pessoa = res;
          this.equipeService.buscarNomeEquipe(this.pessoa?.idEquipe ?? 0)
          .then(nomeEquipe => this.nomeEquipe = nomeEquipe ?? '');          
        },
        error: (err) => {
          console.error('Erro ao buscar pessoa ou equipe: ', err);
        }
      });
    }
    this.diaDaFestaService.listar().subscribe({
      next: (response) => {
        this.datas = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.utensilioService.listar().subscribe({
      next: (response) => {
        this.utensiliosCadastrados = response;
      },
      error: (err) => {
        console.error(err);
      }
    });
    console.log(
      "no final do init: ......",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
  }

  formataHora(hora:string){
    return new Date(hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })    
  }

  excluir() {
    if (this.firebaseIdPessoa) {
      this.pessoaService.deletarPessoa(this.firebaseIdPessoa)
        .then(() => {
          this.mostrarMensagem('Pessoa excluído com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/pessoas']);
        })
        .catch(err => {
          console.error('Erro ao excluir: ', err);
        });
    }
  }

  selecionarData(event: MatSelectChange){
    console.log("entrei")
    console.log(
      "no selecionar data:.......",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
    //zerando variáveis
    this.idDia = 0;
    this.pessoaDia = {
      idPessoaDia: 0,
      idPessoa: 0,
      idDia: 0,
      previsaoParticipacao: false,
      previsaoChegada: this.formataHora('01/01/2001 00:00'),
      previsaoSaida: this.formataHora('01/01/2001 00:00'),
      concretoParticipacao: false,
      concretoChegada: this.formataHora('01/01/2001 00:00'),
      concretoSaida: this.formataHora('01/01/2001 00:00')
    }
    this.pessoaDiaUtensilios = []
    this.utensiliosSelecionados = []
    
    console.log(
      "no selecionar data: zerando variaveis : .......",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
    const dataSelecionada = event.value;
    console.log("dataSelecionada", dataSelecionada)
    const diaDaFestaSelecionado = this.datas.find(data => data.dia === dataSelecionada)
    console.log("diaDaFestaSelecionado", diaDaFestaSelecionado)
    this.idDia = diaDaFestaSelecionado?.idDia ?? 0;
    console.log("idDia", this.idDia)
    //this.disabledParticipara = false

    this.atualizando = true
    console.log(
      "no meio de selecionar data: .......",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
    if(this.pessoa.idPessoa && this.idDia){
      console.log("entrei aqui também")
      this.pessoaService.listarPessoaDia(this.pessoa.idPessoa, this.idDia).subscribe({
        next: (response) => {
          this.pessoaDia = response[0];
          console.log("this.pessoaDia", this.pessoaDia)
          if(this.pessoaDia.idPessoaDia){
            this.pessoaService.listarPessoaDiaUtensilio(this.pessoaDia.idPessoaDia).subscribe({
              next: (response) => {
                this.pessoaDiaUtensilios = response;
                console.log("this.pessoaDiaUtensilios", this.pessoaDiaUtensilios)
                if(this.pessoaDiaUtensilios){
                  this.pessoaDiaUtensilios.forEach(element => {
                    const utensilioEncontrado = this.utensiliosCadastrados.find(u => u.idUtensilio === element.idUtensilio)
                    this.utensilioSelecionado.nome = utensilioEncontrado?.nome || ''
                    this.utensilioSelecionado.quantidade = element.quantidade || 0
                    this.utensilioSelecionado.devolvido = element.devolvido || false
                    this.utensiliosSelecionados.push(this.utensilioSelecionado);
                    this.utensilioSelecionado = {
                      nome: "",
                      quantidade: 0,
                      devolvido: false
                    }
                  });
                }
              },
              error: (err) => {
                console.error(err);
              }
            });
          }
        },
        error: (err) => {
          console.error(err);
        }
      });

    }
    console.log(
      "no final de selecionar data: ........",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
  }

  salvarPessoaDia(){
    console.log("pessoaDia",this.pessoaDia)
  }

  salvarPessoaDiaUtensilio(){
    console.log("pessoaDia",this.pessoaDia)
  }

  participara(){
    console.log(
      "no participara: .......",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
    if(!this.pessoaDia.previsaoParticipacao){
      this.pessoaDia.concretoParticipacao = false
    }
    console.log(
      "no final do participara: .........",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
  }

  participou(){
    console.log(
      "no participou: .........",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
    this.pessoaDia.concretoParticipacao = !this.pessoaDia.concretoParticipacao
    //console.log("this.pessoaDia.concretoParticipacao",this.pessoaDia.concretoParticipacao)
    console.log(
      "no final do participou: .........",
      "pessoa: Maria: ...... ",this.pessoa,
      "pessoaDia dia1, pessoa1: ......",this.pessoaDia,
      "utensilioSelecionado auxiliar não usado: ......",this.utensilioSelecionado,
      "utensiliosCadastrados lista de utensilios no BD: ......",this.utensiliosCadastrados,
      "utensiliosSelecionados para listar não usado: ......",this.utensiliosSelecionados,
      "pessoaDiaUtensilios está no BD não usado no front: ......",this.pessoaDiaUtensilios,
      "idDia pega o dia selecionado no front: ......",this.idDia,
      //"disabledParticipara", this.disabledParticipara,
    )
  }

  async adicionarLinha() {
    this.utensiliosSelecionados.push({
      // idPessoaDiaUtensilio: await this.pessoaService.gerarProximoIdPessoaDiaUtensilio(),
      // idPessoaDia: this.pessoaDia.idPessoaDia,
      // idUtensilio: 0,
      nome: '',
      quantidade: 0,
      devolvido: false
    });
  }

  removerLinha(index: number): void {
    this.utensiliosSelecionados.splice(index, 1);
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
  
}
  
