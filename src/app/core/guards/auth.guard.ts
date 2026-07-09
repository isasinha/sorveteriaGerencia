// Baseado em: https://angular.dev/guide/router#preventing-unauthorized-access
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap, take } from 'rxjs/operators';
import { from, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }

      // Usa resultado cacheado se já verificado
      const cached = authService.permissaoLoginVerificada();
      if (cached === true) return of(true);
      if (cached === false) {
        router.navigate(['/login']);
        return of(false);
      }

      // Primeira verificação: acontece aqui, com auth já estabelecido
      return from(
        authService.verificarPermissaoLogin(user.uid, user.email ?? '').then(permitido => {
          authService.permissaoLoginVerificada.set(permitido);
          if (!permitido) {
            authService.erroPermissao.set(
              'Acesso não autorizado. Apenas usuários com perfil de Recepção ou da equipe TI podem fazer login.'
            );
            authService.logout();
            return false;
          }
          return true;
        }).catch(e => {
          console.error('authGuard: erro ao verificar permissão:', e);
          authService.erroPermissao.set('Erro ao verificar permissões. Tente novamente.');
          authService.logout();
          return false;
        })
      );
    })
  );
};

export const tiGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(user => {
      if (!user) { router.navigate(['/login']); return false; }
      if (!authService.isEquipeTI()) { router.navigate(['/escala']); return false; }
      return true;
    })
  );
};
