// Baseado em: https://angular.dev/guide/forms
import { Component, ChangeDetectionStrategy, output, signal, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipesService, Equipe } from '../../core/services/equipes.service';
import { ItensService, Item } from '../../core/services/itens.service';

@Component({
  selector: 'app-equipe-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipe-form.component.html',
  styleUrl: './equipe-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipeFormComponent implements OnInit {
  equipeEmEdicao = input<Equipe | null>(null);
  close = output<void>();
  equipeAdicionada = output<Equipe>();
  equipeAtualizada = output<Equipe>();

  nome = signal('');
  salvando = signal(false);
  erro = signal<string | null>(null);

  // itens
  todosItens = signal<Item[]>([]);
  itensSelecionados = signal<Set<string>>(new Set());
  novoItemNome = signal('');
  itemDropdown = signal('');
  adicionandoItem = signal(false);
  editandoItemId = signal<string | null>(null);
  editandoItemNome = signal('');

  constructor(
    private equipesService: EquipesService,
    private itensService: ItensService
  ) {
    effect(() => {
      const equipe = this.equipeEmEdicao();
      if (equipe) {
        this.nome.set(equipe.nome ?? '');
        this.itensSelecionados.set(new Set(equipe.itensPadrao ?? []));
      } else {
        this.nome.set('');
        this.itensSelecionados.set(new Set());
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const itens = await this.itensService.getItens();
    this.todosItens.set(itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
  }

  onClose(): void { this.close.emit(); }

  isItemSelecionado(id: string): boolean {
    return this.itensSelecionados().has(id);
  }

  toggleItem(id: string): void {
    this.itensSelecionados.update(s => {
      const novo = new Set(s);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  }

  async adicionarItemDropdown(): Promise<void> {
    const id = this.itemDropdown();
    if (!id) return;
    this.itensSelecionados.update(s => new Set([...s, id]));
    this.itemDropdown.set('');
  }

  async criarNovoItem(): Promise<void> {
    const nome = this.novoItemNome().trim();
    if (!nome) return;
    this.adicionandoItem.set(true);
    try {
      const item = await this.itensService.addItem(nome);
      // atualiza lista global se ainda não existir
      if (!this.todosItens().find(i => i.id === item.id)) {
        this.todosItens.update(lista => [...lista, item].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      }
      this.itensSelecionados.update(s => new Set([...s, item.id!]));
      this.novoItemNome.set('');
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
             .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
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

  async onSubmit(): Promise<void> {
    if (!this.nome().trim()) {
      this.erro.set('O nome da equipe é obrigatório');
      return;
    }
    this.salvando.set(true);
    try {
      const equipeEdit = this.equipeEmEdicao();
      const itensPadrao = [...this.itensSelecionados()];

      if (equipeEdit?.id) {
        const upd: Partial<Equipe> = { nome: this.nome().trim(), itensPadrao };
        await this.equipesService.updateEquipe(equipeEdit.id, upd);
        this.equipeAtualizada.emit({ ...equipeEdit, ...upd });
        this.onClose();
      } else {
        const proximoId = await this.equipesService.getProximoIdEquipe();
        const novaEquipe: Equipe = { idEquipe: proximoId, nome: this.nome().trim(), itensPadrao };
        await this.equipesService.addEquipe(novaEquipe);
        this.equipeAdicionada.emit(novaEquipe);
        this.onClose();
      }
    } catch (err: any) {
      this.erro.set('Erro ao salvar equipe. Tente novamente.');
    } finally {
      this.salvando.set(false);
    }
  }
}
