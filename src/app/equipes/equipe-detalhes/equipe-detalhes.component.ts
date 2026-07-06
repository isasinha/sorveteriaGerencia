// Baseado em: https://angular.dev/guide/components
import { Component, input, output, ChangeDetectionStrategy, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipe, EquipesService } from '../../core/services/equipes.service';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import { ItensService, Item } from '../../core/services/itens.service';
import { PessoaDetalhesComponent } from '../../pessoas/pessoa-detalhes/pessoa-detalhes.component';

@Component({
  selector: 'app-equipe-detalhes',
  standalone: true,
  imports: [CommonModule, FormsModule, PessoaDetalhesComponent],
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
  equipeAtualizada = output<Equipe>();
  
  pessoas = signal<Pessoa[]>([]);
  equipes = signal<Equipe[]>([]);
  pessoaSelecionada = signal<Pessoa | null>(null);

  todosItens = signal<Item[]>([]);
  itensSelecionados = signal<Set<string>>(new Set());
  novoItemNome = signal('');
  itemDropdown = signal('');
  adicionandoItem = signal(false);
  salvandoItens = signal(false);
  erroItens = signal<string | null>(null);
  salvoItens = signal(false);
  editandoItemId = signal<string | null>(null);
  editandoItemNome = signal('');

  private prevEquipeId = '';
  
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
  
  constructor(
    private pessoasService: PessoasService,
    private equipesService: EquipesService,
    private itensService: ItensService
  ) {
    effect(() => {
      const eq = this.equipe();
      const newId = eq.id ?? eq.idEquipe?.toString() ?? '';
      // Só redefine os itens selecionados quando a equipe realmente muda
      if (newId !== this.prevEquipeId) {
        this.prevEquipeId = newId;
        this.itensSelecionados.set(new Set<string>(eq.itensPadrao ?? []));
      }
      this.carregarPessoas();
    });
  }
  
  async ngOnInit() {
    await this.carregarPessoas();
    await this.carregarEquipes();
    await this.carregarItens();
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

  async carregarItens() {
    try {
      const itens = await this.itensService.getItens();
      this.todosItens.set(itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));
      // Não sobrescreve itensSelecionados aqui - o effect já definiu ao abrir a equipe
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  }

  isItemSelecionado(id: string): boolean {
    return this.itensSelecionados().has(id);
  }

  toggleItem(id: string): void {
    const set = new Set(this.itensSelecionados());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.itensSelecionados.set(set);
    this.salvarItens();
  }

  adicionarItemDropdown(): void {
    const id = this.itemDropdown();
    if (!id) return;
    const set = new Set(this.itensSelecionados());
    set.add(id);
    this.itensSelecionados.set(set);
    this.itemDropdown.set('');
  }

  async criarNovoItem(): Promise<void> {
    const nome = this.novoItemNome().trim();
    if (!nome) return;
    this.adicionandoItem.set(true);
    try {
      const item = await this.itensService.addItem(nome);
      this.todosItens.update(list => [...list, item].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));
      const set = new Set(this.itensSelecionados());
      set.add(item.id!);
      this.itensSelecionados.set(set);
      this.novoItemNome.set('');
      await this.salvarItens();
    } catch (error) {
      console.error('Erro ao criar item:', error);
    } finally {
      this.adicionandoItem.set(false);
    }
  }

  editarItem(item: Item): void {
    this.editandoItemId.set(item.id!);
    this.editandoItemNome.set(item.nome);
  }

  cancelarEdicaoItem(): void {
    this.editandoItemId.set(null);
    this.editandoItemNome.set('');
  }

  async salvarEdicaoItem(): Promise<void> {
    const id = this.editandoItemId();
    const nome = this.editandoItemNome().trim();
    if (!id || !nome) return;
    try {
      await this.itensService.updateItem(id, nome);
      this.todosItens.update(lista =>
        lista.map(i => i.id === id ? { ...i, nome } : i)
             .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
      );
      this.cancelarEdicaoItem();
    } catch (error) {
      console.error('Erro ao editar item:', error);
    }
  }

  async excluirItem(item: Item): Promise<void> {
    if (!confirm(`Excluir o item "${item.nome}"? Esta ação removerá o item de todos os cadastros.`)) return;
    try {
      await this.itensService.deleteItem(item.id!);
      this.todosItens.update(lista => lista.filter(i => i.id !== item.id));
      this.itensSelecionados.update(s => { const n = new Set(s); n.delete(item.id!); return n; });
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  }

  async salvarItens(): Promise<void> {
    const equipe = this.equipe();
    if (!equipe.id) {
      this.erroItens.set('ID da equipe não encontrado.');
      console.error('salvarItens: equipe.id está indefinido', equipe);
      return;
    }
    this.salvandoItens.set(true);
    this.erroItens.set(null);
    this.salvoItens.set(false);
    try {
      const itensPadrao = [...this.itensSelecionados()];
      await this.equipesService.updateEquipe(equipe.id, { itensPadrao });
      // Atualiza o objeto local para que o effect não sobrescreva o estado na próxima navegação
      this.prevEquipeId = ''; // força o effect a recarregar se a equipe mudar
      this.equipeAtualizada.emit({ ...equipe, itensPadrao });
      this.salvoItens.set(true);
      setTimeout(() => this.salvoItens.set(false), 3000);
    } catch (error: any) {
      this.erroItens.set('Erro ao salvar: ' + (error?.message ?? 'tente novamente'));
      console.error('Erro ao salvar itens:', error);
    } finally {
      this.salvandoItens.set(false);
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
