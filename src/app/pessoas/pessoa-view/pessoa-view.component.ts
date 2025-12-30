import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import { EquipesService, Equipe } from '../../core/services/equipes.service';

@Component({
  selector: 'app-pessoa-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pessoa-view.component.html',
  styleUrl: './pessoa-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaViewComponent implements OnInit {
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
        this.error.set('ID da pessoa não informado');
        this.loading.set(false);
        return;
      }

      // Carregar dados da pessoa
      const pessoaData = await this.pessoasService.getPessoaById(id);
      
      if (!pessoaData) {
        this.error.set('Pessoa não encontrada');
        this.loading.set(false);
        return;
      }

      this.pessoa.set(pessoaData);

      // Carregar equipes
      const equipesData = await this.equipesService.getEquipes();
      this.equipes.set(equipesData);

      this.loading.set(false);
    } catch (err) {
      console.error('Erro ao carregar pessoa:', err);
      this.error.set('Erro ao carregar dados da pessoa');
      this.loading.set(false);
    }
  }

  voltar(): void {
    this.router.navigate(['/pessoas']);
  }

  getNomeEquipe(idEquipe: string): string {
    const equipe = this.equipes().find(e => 
      e.idEquipe !== undefined && e.idEquipe.toString() === idEquipe
    );
    return equipe?.nome || 'Equipe não encontrada';
  }

  getNomesEquipes(): string[] {
    const p = this.pessoa();
    if (!p?.idEquipe) return [];
    
    // idEquipe pode ser string ou array
    const ids = Array.isArray(p.idEquipe) 
      ? p.idEquipe 
      : p.idEquipe.split(',').map(id => id.trim());
    return ids.map(id => this.getNomeEquipe(id.toString()));
  }

  temMultiplasEquipes(): boolean {
    const p = this.pessoa();
    if (!p?.idEquipe) return false;
    return Array.isArray(p.idEquipe) ? p.idEquipe.length > 1 : p.idEquipe.includes(',');
  }

  getCamposBasicos(): Array<{key: string, label: string, value: string}> {
    const p = this.pessoa();
    if (!p) return [];

    const campos: Array<{key: string, label: string, value: string}> = [];
    
    // Informações de contato - sempre mostrar
    campos.push({ key: 'email', label: 'Email', value: p.email || 'Não informado' });
    campos.push({ key: 'telefone_cel', label: 'Telefone Celular', value: p.telefone_cel || 'Não informado' });
    campos.push({ key: 'telefone_rec', label: 'Telefone Recado', value: p.telefone_rec || 'Não informado' });
    campos.push({ key: 'telefone_res', label: 'Telefone Residencial', value: p.telefone_res || 'Não informado' });

    return campos;
  }

  getCamposAdicionais(): Array<{key: string, label: string, value: string}> {
    const p = this.pessoa();
    if (!p) {
      console.log('getCamposAdicionais: pessoa is null/undefined');
      return [];
    }

    const campos: Array<{key: string, label: string, value: string}> = [];

    // Data de nascimento e idade - sempre mostrar
    campos.push({ 
      key: 'data_nascimento', 
      label: 'Data de Nascimento', 
      value: p.data_nascimento || 'Não informado' 
    });
    
    campos.push({ 
      key: 'idade', 
      label: 'Idade', 
      value: (p.idade !== undefined && p.idade !== null) ? p.idade.toString() + ' anos' : 'Não informado' 
    });
    
    // Equipe(s) - sempre mostrar
    if (p.idEquipe) {
      const nomes = this.getNomesEquipes();
      campos.push({ 
        key: 'idEquipe', 
        label: this.temMultiplasEquipes() ? 'Equipes' : 'Equipe', 
        value: nomes.join(', ')
      });
    } else {
      campos.push({ 
        key: 'idEquipe', 
        label: 'Equipe', 
        value: 'Não informado'
      });
    }
    
    // Comentários - sempre mostrar
    campos.push({ 
      key: 'comentarios', 
      label: 'Comentários', 
      value: p.comentarios || 'Sem comentários' 
    });

    console.log('getCamposAdicionais returning:', campos);
    return campos;
  }
}
