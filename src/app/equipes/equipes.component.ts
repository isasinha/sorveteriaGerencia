// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { EquipesService, Equipe } from '../core/services/equipes.service';
import { EquipeDetalhesComponent } from './equipe-detalhes/equipe-detalhes.component';
import { EquipeFormComponent } from './equipe-form/equipe-form.component';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent, EquipeDetalhesComponent, EquipeFormComponent],
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EquipesComponent implements OnInit {
  equipes = signal<Equipe[]>([]);
  searchTerm = signal<string>('');
  sortBy = signal<'nome' | 'id'>('nome');
  selectedEquipe = signal<Equipe | null>(null);
  selectedEquipeIndex = signal<number>(0);
  showForm = signal<boolean>(false);
  equipeEmEdicao = signal<Equipe | null>(null);
  successMessage = signal<string | null>(null);

  constructor(private equipesService: EquipesService) {}

  async ngOnInit() {
    await this.carregarEquipes();
  }

  async carregarEquipes() {
    try {
      const equipes = await this.equipesService.getEquipes();
      this.equipes.set(equipes);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    }
  }

  // Função para normalizar strings (remover acentos)
  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // Computed: filtrar e ordenar equipes
  equipesFiltradasOrdenadas = computed(() => {
    let resultado = [...this.equipes()];

    // Filtrar equipe "Temporariamente sem equipe"
    resultado = resultado.filter(equipe => 
      equipe.nome !== 'Temporariamente sem equipe'
    );

    // Filtrar por termo de busca
    const termo = this.searchTerm().trim();
    if (termo) {
      const termoNormalizado = this.normalizeString(termo);
      resultado = resultado.filter(equipe => 
        this.normalizeString(equipe.nome || '').includes(termoNormalizado) ||
        (equipe.idEquipe?.toString() || '').includes(termo)
      );
    }

    // Ordenar
    const sortBy = this.sortBy();
    resultado.sort((a, b) => {
      if (sortBy === 'nome') {
        return this.normalizeString(a.nome).localeCompare(this.normalizeString(b.nome));
      } else {
        const idA = typeof a.idEquipe === 'number' ? a.idEquipe : parseInt(a.idEquipe || '0', 10);
        const idB = typeof b.idEquipe === 'number' ? b.idEquipe : parseInt(b.idEquipe || '0', 10);
        return idA - idB;
      }
    });

    return resultado;
  });

  openModal(equipe: Equipe) {
    this.selectedEquipe.set(equipe);
  }

  openEquipeDetails(equipe: Equipe): void {
    const index = this.equipesFiltradasOrdenadas().findIndex(e => e.id === equipe.id);
    this.selectedEquipeIndex.set(index);
    this.selectedEquipe.set(equipe);
  }

  closeModal() {
    this.selectedEquipe.set(null);
  }

  closeEquipeDetails(): void {
    this.selectedEquipe.set(null);
  }

  onEquipeAnterior(): void {
    const index = this.selectedEquipeIndex();
    if (index > 0) {
      const novaEquipe = this.equipesFiltradasOrdenadas()[index - 1];
      this.selectedEquipeIndex.set(index - 1);
      this.selectedEquipe.set(novaEquipe);
    }
  }

  onEquipeProxima(): void {
    const index = this.selectedEquipeIndex();
    const total = this.equipesFiltradasOrdenadas().length;
    if (index < total - 1) {
      const novaEquipe = this.equipesFiltradasOrdenadas()[index + 1];
      this.selectedEquipeIndex.set(index + 1);
      this.selectedEquipe.set(novaEquipe);
    }
  }

  openForm() {
    this.equipeEmEdicao.set(null);
    this.showForm.set(true);
  }

  openEditForm(equipe: Equipe) {
    this.closeModal();
    this.equipeEmEdicao.set(equipe);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.equipeEmEdicao.set(null);
  }

  async onEquipeAdicionada() {
    await this.carregarEquipes();
    this.showSuccessMessage('Equipe adicionada com sucesso!');
  }

  async onEquipeAtualizada() {
    await this.carregarEquipes();
    this.showSuccessMessage('Equipe atualizada com sucesso!');
  }

  async onExcluirEquipe(equipe: Equipe) {
    const confirmacao = confirm(`Tem certeza que deseja excluir a equipe "${equipe.nome}"?`);
    
    if (!confirmacao) {
      return;
    }

    try {
      if (equipe.id) {
        await this.equipesService.deleteEquipe(equipe.id);
        await this.carregarEquipes();
        this.closeModal();
        this.showSuccessMessage('Equipe excluída com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      alert('Erro ao excluir equipe. Tente novamente.');
    }
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
