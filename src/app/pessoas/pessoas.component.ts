// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { PessoasService, Pessoa } from '../core/services/pessoas.service';
import { PessoaDetalhesComponent } from './pessoa-detalhes/pessoa-detalhes.component';
import { PessoaFormComponent } from './pessoa-form/pessoa-form.component';

@Component({
  selector: 'app-pessoas',
  standalone: true,
  imports: [SidebarLayoutComponent, CommonModule, FormsModule, PessoaDetalhesComponent, PessoaFormComponent],
  templateUrl: './pessoas.component.html',
  styleUrl: './pessoas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoasComponent implements OnInit {
  pessoas = signal<Pessoa[]>([]);
  searchTerm = signal<string>('');
  sortBy = signal<'nome' | 'id'>('nome');
  viewMode = signal<'cards' | 'list'>('cards');
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedPessoa = signal<Pessoa | null>(null);
  selectedPessoaIndex = signal<number>(0);
  showForm = signal<boolean>(false);
  pessoaEmEdicao = signal<Pessoa | null>(null);
  successMessage = signal<string | null>(null);
  pessoasSelecionadas = signal<Set<string>>(new Set());

  todasSelecionadas = computed(() => {
    const filtradas = this.pessoasFiltradas();
    if (filtradas.length === 0) return false;
    return filtradas.every(p => p.id && this.pessoasSelecionadas().has(p.id));
  });

  // Função para normalizar string removendo acentos
  private normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Computed signal para filtrar e ordenar pessoas
  pessoasFiltradas = computed(() => {
    const term = this.normalizeString(this.searchTerm().trim());
    let result = this.pessoas();
    
    // Filtrar
    if (term) {
      result = result.filter(pessoa => 
        this.normalizeString(pessoa.nome || '').includes(term) ||
        pessoa.idPessoa?.toString().toLowerCase().includes(term)
      );
    }
    
    // Ordenar
    const sortByValue = this.sortBy();
    result = [...result].sort((a, b) => {
      if (sortByValue === 'nome') {
        const nomeA = this.normalizeString(a.nome || '');
        const nomeB = this.normalizeString(b.nome || '');
        // Se forem iguais sem acento, ordena pelo nome original
        if (nomeA === nomeB) {
          return (a.nome || '').localeCompare(b.nome || '');
        }
        return nomeA.localeCompare(nomeB);
      } else {
        const idA = a.idPessoa?.toString() || '';
        const idB = b.idPessoa?.toString() || '';
        return idA.localeCompare(idB, undefined, { numeric: true });
      }
    });
    
    return result;
  });

  constructor(
    private pessoasService: PessoasService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const dados = await this.pessoasService.getPessoas();
      this.pessoas.set(dados);
      this.loading.set(false);
    } catch (err) {
      this.error.set('Erro ao carregar pessoas');
      this.loading.set(false);
      console.error(err);
    }
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onSortChange(value: 'nome' | 'id'): void {
    this.sortBy.set(value);
  }

  onViewModeChange(value: 'cards' | 'list'): void {
    this.viewMode.set(value);
  }

  openPessoaDetails(pessoa: Pessoa): void {
    const index = this.pessoasFiltradas().findIndex(p => p.id === pessoa.id);
    this.selectedPessoaIndex.set(index);
    this.selectedPessoa.set(pessoa);
  }

  closeModal(): void {
    this.selectedPessoa.set(null);
  }

  async onExcluirPessoa(pessoa: Pessoa): Promise<void> {
    const confirmacao = confirm(`Tem certeza que deseja excluir ${pessoa.nome}?`);
    
    if (!confirmacao) {
      return;
    }

    try {
      if (!pessoa.id) {
        this.error.set('Não foi possível excluir: ID inválido');
        return;
      }

      await this.pessoasService.deletePessoa(pessoa.id);
      
      // Recarregar lista
      const dados = await this.pessoasService.getPessoas();
      this.pessoas.set(dados);
      
      // Fechar modal
      this.closeModal();
      
      // Exibir mensagem de sucesso
      this.successMessage.set('Pessoa excluída com sucesso!');
      
      // Remover mensagem após 3 segundos
      setTimeout(() => {
        this.successMessage.set(null);
      }, 3000);
    } catch (err) {
      console.error('Erro ao excluir pessoa:', err);
      this.error.set('Erro ao excluir pessoa. Tente novamente.');
      setTimeout(() => {
        this.error.set(null);
      }, 3000);
    }
  }

  openForm(): void {
    this.pessoaEmEdicao.set(null);
    this.showForm.set(true);
  }

  openEditForm(pessoa: Pessoa): void {
    this.pessoaEmEdicao.set(pessoa);
    this.selectedPessoa.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  async onPessoaAdicionada(): Promise<void> {
    this.closeForm();
    // Recarregar lista de pessoas
    try {
      const dados = await this.pessoasService.getPessoas();
      this.pessoas.set(dados);
      
      // Exibir mensagem de sucesso
      this.successMessage.set('Pessoa cadastrada com sucesso!');
      
      // Remover mensagem após 3 segundos
      setTimeout(() => {
        this.successMessage.set(null);
      }, 3000);
    } catch (err) {
      console.error('Erro ao recarregar pessoas:', err);
    }
  }

  async onPessoaAtualizada(): Promise<void> {
    this.closeForm();
    // Recarregar lista de pessoas
    try {
      const dados = await this.pessoasService.getPessoas();
      this.pessoas.set(dados);
      
      // Exibir mensagem de sucesso
      this.successMessage.set('Pessoa atualizada com sucesso!');
      
      // Remover mensagem após 3 segundos
      setTimeout(() => {
        this.successMessage.set(null);
      }, 3000);
    } catch (err) {
      console.error('Erro ao recarregar pessoas:', err);
    }
  }

  togglePessoa(id: string): void {
    const selecionadas = new Set(this.pessoasSelecionadas());
    if (selecionadas.has(id)) {
      selecionadas.delete(id);
    } else {
      selecionadas.add(id);
    }
    this.pessoasSelecionadas.set(selecionadas);
  }

  toggleTodasPessoas(): void {
    const filtradas = this.pessoasFiltradas();
    const selecionadas = new Set(this.pessoasSelecionadas());
    
    if (this.todasSelecionadas()) {
      // Desmarcar todas as filtradas
      filtradas.forEach(p => p.id && selecionadas.delete(p.id));
    } else {
      // Marcar todas as filtradas
      filtradas.forEach(p => p.id && selecionadas.add(p.id));
    }
    
    this.pessoasSelecionadas.set(selecionadas);
  }

  isPessoaSelecionada(id: string): boolean {
    return this.pessoasSelecionadas().has(id);
  }

  imprimirCrachasMultiplos(): void {
    const ids = Array.from(this.pessoasSelecionadas());
    if (ids.length > 0) {
      this.router.navigate(['/crachas'], { queryParams: { ids: ids.join(',') } });
    }
  }

  imprimirCracha(pessoa: Pessoa): void {
    if (pessoa.id) {
      window.open(`/cracha/${pessoa.id}`, '_blank');
    }
  }

  closePessoaDetails(): void {
    this.selectedPessoa.set(null);
  }

  onPessoaAnterior(): void {
    const index = this.selectedPessoaIndex();
    if (index > 0) {
      const novaPessoa = this.pessoasFiltradas()[index - 1];
      this.selectedPessoaIndex.set(index - 1);
      this.selectedPessoa.set(novaPessoa);
    }
  }

  onPessoaProxima(): void {
    const index = this.selectedPessoaIndex();
    const total = this.pessoasFiltradas().length;
    if (index < total - 1) {
      const novaPessoa = this.pessoasFiltradas()[index + 1];
      this.selectedPessoaIndex.set(index + 1);
      this.selectedPessoa.set(novaPessoa);
    }
  }
}
