import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import { EquipesService, Equipe } from '../../core/services/equipes.service';

@Component({
  selector: 'app-ficha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ficha.component.html',
  styleUrl: './ficha.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FichaComponent implements OnInit {
  pessoa = signal<Pessoa | null>(null);
  equipes = signal<Equipe[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pessoasService: PessoasService,
    private equipesService: EquipesService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.error.set('ID da pessoa não fornecido');
        this.loading.set(false);
        return;
      }
      const [pessoa, equipes] = await Promise.all([
        this.pessoasService.getPessoaById(id),
        this.equipesService.getEquipes()
      ]);
      if (pessoa) {
        this.pessoa.set(pessoa);
        this.equipes.set(equipes);
      } else {
        this.error.set('Pessoa não encontrada');
      }
    } catch (err) {
      console.error('Erro ao carregar ficha:', err);
      this.error.set('Erro ao carregar dados da pessoa');
    } finally {
      this.loading.set(false);
    }
  }

  getNomesEquipes(): string {
    const pessoa = this.pessoa();
    if (!pessoa?.idEquipe) return '';
    const ids = pessoa.idEquipe.toString().split(',').map(id => id.trim());
    return ids
      .map(id => {
        const equipe = this.equipes().find(e => e.idEquipe?.toString() === id);
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
