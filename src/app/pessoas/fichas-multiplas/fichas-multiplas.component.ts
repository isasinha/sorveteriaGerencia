import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import { EquipesService, Equipe } from '../../core/services/equipes.service';

interface PessoaComEquipe extends Pessoa {
  equipeNome?: string;
}

@Component({
  selector: 'app-fichas-multiplas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fichas-multiplas.component.html',
  styleUrl: './fichas-multiplas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FichasMultiplasComponent implements OnInit {
  pessoas = signal<PessoaComEquipe[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pessoasService: PessoasService,
    private equipesService: EquipesService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const idsParam = this.route.snapshot.queryParamMap.get('ids');
      const ids = idsParam ? idsParam.split(',') : [];

      const equipes = await this.equipesService.getEquipes();

      let pessoasList: Pessoa[] = [];
      if (ids.length === 0) {
        pessoasList = await this.pessoasService.getPessoas();
      } else {
        for (const id of ids) {
          const pessoa = await this.pessoasService.getPessoaById(id);
          if (pessoa) pessoasList.push(pessoa);
        }
      }

      const pessoasComEquipe: PessoaComEquipe[] = pessoasList.map(p => ({
        ...p,
        equipeNome: this.resolverNomeEquipes(p, equipes)
      }));

      this.pessoas.set(pessoasComEquipe);
    } catch (err) {
      console.error('Erro ao carregar fichas:', err);
      this.error.set('Erro ao carregar dados das pessoas');
    } finally {
      this.loading.set(false);
    }
  }

  private resolverNomeEquipes(pessoa: Pessoa, equipes: Equipe[]): string {
    if (!pessoa.idEquipe) return '';
    const ids = pessoa.idEquipe.toString().split(',').map(id => id.trim());
    return ids
      .map(id => {
        const equipe = equipes.find(e => e.idEquipe?.toString() === id);
        return equipe ? equipe.nome : id;
      })
      .join(', ');
  }

  imprimir(): void {
    window.print();
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }
}
