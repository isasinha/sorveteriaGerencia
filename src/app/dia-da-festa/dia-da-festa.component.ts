// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { DiaDaFestaService, DiaDaFesta } from '../core/services/dia-da-festa.service';
import { EquipesService, Equipe } from '../core/services/equipes.service';
import { ConfirmacoesService, Confirmacao } from '../core/services/confirmacoes.service';
import { PessoasService, Pessoa } from '../core/services/pessoas.service';

@Component({
  selector: 'app-dia-da-festa',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent],
  templateUrl: './dia-da-festa.component.html',
  styleUrl: './dia-da-festa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiaDaFestaComponent implements OnInit {
  diasDaFesta = signal<DiaDaFesta[]>([]);
  equipes = signal<Equipe[]>([]);
  showForm = signal<boolean>(false);
  diaEmEdicao = signal<DiaDaFesta | null>(null);
  successMessage = signal<string | null>(null);
  
  // Campos do formulário
  dia = signal<string>('');
  dia_semana = signal<string>('');
  hora_inicio = signal<string>('');
  hora_fim = signal<string>('');
  salvando = signal<boolean>(false);
  erro = signal<string | null>(null);
  
  // Seleções
  diaSelecionado = signal<string>('');
  equipeSelecionada = signal<string>('');
  
  // Escala visual
  confirmacoes = signal<Confirmacao[]>([]);
  pessoas = signal<Pessoa[]>([]);
  carregandoEscala = signal<boolean>(false);

  // Computed signals para ordenação
  diasOrdenados = computed(() => {
    return [...this.diasDaFesta()].sort((a, b) => {
      // Converter DD/MM/AAAA para Date para comparação
      const dataA = this.converterParaDate(a.dia);
      const dataB = this.converterParaDate(b.dia);
      return dataB.getTime() - dataA.getTime(); // Mais recente primeiro
    });
  });

  equipesOrdenadas = computed(() => {
    return [...this.equipes()].sort((a, b) => {
      // "Temporariamente sem equipe" sempre primeiro
      if (a.nome === 'Temporariamente sem equipe') return -1;
      if (b.nome === 'Temporariamente sem equipe') return 1;
      
      // Demais equipes em ordem alfabética
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  });

  constructor(
    private diaDaFestaService: DiaDaFestaService,
    private equipesService: EquipesService,
    private confirmacoesService: ConfirmacoesService,
    private pessoasService: PessoasService
  ) {
    // Effect para carregar escala quando dia ou equipe mudarem
    effect(() => {
      const dia = this.diaSelecionado();
      const equipe = this.equipeSelecionada();
      if (dia && equipe) {
        this.carregarEscala();
      } else {
        this.confirmacoes.set([]);
        this.pessoas.set([]);
      }
    });
  }

  async ngOnInit() {
    await this.carregarDias();
    await this.carregarEquipes();
  }

  async carregarDias() {
    try {
      const dias = await this.diaDaFestaService.getDiasDaFesta();
      this.diasDaFesta.set(dias);
    } catch (error) {
      console.error('Erro ao carregar dias da festa:', error);
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

  // Bloquear digitação de caracteres não numéricos
  bloquearNaoNumerico(event: KeyboardEvent): void {
    const key = event.key;
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '/'];
    
    if (allowedKeys.includes(key)) {
      return;
    }
    
    if (key >= '0' && key <= '9') {
      return;
    }
    
    event.preventDefault();
  }

  // Aplicar máscara de data DD/MM/AAAA
  aplicarMascaraData(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    if (valor.length >= 5) {
      valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
    }
    
    this.dia.set(valor);
    
    // Calcular dia da semana automaticamente
    if (valor.length === 10) {
      this.calcularDiaDaSemana(valor);
    } else {
      this.dia_semana.set('');
    }
  }

  // Calcular dia da semana a partir da data DD/MM/AAAA
  calcularDiaDaSemana(data: string): void {
    const [dia, mes, ano] = data.split('/').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    
    // Verificar se a data é válida
    if (dataObj.getDate() !== dia || dataObj.getMonth() !== mes - 1 || dataObj.getFullYear() !== ano) {
      this.dia_semana.set('');
      return;
    }
    
    const diasDaSemana = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];
    
    this.dia_semana.set(diasDaSemana[dataObj.getDay()]);
  }

  openForm() {
    this.diaEmEdicao.set(null);
    this.dia.set('');
    this.dia_semana.set('');
    this.hora_inicio.set('');
    this.hora_fim.set('');
    this.erro.set(null);
    this.showForm.set(true);
  }

  openEditForm(dia: DiaDaFesta) {
    this.diaEmEdicao.set(dia);
    this.dia.set(dia.dia);
    this.dia_semana.set(dia.dia_semana);
    this.hora_inicio.set(dia.hora_inicio);
    this.hora_fim.set(dia.hora_fim);
    this.erro.set(null);
    this.showForm.set(true);
  }

  editarDiaSelecionado() {
    const diaInfo = this.getDiaSelecionadoInfo();
    if (diaInfo) {
      this.openEditForm(diaInfo);
    }
  }

  async deletar() {
    const diaEdit = this.diaEmEdicao();
    if (!diaEdit?.id) return;

    const mensagem = `⚠️ ATENÇÃO! ⚠️\n\nVocê está prestes a excluir o dia ${this.formatarDia(diaEdit.dia)}.\n\n❌ TODAS as confirmações de participação deste dia serão CANCELADAS.\n\n⏳ Esta ação NÃO PODERÁ SER DESFEITA!\n\nDeseja realmente continuar?`;
    
    if (!confirm(mensagem)) {
      return;
    }

    try {
      this.salvando.set(true);
      this.erro.set(null);

      // Excluir todas as confirmações relacionadas ao dia
      const confirmacoes = await this.confirmacoesService.getConfirmacoes();
      const confirmacoesParaExcluir = confirmacoes.filter(c => c.idDia === diaEdit.idDia);
      for (const conf of confirmacoesParaExcluir) {
        if (conf.id) {
          await this.confirmacoesService.deleteConfirmacao(conf.id);
        }
      }

      await this.diaDaFestaService.deleteDiaDaFesta(diaEdit.id);
      
      // Atualizar lista
      await this.carregarDias();
      
      // Limpar seleção se era o dia excluído
      if (this.diaSelecionado() === diaEdit.idDia?.toString()) {
        this.diaSelecionado.set('');
      }

      this.successMessage.set('Dia da festa excluído com sucesso!');
      setTimeout(() => this.successMessage.set(null), 3000);
      
      this.closeForm();
    } catch (error) {
      console.error('Erro ao excluir dia da festa:', error);
      this.erro.set('Erro ao excluir dia da festa. Tente novamente.');
    } finally {
      this.salvando.set(false);
    }
  }

  closeForm() {
    this.showForm.set(false);
    this.diaEmEdicao.set(null);
    this.dia.set('');
    this.dia_semana.set('');
    this.hora_inicio.set('');
    this.hora_fim.set('');
    this.erro.set(null);
  }

  async onSubmit() {
    // Validações
    if (!this.dia().trim()) {
      this.erro.set('O dia é obrigatório');
      return;
    }
    
    // Validar formato dd/MM/yyyy
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regexData.test(this.dia().trim())) {
      this.erro.set('O dia deve estar no formato DD/MM/AAAA');
      return;
    }
    
    // Validar se é uma data válida
    const [dia, mes, ano] = this.dia().trim().split('/').map(Number);
    const dataValida = new Date(ano, mes - 1, dia);
    if (dataValida.getDate() !== dia || dataValida.getMonth() !== mes - 1 || dataValida.getFullYear() !== ano) {
      this.erro.set('Data inválida');
      return;
    }
    
    if (!this.dia_semana().trim()) {
      this.erro.set('O dia da semana é obrigatório');
      return;
    }
    if (!this.hora_inicio().trim()) {
      this.erro.set('A hora de início é obrigatória');
      return;
    }
    if (!this.hora_fim().trim()) {
      this.erro.set('A hora de fim é obrigatória');
      return;
    }

    // Validar se hora de fim não é antes da hora de início
    if (this.hora_fim() <= this.hora_inicio()) {
      this.erro.set('A hora de fim deve ser posterior à hora de início');
      return;
    }

    // Validar se já existe cadastro para este dia (exceto em modo edição)
    const diaEdit = this.diaEmEdicao();
    const diaExistente = this.diasDaFesta().find(d => 
      d.dia === this.dia().trim() && (!diaEdit || d.id !== diaEdit.id)
    );
    if (diaExistente) {
      this.erro.set('Já existe um cadastro para este dia');
      return;
    }

    this.salvando.set(true);

    try {
      const diaEdit = this.diaEmEdicao();
      
      if (diaEdit && diaEdit.id) {
        // Modo edição
        const diaAtualizado: Partial<DiaDaFesta> = {
          dia: this.dia().trim(),
          dia_semana: this.dia_semana().trim(),
          hora_inicio: this.hora_inicio().trim(),
          hora_fim: this.hora_fim().trim(),
        };

        await this.diaDaFestaService.updateDiaDaFesta(diaEdit.id, diaAtualizado);
        this.showSuccessMessage('Dia da festa atualizado com sucesso!');
      } else {
        // Modo criação
        const proximoId = await this.diaDaFestaService.getProximoIdDia();

        const novoDia: DiaDaFesta = {
          idDia: proximoId,
          dia: this.dia().trim(),
          dia_semana: this.dia_semana().trim(),
          hora_inicio: this.hora_inicio().trim(),
          hora_fim: this.hora_fim().trim(),
        };

        await this.diaDaFestaService.addDiaDaFesta(novoDia);
        this.showSuccessMessage('Dia da festa adicionado com sucesso!');
      }

      await this.carregarDias();
      this.closeForm();
    } catch (err: any) {
      console.error('Erro ao salvar dia da festa:', err);
      this.erro.set('Erro ao salvar. Tente novamente.');
    } finally {
      this.salvando.set(false);
    }
  }

  async onExcluir(dia: DiaDaFesta) {
    const mensagem = `⚠️ ATENÇÃO! ⚠️\n\nVocê está prestes a excluir o dia ${dia.dia}.\n\n❌ TODAS as confirmações de participação deste dia serão CANCELADAS.\n\n⏳ Esta ação NÃO PODERÁ SER DESFEITA!\n\nDeseja realmente continuar?`;
    
    const confirmacao = confirm(mensagem);
    if (confirmacao && dia.id) {
      try {
        // Excluir todas as confirmações relacionadas ao dia
        const confirmacoes = await this.confirmacoesService.getConfirmacoes();
        const confirmacoesParaExcluir = confirmacoes.filter(c => c.idDia === dia.idDia);
        for (const conf of confirmacoesParaExcluir) {
          if (conf.id) {
            await this.confirmacoesService.deleteConfirmacao(conf.id);
          }
        }

        await this.diaDaFestaService.deleteDiaDaFesta(dia.id);
        await this.carregarDias();
        this.showSuccessMessage('Dia da festa excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir dia da festa:', error);
        alert('Erro ao excluir. Tente novamente.');
      }
    }
  }

  getDiaSelecionadoInfo(): DiaDaFesta | undefined {
    const idDia = Number(this.diaSelecionado());
    return this.diasDaFesta().find(d => d.idDia === idDia);
  }

  getEquipeSelecionadaInfo(): Equipe | undefined {
    const idEquipe = Number(this.equipeSelecionada());
    return this.equipes().find(e => e.idEquipe === idEquipe);
  }

  converterParaDate(dataStr: string): Date {
    // Converter DD/MM/AAAA para Date
    // Primeiro, aplicar formatação se necessário
    const dataFormatada = this.formatarDia(dataStr);
    const partes = dataFormatada.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Mês começa em 0
      const ano = parseInt(partes[2], 10);
      return new Date(ano, mes, dia);
    }
    return new Date(); // Fallback
  }

  formatarDia(dia: string): string {
    if (!dia) return '';
    
    // Se já está no formato DD/MM/AAAA, retorna como está
    if (dia.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dia;
    }
    
    // Se está no formato AAAA-MM-DD ou AAAA/MM/DD, converte
    if (dia.match(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/)) {
      const [ano, mes, diaNum] = dia.split(/[-\/]/);
      return `${diaNum}/${mes}/${ano}`;
    }
    
    return dia;
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  // Métodos para escala visual
  async carregarEscala() {
    this.carregandoEscala.set(true);
    try {
      const idDia = Number(this.diaSelecionado());
      const equipeSelecionada = this.equipeSelecionada();

      console.log('Carregando escala para:', { idDia, equipeSelecionada });

      // Buscar todas as confirmações do dia
      const todasConfirmacoes = await this.confirmacoesService.getConfirmacoesByDia(idDia);
      console.log('Todas confirmações do dia:', todasConfirmacoes);
      
      // Filtrar confirmações pela equipe selecionada (se não for 'todas')
      const confirmacoesEquipe = equipeSelecionada === 'todas' 
        ? todasConfirmacoes
        : todasConfirmacoes.filter(c => {
            const idConfEquipe = Number(c.idEquipe);
            const idEquipe = Number(equipeSelecionada);
            return idConfEquipe === idEquipe;
          });
      console.log('Confirmações da equipe:', confirmacoesEquipe);
      
      // Buscar IDs únicos das pessoas que confirmaram
      const idsComConfirmacao = new Set(confirmacoesEquipe.map(c => String(c.idPessoa)));
      console.log('IDs com confirmação:', Array.from(idsComConfirmacao));
      
      // Buscar todas as pessoas
      const todasPessoas = await this.pessoasService.getPessoas();
      
      let pessoasParaExibir: Pessoa[];
      
      if (equipeSelecionada === 'todas') {
        // Se for "todas", mostrar todas as pessoas (com e sem confirmação)
        const pessoasQueConfirmaram = todasPessoas.filter(p => idsComConfirmacao.has(String(p.idPessoa)));
        const pessoasQueNaoConfirmaram = todasPessoas.filter(p => !idsComConfirmacao.has(String(p.idPessoa)));
        
        // Ordenar cada grupo
        pessoasQueConfirmaram.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        pessoasQueNaoConfirmaram.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        
        // Concatenar: com confirmação primeiro, depois sem
        pessoasParaExibir = [...pessoasQueConfirmaram, ...pessoasQueNaoConfirmaram];
        
        console.log('Pessoas com confirmação:', pessoasQueConfirmaram.length);
        console.log('Pessoas sem confirmação:', pessoasQueNaoConfirmaram.length);
      } else {
        // Se for equipe específica:
        // 1. Pessoas que confirmaram para esta equipe (independente da equipe atual)
        // 2. Pessoas que pertencem à equipe (mesmo sem confirmação)
        const idEquipe = Number(equipeSelecionada);
        console.log('Filtrando pessoas da equipe:', idEquipe);
        console.log('Tipo do ID selecionado:', typeof equipeSelecionada, equipeSelecionada);
        
        // Pessoas que confirmaram para esta equipe
        const pessoasQueConfirmaram = todasPessoas.filter(p => idsComConfirmacao.has(String(p.idPessoa)));
        console.log('Pessoas que confirmaram:', pessoasQueConfirmaram.map(p => `${p.nome} (equipe: ${p.idEquipe})`));
        
        // Pessoas cadastradas na equipe - debug completo
        console.log('Verificando todas as pessoas:');
        todasPessoas.forEach(p => {
          console.log(`  - ${p.nome}: idEquipe = "${p.idEquipe}" (tipo: ${typeof p.idEquipe})`);
        });
        
        const pessoasDaEquipe = todasPessoas.filter(p => {
          if (!p.idEquipe) return false;
          
          // Converter idEquipe para string e verificar se contém a equipe selecionada
          const equipesStr = String(p.idEquipe);
          
          // Se for múltiplas equipes (separadas por vírgula ou espaço)
          if (equipesStr.includes(',') || equipesStr.includes(' ')) {
            const equipes = equipesStr.split(/[,\s]+/).map(e => e.trim()).filter(e => e);
            const match = equipes.some(e => Number(e) === idEquipe || e === String(idEquipe));
            if (match) {
              console.log(`  ✓ ${p.nome} pertence à equipe ${idEquipe} (equipes: ${equipesStr})`);
            }
            return match;
          }
          
          // Se for equipe única
          const idPessoaEquipe = Number(p.idEquipe);
          const match = idPessoaEquipe === idEquipe;
          if (match) {
            console.log(`  ✓ ${p.nome} pertence à equipe ${idEquipe}`);
          }
          return match;
        });
        console.log('Pessoas cadastradas na equipe:', pessoasDaEquipe.map(p => `${p.nome}`));
        
        // Combinar os dois grupos (sem duplicar)
        const idsPessoasJaIncluidas = new Set(pessoasQueConfirmaram.map(p => String(p.idPessoa)));
        const pessoasDaEquipeSemConfirmacao = pessoasDaEquipe.filter(p => !idsPessoasJaIncluidas.has(String(p.idPessoa)));
        
        // Função auxiliar para verificar se pessoa pertence à equipe
        const pertenceAEquipe = (pessoa: Pessoa): boolean => {
          if (!pessoa.idEquipe) return false;
          const equipesStr = String(pessoa.idEquipe);
          
          if (equipesStr.includes(',') || equipesStr.includes(' ')) {
            const equipes = equipesStr.split(/[,\s]+/).map(e => e.trim()).filter(e => e);
            return equipes.some(e => Number(e) === idEquipe || e === String(idEquipe));
          }
          
          return Number(pessoa.idEquipe) === idEquipe;
        };
        
        // Separar pessoas que confirmaram em: da equipe e de outras equipes
        const pessoasComConfirmacaoDaEquipe = pessoasQueConfirmaram.filter(p => pertenceAEquipe(p));
        const pessoasComConfirmacaoOutrasEquipes = pessoasQueConfirmaram.filter(p => !pertenceAEquipe(p));
        
        console.log('Pessoas COM confirmação da equipe:', pessoasComConfirmacaoDaEquipe.map(p => p.nome));
        console.log('Pessoas COM confirmação de outras equipes:', pessoasComConfirmacaoOutrasEquipes.map(p => p.nome));
        console.log('Pessoas SEM confirmação da equipe:', pessoasDaEquipeSemConfirmacao.map(p => p.nome));
        
        // Ordenar cada grupo por nome
        pessoasComConfirmacaoDaEquipe.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        pessoasComConfirmacaoOutrasEquipes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        pessoasDaEquipeSemConfirmacao.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        
        // Concatenar: com confirmação (equipe atual) + com confirmação (outras equipes) + sem confirmação
        pessoasParaExibir = [
          ...pessoasComConfirmacaoDaEquipe,
          ...pessoasComConfirmacaoOutrasEquipes,
          ...pessoasDaEquipeSemConfirmacao
        ];
        
        console.log('Total pessoas com confirmação:', pessoasQueConfirmaram.length);
        console.log('Total pessoas sem confirmação:', pessoasDaEquipeSemConfirmacao.length);
      }
      
      console.log('Total de pessoas para exibir:', pessoasParaExibir.length);
      
      this.confirmacoes.set(confirmacoesEquipe);
      this.pessoas.set(pessoasParaExibir);
    } catch (error) {
      console.error('Erro ao carregar escala:', error);
    } finally {
      this.carregandoEscala.set(false);
    }
  }

  gerarHorarios(): string[] {
    const diaInfo = this.getDiaSelecionadoInfo();
    if (!diaInfo) return [];

    // Obter horários do dia
    let inicioMinutos = this.converterHoraParaMinutos(diaInfo.hora_inicio);
    let fimMinutos = this.converterHoraParaMinutos(diaInfo.hora_fim);

    // Verificar confirmações para pegar horários reais (pode ter pessoas chegando antes/saindo depois)
    const confirmacoes = this.confirmacoes();
    if (confirmacoes.length > 0) {
      confirmacoes.forEach(conf => {
        const confInicio = this.converterHoraParaMinutos(conf.horaInicio);
        const confFim = this.converterHoraParaMinutos(conf.horaFim);
        
        // Pegar o menor início e o maior fim
        if (confInicio < inicioMinutos) {
          inicioMinutos = confInicio;
        }
        if (confFim > fimMinutos) {
          fimMinutos = confFim;
        }
      });
    }

    const horarios: string[] = [];
    for (let minutos = inicioMinutos; minutos <= fimMinutos; minutos += 30) {
      horarios.push(this.converterMinutosParaHora(minutos));
    }

    return horarios;
  }

  converterHoraParaMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  converterMinutosParaHora(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  getPrimeiroNome(nomeCompleto: string): string {
    return nomeCompleto.split(' ')[0];
  }

  isPeriodoConfirmado(pessoa: Pessoa, horarioInicio: string): boolean {
    const confirmacoesPessoa = this.confirmacoes().filter(
      c => String(c.idPessoa) === String(pessoa.idPessoa)
    );

    const inicioMinutos = this.converterHoraParaMinutos(horarioInicio);
    const fimMinutos = inicioMinutos + 30;

    return confirmacoesPessoa.some(conf => {
      const confInicio = this.converterHoraParaMinutos(conf.horaInicio);
      const confFim = this.converterHoraParaMinutos(conf.horaFim);
      
      // Verifica se o período de 30 min está dentro da confirmação
      return inicioMinutos >= confInicio && fimMinutos <= confFim;
    });
  }

  temConfirmacao(pessoa: Pessoa): boolean {
    return this.confirmacoes().some(c => String(c.idPessoa) === String(pessoa.idPessoa));
  }

  pertenceAEquipeAtual(pessoa: Pessoa): boolean {
    const equipeSelecionada = this.equipeSelecionada();
    if (equipeSelecionada === 'todas') return true;
    
    if (!pessoa.idEquipe) return false;
    const idEquipe = Number(equipeSelecionada);
    const equipesStr = String(pessoa.idEquipe);
    
    if (equipesStr.includes(',') || equipesStr.includes(' ')) {
      const equipes = equipesStr.split(/[,\s]+/).map(e => e.trim()).filter(e => e);
      return equipes.some(e => Number(e) === idEquipe || e === String(idEquipe));
    }
    
    return Number(pessoa.idEquipe) === idEquipe;
  }

  getNomesEquipes(pessoa: Pessoa): string {
    if (!pessoa.idEquipe) return 'Sem equipe';
    
    const equipesStr = String(pessoa.idEquipe);
    let idsEquipes: string[];
    
    if (equipesStr.includes(',') || equipesStr.includes(' ')) {
      idsEquipes = equipesStr.split(/[,\s]+/).map(e => e.trim()).filter(e => e);
    } else {
      idsEquipes = [equipesStr];
    }
    
    const nomesEquipes = idsEquipes.map(idEquipe => {
      const equipe = this.equipes().find(e => String(e.idEquipe) === String(idEquipe));
      return equipe ? equipe.nome : `Equipe ${idEquipe}`;
    });
    
    return nomesEquipes.join(', ');
  }

  isHorarioForaDaFesta(horario: string): boolean {
    const diaInfo = this.getDiaSelecionadoInfo();
    if (!diaInfo) return false;

    const horarioMinutos = this.converterHoraParaMinutos(horario);
    const inicioFesta = this.converterHoraParaMinutos(diaInfo.hora_inicio);
    const fimFesta = this.converterHoraParaMinutos(diaInfo.hora_fim);

    return horarioMinutos < inicioFesta || horarioMinutos >= fimFesta;
  }
}
