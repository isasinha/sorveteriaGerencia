import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule} from '@angular/material/icon'
import { enableProdMode } from '@angular/core';

enableProdMode();

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, 
            RouterLink,
            MatToolbarModule,
            MatIconModule,
          ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sorveteriaGerencia';

  logout(){

  }
}
