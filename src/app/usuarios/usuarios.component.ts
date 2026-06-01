// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { UsuariosService, UsuarioLogin } from '../core/services/usuarios.service';
import { PessoasService, Pessoa } from '../core/services/pessoas.service';

export interface PessoaComLogin extends Pessoa {
  loginId?: string;
  temLogin: boolean;
  processando?: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuariosComponent implements OnInit {
  pessoas = signal<PessoaComLogin[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  searchTerm = signal<string>('');

  pessoasFiltradas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.pessoas();
    return this.pessoas().filter(p =>
      p.nome.toLowerCase().includes(term) ||
      (p.email ?? '').toLowerCase().includes(term)
    );
  });

  constructor(
    private usuariosService: UsuariosService,
    private pessoasService: PessoasService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.carregar();
  }

  async carregar(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const [pessoas, logins] = await Promise.all([
        this.pessoasService.getPessoas(),
        this.usuariosService.getUsuariosLogin()
      ]);

      const loginMap = new Map<string, UsuarioLogin>();
      logins.forEach(l => loginMap.set(l.email.toLowerCase(), l));

      const pessoasComEmail = pessoas
        .filter(p => !!p.email?.trim())
        .map(p => {
          const login = loginMap.get(p.email!.toLowerCase());
          return {
            ...p,
            loginId: login?.id,
            temLogin: !!login
          } as PessoaComLogin;
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));

      this.pessoas.set(pessoasComEmail);
    } catch {
      this.error.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  async criarLogin(pessoa: PessoaComLogin): Promise<void> {
    this.setPessoa(pessoa, { processando: true });
    try {
      await this.usuariosService.criarLogin(pessoa.id!, pessoa.nome, pessoa.email!);
      this.showSuccess(`Login criado para ${pessoa.nome}.`);
      await this.carregar();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar login.';
      this.error.set(msg);
      this.setPessoa(pessoa, { processando: false });
    }
  }

  async removerLogin(pessoa: PessoaComLogin): Promise<void> {
    if (!confirm(`Remover o login de "${pessoa.nome}"?`)) return;
    this.setPessoa(pessoa, { processando: true });
    try {
      await this.usuariosService.removerLogin(pessoa.loginId!, pessoa.email!);
      this.showSuccess(`Login de ${pessoa.nome} removido.`);
      await this.carregar();
    } catch {
      this.error.set('Erro ao remover login.');
      this.setPessoa(pessoa, { processando: false });
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  private setPessoa(pessoa: PessoaComLogin, patch: Partial<PessoaComLogin>): void {
    this.pessoas.update(list =>
      list.map(p => p.id === pessoa.id ? { ...p, ...patch } : p)
    );
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3500);
  }
}
