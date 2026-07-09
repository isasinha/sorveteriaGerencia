// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  email = signal<string>('');
  password = signal<string>('');
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Reage reativamente ao erro de permissão (funciona mesmo sem recriar o componente)
    effect(() => {
      const erro = this.authService.erroPermissao();
      if (erro) {
        this.error.set(erro);
        this.authService.erroPermissao.set(null);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  async onLogin(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);

    try {
      await this.authService.login(this.email(), this.password());
      // Redirecionamento é feito pelo serviço
    } catch (error: any) {
      this.error.set(error.message || 'Erro ao fazer login');
    } finally {
      this.loading.set(false);
    }
  }
}
