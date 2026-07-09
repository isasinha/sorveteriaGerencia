// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-layout.component.html',
  styleUrl: './sidebar-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarLayoutComponent {
  authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
