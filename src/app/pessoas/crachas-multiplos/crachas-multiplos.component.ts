import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import QRCode from 'qrcode';

interface PessoaComQR extends Pessoa {
  qrCodeDataUrl?: string;
}

@Component({
  selector: 'app-crachas-multiplos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crachas-multiplos.component.html',
  styleUrl: './crachas-multiplos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrachasMultiplosComponent implements OnInit {
  pessoas = signal<PessoaComQR[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  formato = signal<'paisagem' | 'retrato'>('paisagem');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pessoasService: PessoasService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Recuperar IDs selecionados dos query params
      const idsParam = this.route.snapshot.queryParamMap.get('ids');
      const ids = idsParam ? idsParam.split(',') : [];
      
      if (ids.length === 0) {
        // Se não houver seleção, buscar todas as pessoas
        await this.carregarTodasPessoas();
      } else {
        await this.carregarPessoasSelecionadas(ids);
      }
    } catch (err) {
      console.error('Erro ao carregar pessoas:', err);
      this.error.set('Erro ao carregar dados das pessoas');
      this.loading.set(false);
    }
  }

  private async carregarTodasPessoas(): Promise<void> {
    const todasPessoas = await this.pessoasService.getPessoas();
    await this.gerarQRCodes(todasPessoas);
  }

  private async carregarPessoasSelecionadas(ids: string[]): Promise<void> {
    const pessoas: Pessoa[] = [];
    
    for (const id of ids) {
      const pessoa = await this.pessoasService.getPessoaById(id);
      if (pessoa) {
        pessoas.push(pessoa);
      }
    }
    
    await this.gerarQRCodes(pessoas);
  }

  private async gerarQRCodes(pessoas: Pessoa[]): Promise<void> {
    const pessoasComQR: PessoaComQR[] = [];
    
    for (const pessoa of pessoas) {
      const url = `${window.location.origin}/pessoa/${pessoa.id}`;
      const qrCode = await QRCode.toDataURL(url, { width: 150, margin: 1 });
      pessoasComQR.push({ ...pessoa, qrCodeDataUrl: qrCode });
    }
    
    this.pessoas.set(pessoasComQR);
    this.loading.set(false);
  }

  imprimir(): void {
    window.print();
  }

  alternarFormato(formato: 'paisagem' | 'retrato'): void {
    this.formato.set(formato);
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }
}
