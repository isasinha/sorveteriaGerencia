import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'
import { BarracaModel } from './barraca.model';
import { BarracaService } from './barraca.service'; 
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-barracas-cadastro',
  imports: [ 
            RouterLink,
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule,
          ],
  templateUrl: './barracas_cadastro.component.html',
  styleUrl: './barracas_cadastro.component.scss'
})
export class Barracas_CadastroComponent implements OnInit{

  @ViewChild('inputImagem') inputImagem!: ElementRef<HTMLInputElement>;

  barraca: BarracaModel = {
    idBarraca: 0,
    nome: '',
    localizacao: '',
    imagem: ''
  };
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);
  imagemCarregada: string | null = null;

  constructor(
    private barracaService: BarracaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;    
    if (this.atualizando && this.firebaseId) {
      this.barracaService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.barraca = res;
        },
        error: (err) => {
          console.error('Erro ao buscar barraca: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
  }

  salvar(): void {
    if (this.atualizando && this.firebaseId) {
      this.barracaService.alterar(this.barraca, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Barraca atualizada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/barracas']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
    } else {
      this.barracaService.salvar(this.barraca)
        .then(() => {
          this.mostrarMensagem('Barraca cadastrada com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/barracas']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
    }
  }

  
  async gerarId(){
    try{
      const proximoId = await this.barracaService.gerarProximoId()
      this.barraca.idBarraca = proximoId;
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
        this.barraca.imagem = base64Compactada;        
      };
    };
    reader.readAsDataURL(arquivo);
  }
}
