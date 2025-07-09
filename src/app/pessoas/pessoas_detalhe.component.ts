import { Component, inject, model, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaService } from './pessoa.service';
import { PessoaModel, PessoaDiaModel } from './pessoa.model';
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
    idade: 0,
    telefone_res: '',
    telefone_cel: '',
    telefone_rec: '',
    email: '',
    comentarios: '',
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

  nomeEquipe: string = '';
  nomesFuncoes: string [] = [];
  datas: DiaDaFestaModel [] = []
  firebaseIdPessoa: string | null = null;
  idDia: number | null = 0;
  snack: MatSnackBar = inject(MatSnackBar);
  atualizando: boolean = false  // isa padrão false
  //disabledParticipara: boolean = true // isa padrão true
    
  constructor(
              private pessoaService: PessoaService,
              private equipeService: EquipeService,
              private diaDaFestaService: DiaDaFestaService,
              private route: ActivatedRoute,
              private router: Router
            ) {}
  
  ngOnInit(): void {
    this.firebaseIdPessoa = this.route.snapshot.paramMap.get('firebaseId');
    if (this.firebaseIdPessoa) {
      this.pessoaService.buscarPorIdPessoa(this.firebaseIdPessoa).subscribe({
        next: (res) => {
          this.pessoa = res;
          this.equipeService.buscarNomeEquipe(this.pessoa?.idEquipe ?? 0)
          .then(nomeEquipe => this.nomeEquipe = nomeEquipe ?? '');          
          this.equipeService.buscarNomesFuncoes(this.pessoa?.idFuncao ?? [])
          .then(nomesFuncoes => this.nomesFuncoes = nomesFuncoes ?? []);          
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

    const dataSelecionada = event.value;
    const diaDaFestaSelecionado = this.datas.find(data => data.dia === dataSelecionada)
    this.idDia = diaDaFestaSelecionado?.idDia ?? 0;
    console.log("idDia", this.idDia)
    //this.disabledParticipara = false
    this.atualizando = true
    if(this.pessoa.idPessoa && this.idDia){
      this.pessoaService.listarPessoaDia(this.pessoa.idPessoa, this.idDia).subscribe({
        next: (response) => {
          this.pessoaDia = response[0];
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  salvarPessoaDia(){
    console.log("pessoaDia",this.pessoaDia)
  }

  participara(){
    if(!this.pessoaDia.previsaoParticipacao){
      this.pessoaDia.concretoParticipacao = false
    }
  }

  participou(){
    this.pessoaDia.concretoParticipacao = !this.pessoaDia.concretoParticipacao
    //console.log("this.pessoaDia.concretoParticipacao",this.pessoaDia.concretoParticipacao)
  }

  mostrarMensagem(mensagem: string){
    this.snack.open(mensagem, "Ok", {duration: 2000});
  }
  
}
  
