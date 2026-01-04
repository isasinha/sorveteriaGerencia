// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { EquipesService, Equipe } from '../core/services/equipes.service';
import { ConfirmacoesService } from '../core/services/confirmacoes.service';
import { PessoasService } from '../core/services/pessoas.service';
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

  constructor(
    private equipesService: EquipesService,
    private confirmacoesService: ConfirmacoesService,
    private pessoasService: PessoasService
  ) {}

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
    const mensagem = `⚠️ ATENÇÃO! ⚠️\n\nVocê está prestes a excluir a equipe "${equipe.nome}".\n\n❌ TODAS as confirmações de participação desta equipe serão CANCELADAS.\n👥 Pessoas desta equipe serão movidas para "Temporariamente sem equipe".\n\n⏳ Esta ação NÃO PODERÁ SER DESFEITA!\n\nDeseja realmente continuar?`;
    
    const confirmacao = confirm(mensagem);
    
    if (!confirmacao) {
      return;
    }

    try {
      if (equipe.id) {
        // 1. Buscar ou criar equipe "Temporariamente sem equipe"
        let equipes = await this.equipesService.getEquipes();
        let equipeSemEquipe = equipes.find(e => e.nome === 'Temporariamente sem equipe');
        
        if (!equipeSemEquipe) {
          // Criar equipe temporária
          const proximoId = await this.equipesService.getProximoIdEquipe();
          const novaEquipeTemp: Equipe = {
            idEquipe: proximoId,
            nome: 'Temporariamente sem equipe'
          };
          await this.equipesService.addEquipe(novaEquipeTemp);
          
          // Recarregar para obter o ID gerado
          equipes = await this.equipesService.getEquipes();
          equipeSemEquipe = equipes.find(e => e.nome === 'Temporariamente sem equipe');
        }

        // 2. Buscar todas as pessoas da equipe a ser excluída e atualizar seus cadastros
        const todasPessoas = await this.pessoasService.getPessoas();
        
        // Filtrar pessoas que têm a equipe (mesmo que tenham outras)
        const pessoasDaEquipe = todasPessoas.filter(p => {
          if (!p.idEquipe) return false;
          const equipesStr = p.idEquipe.toString();
          const equipesArray = equipesStr.split(',').map(id => id.trim());
          const equipeIdStr = equipe.idEquipe?.toString();
          return equipesArray.includes(equipeIdStr || '');
        });

        for (const pessoa of pessoasDaEquipe) {
          if (!pessoa.id) continue;
          
          // Obter array de equipes da pessoa
          const equipesArray = pessoa.idEquipe!.toString().split(',').map(id => id.trim());
          
          // Remover o ID da equipe excluída
          const novasEquipes = equipesArray.filter(id => id !== equipe.idEquipe?.toString());
          
          // Se ficou sem equipes, adicionar à equipe temporária
          let novoIdEquipe: string;
          if (novasEquipes.length === 0) {
            if (equipeSemEquipe && equipeSemEquipe.idEquipe !== undefined && equipeSemEquipe.idEquipe !== null) {
              novoIdEquipe = equipeSemEquipe.idEquipe.toString();
            } else {
              continue;
            }
          } else {
            // Manter as equipes restantes
            novoIdEquipe = novasEquipes.join(',');
          }
          
          await this.pessoasService.updatePessoa(pessoa.id, {
            idEquipe: novoIdEquipe
          });
        }

        // 3. Excluir todas as confirmações relacionadas à equipe
        const confirmacoes = await this.confirmacoesService.getConfirmacoes();
        const confirmacoesParaExcluir = confirmacoes.filter(c => 
          c.idEquipe?.toString() === equipe.idEquipe?.toString()
        );
        for (const conf of confirmacoesParaExcluir) {
          if (conf.id) {
            await this.confirmacoesService.deleteConfirmacao(conf.id);
          }
        }

        // 4. Excluir a equipe
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
