import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule} from '@angular/material/icon'
import { enableProdMode } from '@angular/core';
import { LoginService } from './login/login.service';
import { filter } from 'rxjs/operators';

enableProdMode();

@Component({
  selector: 'app-root',
  imports: [CommonModule,
            RouterOutlet, 
            RouterLink,
            MatToolbarModule,
            MatIconModule,
          ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sorveteriaGerencia';

  constructor(private loginService: LoginService, router: Router){
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
  }

  async logout(){
    try {
      await this.loginService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  isLogado(): boolean {
    return this.loginService.usuarioLogado() !== null;
  }
}
