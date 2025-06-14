import { Component, inject } from '@angular/core';
import { BarracaService } from './barraca.service';
import { BarracaModel } from './barraca.model';


@Component({
  selector: 'app-barracas_detalhe',
  templateUrl: './barracas_detalhe.component.html',
  styles: ``,
  providers: [BarracaService]
})
export class Barracas_DetalheComponent {
  public data: BarracaModel[] = [];

  constructor(private myService: BarracaService) { }

  getData() {
    console.log("passei aqui component");
    this.myService.getSomeData(2).subscribe({
      next: (response:BarracaModel[]) => {
        this.data = response;//JSON.stringify(response);
        console.log("passei aqui component com dados")
        console.log("barracas", this.data)
      },
      error: (error: any) => {
        console.log("passei aqui component com erro");
        console.error('Error:', error);
      },
    });
  }

}
