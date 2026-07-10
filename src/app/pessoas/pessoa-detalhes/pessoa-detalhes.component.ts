// Baseado em: https://angular.dev/guide/components
import { Component, input, output, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pessoa } from '../../core/services/pessoas.service';
import { EquipesService, Equipe } from '../../core/services/equipes.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-pessoa-detalhes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pessoa-detalhes.component.html',
  styleUrl: './pessoa-detalhes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaDetalhesComponent implements OnInit {
  pessoa = input.required<Pessoa>();
  totalPessoas = input<number>(0);
  indiceAtual = input<number>(0);
  somenteVisualizacao = input<boolean>(false);
  close = output<void>();
  excluir = output<Pessoa>();
  editar = output<Pessoa>();
  anterior = output<void>();
  proximo = output<void>();
  equipes = signal<Equipe[]>([]);
  qrCodeDataUrl = signal<string>('');

  constructor(private equipesService: EquipesService) {}

  async ngOnInit(): Promise<void> {
    try {
      const equipesData = await this.equipesService.getEquipes();
      this.equipes.set(equipesData);
      
      // Gerar QR code com URL para a pessoa
      const url = `${window.location.origin}/pessoa/${this.pessoa().id}`;
      const qrCode = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      this.qrCodeDataUrl.set(qrCode);
    } catch (error) {
      console.error('Erro ao carregar equipes ou gerar QR code:', error);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onExcluir(): void {
    this.excluir.emit(this.pessoa());
  }

  onEditar(): void {
    this.editar.emit(this.pessoa());
  }

  onImprimirCracha(): void {
    const pessoa = this.pessoa();
    if (pessoa.id) {
      window.open(`/cracha/${pessoa.id}`, '_blank');
    }
  }

  onImprimirFicha(): void {
    const pessoa = this.pessoa();
    if (pessoa.id) {
      window.open(`/ficha/${pessoa.id}`, '_blank');
    }
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
    return this.indiceAtual() < this.totalPessoas() - 1;
  }

  getNomeEquipe(): string {
    const p = this.pessoa();
    if (!p.idEquipe) return '-';
    
    // Comparar convertendo ambos para string para garantir match
    const equipe = this.equipes().find(e => {
      const equipeId = e.idEquipe?.toString();
      const pessoaEquipeId = p.idEquipe?.toString();
      return equipeId === pessoaEquipeId;
    });
    
    return equipe ? equipe.nome : p.idEquipe;
  }

  getNomesEquipes(): string[] {
    const p = this.pessoa();
    if (!p.idEquipe) return [];
    
    // Verifica se tem múltiplas equipes (separadas por vírgula)
    const idsEquipes = p.idEquipe.toString().split(',').map(id => id.trim());
    
    return idsEquipes.map(idEquipe => {
      const equipe = this.equipes().find(e => {
        const equipeId = e.idEquipe?.toString();
        return equipeId === idEquipe;
      });
      return equipe ? equipe.nome : idEquipe;
    });
  }

  temMultiplasEquipes(): boolean {
    const p = this.pessoa();
    if (!p.idEquipe) return false;
    return p.idEquipe.toString().includes(',');
  }

  // Calcula idade com base na data de nascimento
  calcularIdade(): string {
    const p = this.pessoa();
    
    // Se tiver data de nascimento, calcula a idade
    if (p.data_nascimento) {
      // Converte dd/MM/aaaa para Date
      const partesData = p.data_nascimento.split('/');
      if (partesData.length === 3) {
        const dia = parseInt(partesData[0], 10);
        const mes = parseInt(partesData[1], 10) - 1; // Mês começa em 0
        const ano = parseInt(partesData[2], 10);
        
        const dataNasc = new Date(ano, mes, dia);
        const hoje = new Date();
        
        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        const mesAtual = hoje.getMonth();
        const mesNasc = dataNasc.getMonth();
        
        // Ajusta se ainda não fez aniversário este ano
        if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < dataNasc.getDate())) {
          idade--;
        }
        
        return idade.toString();
      }
    }
    
    // Se não tiver data de nascimento, usa o campo idade do banco
    return p.idade?.toString() || '-';
  }

  // Agrupa campos por categoria para melhor organização
  getCamposBasicos(): { label: string; value: any; key: string }[] {
    const p = this.pessoa();
    return [
      { label: 'Email', value: p.email || '-', key: 'email' },
      { label: 'Telefone Celular', value: p.telefone_cel || '-', key: 'telefone_cel' },
      { label: 'Telefone Recado', value: p.telefone_rec || '-', key: 'telefone_rec' },
      { label: 'Telefone Residencial', value: p.telefone_res || '-', key: 'telefone_res' },
      { label: 'Data de Nascimento', value: p.data_nascimento || '-', key: 'data_nascimento' },
      { label: 'Idade', value: this.calcularIdade(), key: 'idade' },
    ];
  }

  getCamposAdicionais(): { label: string; value: any; key: string }[] {
    const p = this.pessoa();
    const campos: { label: string; value: any; key: string }[] = [
      { label: 'Equipe(s)', value: this.getNomeEquipe(), key: 'idEquipe' },
      { label: 'Voluntário desde', value: p.voluntario_desde, key: 'voluntario_desde' },
      { label: 'Comentários', value: p.comentarios || '-', key: 'comentarios' }
    ];
    return campos;
  }

  private formatarLabel(key: string): string {
    // Converte camelCase para espaços e capitaliza
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}
