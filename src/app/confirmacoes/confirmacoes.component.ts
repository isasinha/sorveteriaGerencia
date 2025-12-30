// Baseado em: https://angular.dev/guide/components
import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { DiaDaFestaService, DiaDaFesta } from '../core/services/dia-da-festa.service';
import { PessoasService, Pessoa } from '../core/services/pessoas.service';
import { ConfirmacoesService, Confirmacao } from '../core/services/confirmacoes.service';
import { EquipesService, Equipe } from '../core/services/equipes.service';

interface NovaConfirmacao {
  idEquipe: string;
  idDia: number | null;
  horaInicio: string;
  horaFim: string;
  observacoes: string;
}

type ModoVisualizacao = 'por-dia' | 'por-pessoa' | 'por-equipe';

@Component({
  selector: 'app-confirmacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent],
  templateUrl: './confirmacoes.component.html',
  styleUrls: ['./confirmacoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmacoesComponent implements OnInit {
  dias = signal<DiaDaFesta[]>([]);
  pessoas = signal<Pessoa[]>([]);
  equipes = signal<Equipe[]>([]);
  confirmacoes = signal<Confirmacao[]>([]);
  
  // Modo de visualização
  modoVisualizacao = signal<ModoVisualizacao>('por-dia');
  
  // Seleções por modo
  diaSelecionado = signal<number | null>(null);
  equipeFiltro = signal<string | null>(null);
  pessoaSelecionada = signal<Pessoa | null>(null);
  equipeSelecionada = signal<Equipe | null>(null);
  filtrarApenasConfirmados = signal<boolean>(false);
  diaFiltroPessoa = signal<number | null>(null);
  equipeFiltroPessoa = signal<string | null>(null);
  filtrarApenasConfirmadosPorPessoa = signal(false);
  diaFiltroEquipe = signal<number | null>(null);
  pessoaFiltroEquipe = signal<string | null>(null);
  filtrarApenasConfirmadosPorEquipe = signal(false);
  
  searchTerm = signal<string>('');
  pessoaExpandida = signal<string | null>(null);
  diaExpandido = signal<number | null>(null);
  diaFiltroCardPessoa = signal<number | null>(null);
  equipeFiltroCardPessoa = signal<string | null>(null);
  formularioVisivel = signal<string | null>(null);
  confirmacaoEditando = signal<string | null>(null);
  dadosEdicao = signal<NovaConfirmacao>({
    idEquipe: '',
    idDia: null,
    horaInicio: '',
    horaFim: '',
    observacoes: ''
  });
  
  // Formulário de nova confirmação
  novaConfirmacao = signal<NovaConfirmacao>({
    idEquipe: '',
    idDia: null,
    horaInicio: '',
    horaFim: '',
    observacoes: ''
  });
  
  loading = signal<boolean>(false);
  salvando = signal<boolean>(false);
  errorEdicao = signal<string | null>(null);
  errorCadastro = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Dias ordenados por data (mais recente primeiro)
  diasOrdenados = computed(() => {
    return [...this.dias()].sort((a, b) => {
      // Converter data do formato dd/MM/yyyy ou yyyy-MM-dd para Date
      let dateA: Date;
      let dateB: Date;
      
      if (a.dia.includes('/')) {
        const [diaA, mesA, anoA] = a.dia.split('/').map(Number);
        dateA = new Date(anoA, mesA - 1, diaA);
      } else {
        dateA = new Date(a.dia);
      }
      
      if (b.dia.includes('/')) {
        const [diaB, mesB, anoB] = b.dia.split('/').map(Number);
        dateB = new Date(anoB, mesB - 1, diaB);
      } else {
        dateB = new Date(b.dia);
      }
      
      // Ordenar por data mais recente primeiro (DESC)
      return dateB.getTime() - dateA.getTime();
    });
  });

  // Pessoas filtradas por equipe e busca
  pessoasFiltradas = computed(() => {
    let resultado = this.pessoas();

    // Filtrar por equipe
    const equipeSel = this.equipeFiltro();
    if (equipeSel) {
      resultado = resultado.filter(p => {
        if (!p.idEquipe) return false;
        const equipes = Array.isArray(p.idEquipe) 
          ? p.idEquipe 
          : p.idEquipe.toString().split(',');
        return equipes.some(e => e.toString().trim() === equipeSel);
      });
    }

    // Filtrar apenas confirmados
    if (this.filtrarApenasConfirmados()) {
      resultado = resultado.filter(p => this.temConfirmacoes(p.idPessoa!));
    }

    // Filtrar por busca
    const termo = this.normalizeString(this.searchTerm());
    if (termo) {
      resultado = resultado.filter(p => 
        this.normalizeString(p.nome).includes(termo) ||
        p.idPessoa?.toString().includes(termo)
      );
    }

    // Ordenar por nome
    return resultado.sort((a, b) => 
      this.normalizeString(a.nome).localeCompare(this.normalizeString(b.nome), 'pt-BR')
    );
  });

  // Total de confirmações para o dia selecionado
  totalConfirmacoes = computed(() => {
    const diaSel = this.diaSelecionado();
    if (!diaSel) return 0;

    return this.confirmacoes().filter(
      c => c.idDia === diaSel && c.confirmado
    ).length;
  });

  // Total de pessoas confirmadas no modo "por pessoa" (com filtros aplicados)
  pessoasConfirmadasPorPessoa = computed(() => {
    return this.pessoasFiltadasPorPessoa().filter(p => 
      this.getConfirmacoesDaPessoaFiltradas(p.idPessoa!).length > 0
    ).length;
  });

  // Total de participações no modo "por pessoa" (com filtros aplicados)
  totalConfirmacoesPorPessoa = computed(() => {
    let total = 0;
    this.pessoasFiltadasPorPessoa().forEach(p => {
      total += this.getConfirmacoesDaPessoaFiltradas(p.idPessoa!).length;
    });
    return total;
  });

  // Pessoas únicas confirmadas
  pessoasConfirmadas = computed(() => {
    const diaSel = this.diaSelecionado();
    if (!diaSel) return 0;

    const pessoasIds = new Set(
      this.confirmacoes()
        .filter(c => c.idDia === diaSel && c.confirmado)
        .map(c => c.idPessoa.toString())
    );
    return pessoasIds.size;
  });

  // Equipes ordenadas
  equipesOrdenadas = computed(() => {
    const todasEquipes = [...this.equipes()];
    const semEquipe = todasEquipes.find(e => e.nome === 'Temporariamente sem equipe');
    const outrasEquipes = todasEquipes
      .filter(e => e.nome !== 'Temporariamente sem equipe')
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    
    return semEquipe ? [semEquipe, ...outrasEquipes] : outrasEquipes;
  });

  // Pessoas da equipe selecionada (modo por-equipe)
  pessoasDaEquipe = computed(() => {
    const equipe = this.equipeSelecionada();
    if (!equipe) return [];
    
    // Buscar pessoas que pertencem à equipe OU têm confirmações para a equipe
    const pessoasIds = new Set<string>();
    
    // 1. Pessoas que são membros da equipe
    this.pessoas().forEach(p => {
      if (!p.idEquipe) return;
      const equipes = Array.isArray(p.idEquipe) 
        ? p.idEquipe 
        : p.idEquipe.toString().split(',');
      if (equipes.some(e => e.toString().trim() === equipe.idEquipe?.toString())) {
        pessoasIds.add(p.id!);
      }
    });
    
    // 2. Pessoas que têm confirmações para a equipe (mesmo não sendo membros)
    this.confirmacoes()
      .filter(c => c.idEquipe?.toString() === equipe.idEquipe?.toString())
      .forEach(c => {
        const pessoa = this.pessoas().find(p => p.idPessoa?.toString() === c.idPessoa.toString());
        if (pessoa?.id) {
          pessoasIds.add(pessoa.id);
        }
      });
    
    // Converter IDs para pessoas
    let resultado = this.pessoas().filter(p => pessoasIds.has(p.id!));

    // Filtrar por pessoa
    const pessoaSel = this.pessoaFiltroEquipe();
    if (pessoaSel) {
      resultado = resultado.filter(p => p.id === pessoaSel);
    }

    // Filtrar por dia (pessoas que têm confirmação naquele dia)
    const diaSel = this.diaFiltroEquipe();
    if (diaSel) {
      resultado = resultado.filter(p => {
        const confirmacoesDaPessoa = this.confirmacoes().filter(
          c => c.idPessoa.toString() === p.idPessoa?.toString() && 
               c.idDia === diaSel && 
               c.idEquipe?.toString() === equipe.idEquipe?.toString() && 
               c.confirmado
        );
        return confirmacoesDaPessoa.length > 0;
      });
    }

    // Filtrar apenas confirmados
    if (this.filtrarApenasConfirmadosPorEquipe()) {
      resultado = resultado.filter(p => 
        this.getConfirmacoesDaPessoaNaEquipe(p.idPessoa!).length > 0
      );
    }

    // Filtrar por busca
    const termo = this.normalizeString(this.searchTerm());
    if (termo) {
      resultado = resultado.filter(p => 
        this.normalizeString(p.nome).includes(termo) ||
        p.idPessoa?.toString().includes(termo)
      );
    }
      
    return resultado.sort((a, b) => this.normalizeString(a.nome).localeCompare(this.normalizeString(b.nome), 'pt-BR'));
  });

  // Pessoas disponíveis para seleção no modo por-pessoa
  pessoasParaSelecao = computed(() => {
    const termo = this.normalizeString(this.searchTerm());
    let resultado = this.pessoas();

    if (termo) {
      resultado = resultado.filter(p => 
        this.normalizeString(p.nome).includes(termo) ||
        p.idPessoa?.toString().includes(termo)
      );
    }

    return resultado.sort((a, b) => 
      this.normalizeString(a.nome).localeCompare(this.normalizeString(b.nome), 'pt-BR')
    );
  });

  // Confirmações da pessoa selecionada (modo por-pessoa)
  confirmacoesDaPessoa = computed(() => {
    return this.confirmacoes();
  });

  // Confirmações da equipe selecionada para um dia específico (modo por-equipe)
  getConfirmacoesDaEquipePorDia(idDia: number): Confirmacao[] {
    const equipe = this.equipeSelecionada();
    if (!equipe) return [];
    
    return this.confirmacoes()
      .filter(c => c.idDia === idDia && c.idEquipe?.toString() === equipe.idEquipe?.toString() && c.confirmado);
  }

  // Confirmações de uma pessoa na equipe (modo por-equipe, considerando filtro de dia)
  getConfirmacoesDaPessoaNaEquipe(idPessoa: string | number): Confirmacao[] {
    const equipe = this.equipeSelecionada();
    if (!equipe) return [];
    
    const diaSel = this.diaFiltroEquipe();
    
    const confirmacoes = this.confirmacoes().filter(c => {
      const matchPessoa = c.idPessoa.toString() === idPessoa.toString() && 
                         c.idEquipe?.toString() === equipe.idEquipe?.toString() && 
                         c.confirmado;
      if (!diaSel) return matchPessoa;
      return matchPessoa && c.idDia === diaSel;
    });
    
    return confirmacoes.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  // Verificar se pessoa tem confirmações na equipe mas não é da equipe
  temConfirmacoesNaEquipeMasNaoEDaEquipe(pessoa: Pessoa): boolean {
    const equipe = this.equipeSelecionada();
    if (!equipe) return false;
    
    const temConfirmacoes = this.getConfirmacoesDaPessoaNaEquipe(pessoa.idPessoa!).length > 0;
    
    // Verificar se a pessoa NÃO está cadastrada na equipe filtrada
    let naoEDaEquipe = false;
    if (Array.isArray(pessoa.idEquipe)) {
      // Se idEquipe é um array, verificar se a equipe filtrada NÃO está no array
      naoEDaEquipe = !pessoa.idEquipe.some(id => id.toString() === equipe.idEquipe?.toString());
    } else {
      // Se idEquipe é uma string/number, comparar diretamente
      naoEDaEquipe = pessoa.idEquipe?.toString() !== equipe.idEquipe?.toString();
    }
    
    return temConfirmacoes && naoEDaEquipe;
  }

  // Total de pessoas confirmadas no modo "por equipe" (com filtros aplicados)
  pessoasConfirmadasPorEquipe = computed(() => {
    return this.pessoasDaEquipe().filter(p => 
      this.getConfirmacoesDaPessoaNaEquipe(p.idPessoa!).length > 0
    ).length;
  });

  // Total de participações no modo "por equipe" (com filtros aplicados)
  totalConfirmacoesPorEquipe = computed(() => {
    let total = 0;
    this.pessoasDaEquipe().forEach(p => {
      total += this.getConfirmacoesDaPessoaNaEquipe(p.idPessoa!).length;
    });
    return total;
  });

  constructor(
    private diaDaFestaService: DiaDaFestaService,
    private pessoasService: PessoasService,
    private confirmacoesService: ConfirmacoesService,
    private equipesService: EquipesService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.carregarDados();
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  formatarData(data: string): string {
    // Garantir formato dd/MM/yyyy
    if (!data) return '';
    
    // Se já está no formato correto, retornar
    const regexCorreto = /^\d{2}\/\d{2}\/\d{4}$/;
    if (regexCorreto.test(data)) return data;
    
    // Se está no formato ISO (yyyy-MM-dd), converter para dd/MM/yyyy
    const regexISO = /^\d{4}-\d{2}-\d{2}$/;
    if (regexISO.test(data)) {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    
    // Se está em outro formato com barra (dd/M/yyyy ou d/M/yyyy), formatar
    const partes = data.split('/');
    if (partes.length === 3) {
      const dia = partes[0].padStart(2, '0');
      const mes = partes[1].padStart(2, '0');
      const ano = partes[2];
      return `${dia}/${mes}/${ano}`;
    }
    
    return data;
  }

  async carregarDados(): Promise<void> {
    this.loading.set(true);
    try {
      const [dias, pessoas, equipes, confirmacoes] = await Promise.all([
        this.diaDaFestaService.getDiasDaFesta(),
        this.pessoasService.getPessoas(),
        this.equipesService.getEquipes(),
        this.confirmacoesService.getConfirmacoes()
      ]);

      this.dias.set(dias);
      this.pessoas.set(pessoas);
      this.equipes.set(equipes);
      this.confirmacoes.set(confirmacoes);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados');
    } finally {
      this.loading.set(false);
    }
  }

  // Obter confirmações de uma pessoa para o dia selecionado
  getConfirmacoesPessoa(idPessoa: string | number): Confirmacao[] {
    const diaSel = this.diaSelecionado();
    if (!diaSel) return [];

    return this.confirmacoes()
      .filter(
        c => c.idPessoa.toString() === idPessoa.toString() && 
             c.idDia === diaSel && 
             c.confirmado
      )
      .sort((a, b) => {
        // Ordenar por horário de início (mais cedo primeiro)
        return a.horaInicio.localeCompare(b.horaInicio);
      });
  }

  // Verificar se pessoa tem confirmações
  temConfirmacoes(idPessoa: string | number | undefined): boolean {
    if (!idPessoa) return false;
    const modo = this.modoVisualizacao();
    
    if (modo === 'por-dia') {
      // No modo por-dia, verificar se tem confirmações para o dia selecionado
      return this.getConfirmacoesPessoa(idPessoa).length > 0;
    } else {
      // Nos outros modos, verificar se tem confirmações em geral
      return this.confirmacoesDaPessoa().some(c => c.idPessoa.toString() === idPessoa.toString());
    }
  }

  // Expandir/recolher pessoa
  toggleExpansao(pessoaId: string): void {
    if (this.pessoaExpandida() === pessoaId) {
      this.pessoaExpandida.set(null);
      this.formularioVisivel.set(null);
    } else {
      this.pessoaExpandida.set(pessoaId);
      this.formularioVisivel.set(null);
      // Resetar formulário e filtros
      this.resetFormulario();
      this.diaFiltroCardPessoa.set(null);
      this.equipeFiltroCardPessoa.set(null);
    }
  }

  isPessoaExpandida(pessoaId: string): boolean {
    return this.pessoaExpandida() === pessoaId;
  }

  isDiaExpandido(idDia: number): boolean {
    return this.diaExpandido() === idDia;
  }

  toggleDiaExpansao(idDia: number): void {
    if (this.diaExpandido() === idDia) {
      this.diaExpandido.set(null);
    } else {
      this.diaExpandido.set(idDia);
    }
  }

  toggleFormulario(identificador: string): void {
    if (this.formularioVisivel() === identificador) {
      this.formularioVisivel.set(null);
    } else {
      this.formularioVisivel.set(identificador);
      this.errorCadastro.set(null);
      this.cancelarEdicao(); // Fechar formulário de edição
      this.resetFormulario();
    }
  }

  isFormularioVisivel(identificador: string): boolean {
    return this.formularioVisivel() === identificador;
  }

  // Mudança de modo
  onModoChange(modo: ModoVisualizacao): void {
    this.modoVisualizacao.set(modo);
    // Resetar seleções
    this.diaSelecionado.set(null);
    this.pessoaSelecionada.set(null);
    this.equipeSelecionada.set(null);
    this.pessoaExpandida.set(null);
    this.diaExpandido.set(null);
    this.equipeFiltro.set(null);
    this.diaFiltroPessoa.set(null);
    this.equipeFiltroPessoa.set(null);
    this.diaFiltroEquipe.set(null);
    this.pessoaFiltroEquipe.set(null);
    this.searchTerm.set('');
    this.filtrarApenasConfirmados.set(false);
    this.filtrarApenasConfirmadosPorPessoa.set(false);
    this.filtrarApenasConfirmadosPorEquipe.set(false);
    this.formularioVisivel.set(null);
    this.cancelarEdicao();
    this.resetFormulario();
  }

  // Seleção de pessoa (modo por-pessoa)
  onPessoaSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    if (id) {
      const pessoa = this.pessoas().find(p => p.id === id);
      this.pessoaSelecionada.set(pessoa || null);
    } else {
      this.pessoaSelecionada.set(null);
    }
    this.diaFiltroPessoa.set(null);
    this.equipeFiltroPessoa.set(null);
    this.filtrarApenasConfirmadosPorPessoa.set(false);
    this.resetFormulario();
  }

  // Seleção de equipe (modo por-equipe)
  onEquipeSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    if (id) {
      const equipe = this.equipes().find(e => e.idEquipe?.toString() === id);
      this.equipeSelecionada.set(equipe || null);
    } else {
      this.equipeSelecionada.set(null);
    }
    this.diaExpandido.set(null);
    this.pessoaExpandida.set(null);
  }

  resetFormulario(): void {
    const modo = this.modoVisualizacao();
    const diaSel = modo === 'por-dia' ? this.diaSelecionado() : null;
    const diaInfo = diaSel ? this.getDiaInfo(diaSel) : null;
    const equipeSel = modo === 'por-equipe' ? this.equipeSelecionada()?.idEquipe?.toString() || '' : '';
    this.novaConfirmacao.set({
      idEquipe: equipeSel,
      idDia: diaSel,
      horaInicio: diaInfo?.hora_inicio || '',
      horaFim: diaInfo?.hora_fim || '',
      observacoes: ''
    });
  }

  // Adicionar nova confirmação
  async adicionarConfirmacao(pessoa: Pessoa, idDiaParam?: number): Promise<void> {
    const modo = this.modoVisualizacao();
    const diaSel = idDiaParam || this.novaConfirmacao().idDia;
    
    if (!diaSel || !pessoa.idPessoa) {
      this.errorCadastro.set('Selecione um dia da festa');
      return;
    }

    // Verificar se a data é anterior à data atual
    const diaInfo = this.getDiaInfo(diaSel);
    if (diaInfo) {
      let dataSelecionada: Date;
      if (diaInfo.dia.includes('/')) {
        const [dia, mes, ano] = diaInfo.dia.split('/').map(Number);
        dataSelecionada = new Date(ano, mes - 1, dia);
      } else {
        dataSelecionada = new Date(diaInfo.dia);
      }
      
      const dataAtual = new Date();
      dataAtual.setHours(0, 0, 0, 0);
      dataSelecionada.setHours(0, 0, 0, 0);
      
      if (dataSelecionada < dataAtual) {
        const confirmar = confirm(`Atenção: Você está cadastrando uma participação para uma data passada (${this.formatarData(diaInfo.dia)}). Deseja continuar?`);
        if (!confirmar) {
          return;
        }
      }
    }

    const form = this.novaConfirmacao();
    const idEquipe = form.idEquipe;
    
    if (!idEquipe || idEquipe === '') {
      this.errorCadastro.set('Selecione uma equipe');
      return;
    }
    if (!form.horaInicio || !form.horaFim) {
      this.errorCadastro.set('Informe o horário de início e fim');
      return;
    }
    if (form.horaInicio >= form.horaFim) {
      this.errorCadastro.set('A hora de início deve ser menor que a hora de fim');
      return;
    }

    this.errorCadastro.set(null);
    this.salvando.set(true);
    try {
      await this.confirmacoesService.addConfirmacao({
        idPessoa: pessoa.idPessoa,
        idDia: diaSel,
        idEquipe: idEquipe,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        confirmado: true,
        observacoes: form.observacoes
      });
      
      // Recarregar confirmações
      const confirmacoes = await this.confirmacoesService.getConfirmacoes();
      this.confirmacoes.set(confirmacoes);
      
      // Resetar formulário
      this.resetFormulario();
      
      // Fechar formulário de adicionar
      this.formularioVisivel.set(null);
      
      this.showSuccess(`Participação de ${pessoa.nome} adicionada com sucesso!`);
    } catch (error) {
      console.error('Erro ao adicionar confirmação:', error);
      this.showError('Erro ao adicionar participação');
    } finally {
      this.salvando.set(false);
    }
  }

  // Remover confirmação
  async removerConfirmacao(confirmacao: Confirmacao, pessoa: Pessoa): Promise<void> {
    if (!confirmacao.id) return;

    const confirmar = confirm(`Deseja remover esta participação de ${pessoa.nome}?`);
    if (!confirmar) return;

    // Verificar se a data é anterior à data atual
    const diaInfo = this.getDiaInfo(confirmacao.idDia);
    if (diaInfo) {
      let dataSelecionada: Date;
      if (diaInfo.dia.includes('/')) {
        const [dia, mes, ano] = diaInfo.dia.split('/').map(Number);
        dataSelecionada = new Date(ano, mes - 1, dia);
      } else {
        dataSelecionada = new Date(diaInfo.dia);
      }
      
      const dataAtual = new Date();
      dataAtual.setHours(0, 0, 0, 0);
      dataSelecionada.setHours(0, 0, 0, 0);
      
      if (dataSelecionada < dataAtual) {
        const confirmarDataPassada = confirm(`Atenção: Esta participação é de uma data passada (${this.formatarData(diaInfo.dia)}). Confirma a remoção?`);
        if (!confirmarDataPassada) {
          return;
        }
      }
    }

    try {
      await this.confirmacoesService.deleteConfirmacao(confirmacao.id);
      
      // Recarregar confirmações
      const confirmacoes = await this.confirmacoesService.getConfirmacoes();
      this.confirmacoes.set(confirmacoes);
      
      this.showSuccess('Participação removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover confirmação:', error);
      this.showError('Erro ao remover participação');
    }
  }

  // Iniciar edição de confirmação
  iniciarEdicao(confirmacao: Confirmacao): void {
    this.confirmacaoEditando.set(confirmacao.id || null);
    this.errorEdicao.set(null);
    this.formularioVisivel.set(null); // Fechar formulário de adicionar
    const diaInfo = this.getDiaInfo(confirmacao.idDia);
    this.dadosEdicao.set({
      idEquipe: confirmacao.idEquipe?.toString() || '',
      idDia: confirmacao.idDia,
      horaInicio: confirmacao.horaInicio,
      horaFim: confirmacao.horaFim,
      observacoes: confirmacao.observacoes || ''
    });
  }

  // Cancelar edição
  cancelarEdicao(): void {
    this.confirmacaoEditando.set(null);
    this.errorEdicao.set(null);
    this.dadosEdicao.set({
      idEquipe: '',
      idDia: null,
      horaInicio: '',
      horaFim: '',
      observacoes: ''
    });
  }

  // Verificar se está editando
  isEditando(confirmacaoId: string): boolean {
    return this.confirmacaoEditando() === confirmacaoId;
  }

  // Atualizar confirmação
  async atualizarConfirmacao(confirmacao: Confirmacao, pessoa: Pessoa): Promise<void> {
    if (!confirmacao.id) return;

    const dados = this.dadosEdicao();
    if (!dados.idDia) {
      this.errorEdicao.set('Selecione um dia');
      return;
    }

    // Verificar se a data é anterior à data atual
    const diaInfo = this.getDiaInfo(dados.idDia);
    if (diaInfo) {
      let dataSelecionada: Date;
      if (diaInfo.dia.includes('/')) {
        const [dia, mes, ano] = diaInfo.dia.split('/').map(Number);
        dataSelecionada = new Date(ano, mes - 1, dia);
      } else {
        dataSelecionada = new Date(diaInfo.dia);
      }
      
      const dataAtual = new Date();
      dataAtual.setHours(0, 0, 0, 0);
      dataSelecionada.setHours(0, 0, 0, 0);
      
      if (dataSelecionada < dataAtual) {
        const confirmar = confirm(`Atenção: Você está alterando uma participação para uma data passada (${this.formatarData(diaInfo.dia)}). Deseja continuar?`);
        if (!confirmar) {
          return;
        }
      }
    }

    if (!dados.idEquipe || dados.idEquipe === '') {
      this.errorEdicao.set('Selecione uma equipe');
      return;
    }
    if (!dados.horaInicio || !dados.horaFim) {
      this.errorEdicao.set('Informe o horário de início e fim');
      return;
    }
    if (dados.horaInicio >= dados.horaFim) {
      this.errorEdicao.set('A hora de início deve ser menor que a hora de fim');
      return;
    }

    this.errorEdicao.set(null);
    this.salvando.set(true);
    try {
      const dadosParaAtualizar = {
        ...confirmacao,
        idDia: Number(dados.idDia),
        idEquipe: dados.idEquipe,
        horaInicio: dados.horaInicio,
        horaFim: dados.horaFim,
        observacoes: dados.observacoes
      };
      
      console.log('Atualizando confirmação:', dadosParaAtualizar);
      
      await this.confirmacoesService.updateConfirmacao(confirmacao.id, dadosParaAtualizar);
      
      // Recarregar confirmações
      const confirmacoes = await this.confirmacoesService.getConfirmacoes();
      this.confirmacoes.set(confirmacoes);
      
      this.cancelarEdicao();
      this.showSuccess(`Participação de ${pessoa.nome} atualizada com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar confirmação:', error);
      this.showError('Erro ao atualizar participação');
    } finally {
      this.salvando.set(false);
    }
  }

  updateDadosEdicao(field: keyof NovaConfirmacao, value: string | number | null): void {
    this.dadosEdicao.update(atual => ({
      ...atual,
      [field]: value
    }));
  }

  getNomeEquipe(idEquipe: string | number | string[] | undefined): string {
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

  getDiaInfo(idDia: number): DiaDaFesta | undefined {
    return this.dias().find(d => d.idDia === idDia);
  }

  getPessoaById(idPessoa: string | number): Pessoa | undefined {
    return this.pessoas().find(p => p.idPessoa?.toString() === idPessoa.toString());
  }

  onDiaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.diaSelecionado.set(value ? parseInt(value, 10) : null);
    this.pessoaExpandida.set(null);
    this.resetFormulario();
  }

  onEquipeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.equipeFiltro.set(value || null);
  }

  onDiaFiltroPessoaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.diaFiltroPessoa.set(value ? parseInt(value, 10) : null);
  }

  onEquipeFiltroPessoaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.equipeFiltroPessoa.set(value || null);
  }

  toggleFiltrarConfirmados(): void {
    this.filtrarApenasConfirmados.update(atual => !atual);
  }

  toggleFiltrarConfirmadosPorPessoa(): void {
    this.filtrarApenasConfirmadosPorPessoa.update(atual => !atual);
  }

  onDiaFiltroEquipeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.diaFiltroEquipe.set(value ? parseInt(value, 10) : null);
  }

  onPessoaFiltroEquipeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.pessoaFiltroEquipe.set(value || null);
  }

  toggleFiltrarConfirmadosPorEquipe(): void {
    this.filtrarApenasConfirmadosPorEquipe.update(atual => !atual);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onDiaFiltroCardPessoaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.diaFiltroCardPessoa.set(value ? parseInt(value, 10) : null);
  }

  onEquipeFiltroCardPessoaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.equipeFiltroCardPessoa.set(value || null);
  }

  getConfirmacoesPorPessoa(idPessoa: string | number | undefined): Confirmacao[] {
    if (!idPessoa) return [];
    let confirmacoes = this.confirmacoesDaPessoa().filter(c => c.idPessoa.toString() === idPessoa.toString());
    
    // Aplicar filtro de dia se selecionado
    const diaFiltro = this.diaFiltroCardPessoa();
    if (diaFiltro) {
      confirmacoes = confirmacoes.filter(c => c.idDia === diaFiltro);
    }
    
    // Aplicar filtro de equipe se selecionado
    const equipeFiltro = this.equipeFiltroCardPessoa();
    if (equipeFiltro) {
      confirmacoes = confirmacoes.filter(c => c.idEquipe?.toString() === equipeFiltro.toString());
    }
    
    // Ordenar: por dia (mais recente primeiro) e por horário (mais cedo primeiro)
    return confirmacoes.sort((a, b) => {
      // Obter informações dos dias
      const diaA = this.getDiaInfo(a.idDia);
      const diaB = this.getDiaInfo(b.idDia);
      
      if (!diaA || !diaB) return 0;
      
      // Converter dia para data, tratando ambos os formatos
      let dateA: Date;
      let dateB: Date;
      
      if (diaA.dia.includes('/')) {
        const [diaNumA, mesA, anoA] = diaA.dia.split('/').map(Number);
        dateA = new Date(anoA, mesA - 1, diaNumA);
      } else {
        dateA = new Date(diaA.dia);
      }
      
      if (diaB.dia.includes('/')) {
        const [diaNumB, mesB, anoB] = diaB.dia.split('/').map(Number);
        dateB = new Date(anoB, mesB - 1, diaNumB);
      } else {
        dateB = new Date(diaB.dia);
      }
      
      // Ordenar por data (mais recente primeiro = DESC)
      const dateDiff = dateB.getTime() - dateA.getTime();
      if (dateDiff !== 0) return dateDiff;
      
      // Se mesmo dia, ordenar por horário de início (mais cedo primeiro = ASC)
      return a.horaInicio.localeCompare(b.horaInicio);
    });
  }

  updateNovaConfirmacao(field: keyof NovaConfirmacao, value: string | number | null): void {
    this.novaConfirmacao.update(atual => ({
      ...atual,
      [field]: value
    }));
    
    // Atualizar horários quando o dia é selecionado
    if (field === 'idDia' && value) {
      const diaInfo = this.getDiaInfo(value as number);
      if (diaInfo) {
        this.novaConfirmacao.update(atual => ({
          ...atual,
          horaInicio: diaInfo.hora_inicio,
          horaFim: diaInfo.hora_fim
        }));
      }
    }
  }

  // Pessoas filtradas no modo por-pessoa
  pessoasFiltadasPorPessoa = computed(() => {
    let resultado = this.pessoas();

    // Filtrar por equipe
    const equipeSel = this.equipeFiltroPessoa();
    if (equipeSel) {
      resultado = resultado.filter(p => {
        if (!p.idEquipe) return false;
        const equipes = Array.isArray(p.idEquipe) 
          ? p.idEquipe 
          : p.idEquipe.toString().split(',');
        return equipes.some(e => e.toString().trim() === equipeSel);
      });
    }

    // Filtrar por dia (pessoas que têm confirmação naquele dia)
    const diaSel = this.diaFiltroPessoa();
    if (diaSel) {
      resultado = resultado.filter(p => {
        const confirmacoesDaPessoa = this.confirmacoes().filter(
          c => c.idPessoa.toString() === p.idPessoa?.toString() && c.idDia === diaSel && c.confirmado
        );
        return confirmacoesDaPessoa.length > 0;
      });
    }

    // Filtrar apenas confirmados
    if (this.filtrarApenasConfirmadosPorPessoa()) {
      resultado = resultado.filter(p => 
        this.getConfirmacoesDaPessoaFiltradas(p.idPessoa!).length > 0
      );
    }

    // Filtrar por busca
    const termo = this.normalizeString(this.searchTerm());
    if (termo) {
      resultado = resultado.filter(p => 
        this.normalizeString(p.nome).includes(termo) ||
        p.idPessoa?.toString().includes(termo)
      );
    }

    // Ordenar por nome
    return resultado.sort((a, b) => 
      this.normalizeString(a.nome).localeCompare(this.normalizeString(b.nome), 'pt-BR')
    );
  });

  // Obter confirmações de uma pessoa (modo por-pessoa, considerando filtro de dia)
  getConfirmacoesDaPessoaFiltradas(idPessoa: string | number): Confirmacao[] {
    const diaSel = this.diaFiltroPessoa();
    
    return this.confirmacoes().filter(c => {
      const matchPessoa = c.idPessoa.toString() === idPessoa.toString() && c.confirmado;
      if (!diaSel) return matchPessoa;
      return matchPessoa && c.idDia === diaSel;
    });
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(null), 3000);
  }
}
