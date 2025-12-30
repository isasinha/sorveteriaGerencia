import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-cracha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cracha.component.html',
  styleUrl: './cracha.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrachaComponent implements OnInit {
  pessoa = signal<Pessoa | null>(null);
  qrCodeDataUrl = signal<string>('');
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  formato = signal<'paisagem' | 'retrato'>('paisagem');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pessoasService: PessoasService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.error.set('ID da pessoa não fornecido');
        this.loading.set(false);
        return;
      }

      const pessoa = await this.pessoasService.getPessoaById(id);
      if (pessoa) {
        this.pessoa.set(pessoa);
        
        // Gerar QR Code
        const url = `${window.location.origin}/pessoa/${id}`;
        const qrCode = await QRCode.toDataURL(url, { width: 150, margin: 1 });
        this.qrCodeDataUrl.set(qrCode);
      } else {
        this.error.set('Pessoa não encontrada');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      this.error.set('Erro ao carregar dados da pessoa');
    } finally {
      this.loading.set(false);
    }
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
