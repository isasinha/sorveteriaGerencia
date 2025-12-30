// Baseado em: https://angular.dev/guide/forms
import { Component, ChangeDetectionStrategy, output, signal, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipesService, Equipe } from '../../core/services/equipes.service';

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

  nome = signal<string>('');

  salvando = signal<boolean>(false);
  erro = signal<string | null>(null);

  constructor(private equipesService: EquipesService) {
    // Effect para carregar dados quando equipe em edição mudar
    effect(() => {
      const equipe = this.equipeEmEdicao();
      if (equipe) {
        this.nome.set(equipe.nome || '');
      }
    });
  }

  ngOnInit(): void {}

  onClose(): void {
    this.close.emit();
  }

  async onSubmit() {
    // Validação do nome
    if (!this.nome().trim()) {
      this.erro.set('O nome da equipe é obrigatório');
      return;
    }

    this.salvando.set(true);

    try {
      const equipeEdit = this.equipeEmEdicao();
      
      if (equipeEdit && equipeEdit.id) {
        // Modo edição
        const equipeAtualizada: Partial<Equipe> = {
          nome: this.nome().trim(),
        };

        // Atualizar no Firestore
        await this.equipesService.updateEquipe(equipeEdit.id, equipeAtualizada);

        // Emitir evento de sucesso
        this.equipeAtualizada.emit({ ...equipeEdit, ...equipeAtualizada } as Equipe);
        this.onClose();
      } else {
        // Modo criação
        // Obter próximo ID
        const proximoId = await this.equipesService.getProximoIdEquipe();

        const novaEquipe: Equipe = {
          idEquipe: proximoId,
          nome: this.nome().trim(),
        };

        // Salvar no Firestore
        await this.equipesService.addEquipe(novaEquipe);

        // Emitir evento de sucesso
        this.equipeAdicionada.emit(novaEquipe);
        this.onClose();
      }
    } catch (err: any) {
      console.error('Erro ao salvar equipe:', err);
      this.erro.set('Erro ao salvar equipe. Tente novamente.');
    } finally {
      this.salvando.set(false);
    }
  }
}
