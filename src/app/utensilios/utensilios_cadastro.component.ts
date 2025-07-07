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
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { UtensilioModel } from './utensilio.model';
import { UtensilioService } from './utensilio.service'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-utensilios_cadastro',
  imports: [RouterLink,
            CommonModule,
            FormsModule, 
            FlexLayoutModule, 
            MatCardModule, 
            MatFormFieldModule, 
            MatInputModule, 
            MatIconModule,
            MatButtonModule,
            MatCheckboxModule,
            MatRadioModule,
            MatSelectModule
          ],
  templateUrl: './utensilios_cadastro.component.html',
  styleUrl: './utensilios_cadastro.component.scss'
})
export class Utensilios_CadastroComponent implements OnInit{

  @ViewChild('inputImagem') inputImagem!: ElementRef<HTMLInputElement>;  
  
  utensilio: UtensilioModel = {
    idUtensilio: 0,
    nome: '',
    marca: '',
    quantidade: 0,
    garantia: '',
    fonecedor: '',
    descartavel: false
  };
  firebaseId: string | null = null;
  atualizando: boolean = false;
  snack: MatSnackBar = inject(MatSnackBar);

  constructor(
    private utensilioService: UtensilioService,
    private route: ActivatedRoute,
    private router: Router
  ){}

  ngOnInit(): void {
    this.firebaseId = this.route.snapshot.paramMap.get('firebaseId');
    this.atualizando = !!this.firebaseId;    
    if (this.atualizando && this.firebaseId) {
      this.utensilioService.buscarPorId(this.firebaseId).subscribe({
        next: (res) => {
          this.utensilio = res;
        },
        error: (err) => {
          console.error('Erro ao buscar utensílio: ', err);
        }
      });
    }
    else {
      this.gerarId();
    }
  }

  async salvar() {
    if(!this.utensilio.imagem?.startsWith('data:image')){
      const texto:string = this.utensilio.imagem || ''
      await this.ajustarSalvarImagem(undefined,texto)
    }
    if (this.atualizando && this.firebaseId) {
      this.utensilioService.alterar(this.utensilio, this.firebaseId)
        .then(() => {
          this.mostrarMensagem('Utensílio atualizado com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/utensilios']);
        })
        .catch(err => {
          console.error('Erro ao alterar cadastro: ', err);
        });
    } else {
      this.utensilioService.salvar(this.utensilio)
        .then(() => {
          this.mostrarMensagem('Utensílio cadastrado com sucesso!');
          //await new Promise(f => setTimeout(f, 1000));
          this.router.navigate(['/utensilios']);
        })
        .catch(err => {
          console.error('Erro ao salvar: ', err);
        });
    }
  }

  async gerarId(){
    try{
      const proximoId = await this.utensilioService.gerarProximoId()
      this.utensilio.idUtensilio = proximoId;
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
        this.utensilio.imagem = imagemCompactada;
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
