// Baseado em: https://angular.dev/guide/components
import { Component, input, output, ChangeDetectionStrategy, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipe, EquipesService } from '../../core/services/equipes.service';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import { PessoaDetalhesComponent } from '../../pessoas/pessoa-detalhes/pessoa-detalhes.component';

@Component({
  selector: 'app-equipe-detalhes',
  standalone: true,
  imports: [CommonModule, PessoaDetalhesComponent],
  templateUrl: './equipe-detalhes.component.html',
  styleUrl: './equipe-detalhes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipeDetalhesComponent implements OnInit {
  equipe = input.required<Equipe>();
  totalEquipes = input<number>(0);
  indiceAtual = input<number>(0);
  close = output<void>();
  excluir = output<Equipe>();
  editar = output<Equipe>();
  anterior = output<void>();
  proximo = output<void>();
  
  pessoas = signal<Pessoa[]>([]);
  equipes = signal<Equipe[]>([]);
  pessoaSelecionada = signal<Pessoa | null>(null);
  
  pessoasDaEquipe = computed(() => {
    const equipe = this.equipe();
    if (!equipe.idEquipe) return [];
    
    return this.pessoas().filter(p => {
      if (Array.isArray(p.idEquipe)) {
        return p.idEquipe.some(id => id.toString() === equipe.idEquipe?.toString());
      }
      return p.idEquipe?.toString() === equipe.idEquipe?.toString();
    }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  });
  
  constructor(private pessoasService: PessoasService, private equipesService: EquipesService) {
    effect(() => {
      // Recarregar pessoas quando a equipe mudar
      this.equipe();
      this.carregarPessoas();
    });
  }
  
  async ngOnInit() {
    await this.carregarPessoas();
    await this.carregarEquipes();
  }
  
  async carregarPessoas() {
    try {
      const pessoas = await this.pessoasService.getPessoas();
      this.pessoas.set(pessoas);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  }
  
  async carregarEquipes() {
    try {
      const equipes = await this.equipesService.getEquipes();
      this.equipes.set(equipes);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    }
  }
  
  getNomesEquipes(idEquipe: string | number | string[] | undefined): string {
    if (!idEquipe) return '-';
    
    if (Array.isArray(idEquipe)) {
      const nomes = idEquipe
        .map(id => this.equipes().find(e => e.idEquipe?.toString() === id.toString())?.nome)
        .filter(Boolean);
      return nomes.join(', ') || '-';
    }
    
    const equipe = this.equipes().find(e => e.idEquipe?.toString() === idEquipe.toString());
    return equipe?.nome || '-';
  }
  
  abrirDetalhesPessoa(pessoa: Pessoa): void {
    this.pessoaSelecionada.set(pessoa);
  }
  
  fecharDetalhesPessoa(): void {
    this.pessoaSelecionada.set(null);
  }

  onClose(): void {
    this.close.emit();
  }

  onExcluir(): void {
    this.excluir.emit(this.equipe());
  }

  onEditar(): void {
    this.editar.emit(this.equipe());
  }

  onAnterior(): void {
    this.anterior.emit();
  }

  onProximo(): void {
    this.proximo.emit();
  }

  temAnterior(): boolean {
    return this.indiceAtual() > 0;
  }

  temProximo(): boolean {
    return this.indiceAtual() < this.totalEquipes() - 1;
  }
}
