import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { DiaDaFestaService, DiaDaFesta } from '../core/services/dia-da-festa.service';
import { EquipesService, Equipe } from '../core/services/equipes.service';
import { PessoasService, Pessoa } from '../core/services/pessoas.service';
import { PresencaService, Presenca } from '../core/services/presenca.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LinhaRelatorio {
  pessoaId: string;
  nome: string;
  equipeNome: string;
  idEquipe: string;
  idDia: number;
  diaLabel: string;
  ano: number;
  horaPlanejamento: string;
  horaPresenca: string;
  confirmado: boolean;
  presente: boolean;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatoriosComponent implements OnInit {
  private diasDaFesta = signal<DiaDaFesta[]>([]);
  private todasPessoas = signal<Pessoa[]>([]);
  private confirmacoes = signal<Presenca[]>([]);
  private presencas = signal<Presenca[]>([]);

  equipes = signal<Equipe[]>([]);
  loading = signal(true);
  carregandoDados = signal(false);

  anoSelecionado = signal<number | null>(null);
  idDiaSelecionado = signal<number | null>(null);
  idEquipeSelecionada = signal<string>('');
  filtroStatus = signal<'todos' | 'confirmados' | 'presentes'>('todos');

  readonly allSortKeys = ['dia', 'equipe', 'nome', 'horaPresenca'] as const;
  sortOrdem = signal<('dia' | 'equipe' | 'nome' | 'horaPresenca')[]>([]);

  sortKeysDisponiveis = computed(() =>
    this.allSortKeys.filter(k => !this.sortOrdem().includes(k))
  );

  anos = computed(() => {
    const set = new Set<number>();
    for (const dia of this.diasDaFesta()) {
      const ano = this.extrairAno(dia.dia);
      if (ano) set.add(ano);
    }
    return [...set].sort((a, b) => b - a);
  });

  diasDoAno = computed(() => {
    const ano = this.anoSelecionado();
    if (!ano) return [];
    return [...this.diasDaFesta()]
      .filter(d => this.extrairAno(d.dia) === ano)
      .sort((a, b) => this.converterParaDate(a.dia).getTime() - this.converterParaDate(b.dia).getTime());
  });

  todasLinhas = computed(() => {
    const pessoas = this.todasPessoas();
    const confirmacoes = this.confirmacoes();
    const presencas = this.presencas();
    const dias = this.diasDaFesta();
    const equipes = this.equipes();

    const pessoaMap = new Map<string, Pessoa>();
    for (const p of pessoas) {
      const key = String(p.id ?? p.idPessoa);
      pessoaMap.set(key, p);
      if (p.id) pessoaMap.set(String(p.id), p);
      if (p.idPessoa) pessoaMap.set(String(p.idPessoa), p);
    }
    const equipeMap = new Map(equipes.map(e => [String(e.idEquipe), e]));
    const diaMap = new Map(dias.map(d => [d.idDia!, d]));

    const chaves = new Set<string>();
    for (const c of confirmacoes) chaves.add(`${c.idPessoa}|${c.idDia}`);
    for (const p of presencas) chaves.add(`${p.idPessoa}|${p.idDia}`);

    const linhas: LinhaRelatorio[] = [];

    for (const chave of chaves) {
      const [idPessoa, idDiaStr] = chave.split('|');
      const idDia = Number(idDiaStr);

      const pessoa = pessoaMap.get(idPessoa);
      const dia = diaMap.get(idDia);
      if (!pessoa || !dia) continue;

      const confirmacoesEntry = confirmacoes
        .filter(c => String(c.idPessoa) === idPessoa && c.idDia === idDia)
        .sort((a, b) => (a.sequencia ?? 1) - (b.sequencia ?? 1));

      const presencasEntry = presencas
        .filter(p => String(p.idPessoa) === idPessoa && p.idDia === idDia)
        .sort((a, b) => (a.sequencia ?? 1) - (b.sequencia ?? 1));

      const idEquipe = presencasEntry[0]?.idEquipe || confirmacoesEntry[0]?.idEquipe || '';
      const equipe = equipeMap.get(String(idEquipe));

      const formatarTimes = (entries: Presenca[]): string => {
        if (entries.length === 0) return '';
        return entries
          .filter(e => e.horaChegada)
          .map(e => e.horaSaida ? `${e.horaChegada}-${e.horaSaida}` : e.horaChegada)
          .join(' / ');
      };

      linhas.push({
        pessoaId: String(pessoa.id),
        nome: pessoa.nome,
        equipeNome: equipe?.nome ?? (idEquipe || ''),
        idEquipe: String(idEquipe),
        idDia,
        diaLabel: this.formatarDia(dia),
        ano: this.extrairAno(dia.dia) ?? 0,
        horaPlanejamento: formatarTimes(confirmacoesEntry),
        horaPresenca: formatarTimes(presencasEntry),
        confirmado: confirmacoesEntry.length > 0,
        presente: presencasEntry.length > 0,
      });
    }

    linhas.sort((a, b) => {
      const nomeComp = a.nome.localeCompare(b.nome, 'pt-BR');
      if (nomeComp !== 0) return nomeComp;
      return a.idDia - b.idDia;
    });

    return linhas;
  });

  linhasFiltradas = computed(() => {
    let linhas = this.todasLinhas();

    const ano = this.anoSelecionado();
    if (ano) linhas = linhas.filter(l => l.ano === ano);

    const idDia = this.idDiaSelecionado();
    if (idDia) linhas = linhas.filter(l => l.idDia === idDia);

    const idEquipe = this.idEquipeSelecionada();
    if (idEquipe) linhas = linhas.filter(l => l.idEquipe === idEquipe);

    const status = this.filtroStatus();
    if (status === 'confirmados') linhas = linhas.filter(l => l.confirmado);
    if (status === 'presentes') linhas = linhas.filter(l => l.presente);

    const ordem = this.sortOrdem();
    if (ordem.length > 0) {
      linhas = [...linhas].sort((a, b) => {
        for (const key of ordem) {
          let cmp = 0;
          switch (key) {
            case 'dia': cmp = a.idDia - b.idDia; break;
            case 'nome': cmp = a.nome.localeCompare(b.nome, 'pt-BR'); break;
            case 'equipe': cmp = a.equipeNome.localeCompare(b.equipeNome, 'pt-BR'); break;
            case 'horaPresenca': cmp = (a.horaPresenca || '').localeCompare(b.horaPresenca || ''); break;
          }
          if (cmp !== 0) return cmp;
        }
        return 0;
      });
    }

    return linhas;
  });

  constructor(
    private diaDaFestaService: DiaDaFestaService,
    private equipesService: EquipesService,
    private pessoasService: PessoasService,
    private presencaService: PresencaService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [dias, pessoas, equipes] = await Promise.all([
        this.diaDaFestaService.getDiasDaFesta(),
        this.pessoasService.getPessoas(),
        this.equipesService.getEquipes()
      ]);
      this.diasDaFesta.set(dias);
      this.todasPessoas.set(pessoas);
      this.equipes.set(equipes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));

      const anos = this.anos();
      if (anos.length > 0) {
        await this.carregarAno(anos[0]);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async carregarAno(ano: number): Promise<void> {
    this.anoSelecionado.set(ano);
    this.idDiaSelecionado.set(null);
    this.carregandoDados.set(true);
    try {
      const [confirmacoes, presencas] = await Promise.all([
        this.presencaService.getConfirmacoesAntesByAno(ano),
        this.presencaService.getPresencasByAno(ano)
      ]);
      this.confirmacoes.set(confirmacoes);
      this.presencas.set(presencas);
    } finally {
      this.carregandoDados.set(false);
    }
  }

  async carregarTodosAnos(): Promise<void> {
    this.anoSelecionado.set(null);
    this.idDiaSelecionado.set(null);
    this.carregandoDados.set(true);
    try {
      const anos = this.anos();
      const allConfirmacoes: Presenca[] = [];
      const allPresencas: Presenca[] = [];
      for (const ano of anos) {
        const [confs, preses] = await Promise.all([
          this.presencaService.getConfirmacoesAntesByAno(ano),
          this.presencaService.getPresencasByAno(ano)
        ]);
        allConfirmacoes.push(...confs);
        allPresencas.push(...preses);
      }
      this.confirmacoes.set(allConfirmacoes);
      this.presencas.set(allPresencas);
    } finally {
      this.carregandoDados.set(false);
    }
  }

  private extrairAno(diaStr: string): number | null {
    if (!diaStr) return null;
    if (diaStr.includes('/')) {
      const parts = diaStr.split('/');
      return parts.length === 3 ? parseInt(parts[2], 10) : null;
    }
    const parts = diaStr.split('-');
    return parts.length >= 1 ? parseInt(parts[0], 10) : null;
  }

  private converterParaDate(diaStr: string): Date {
    if (!diaStr) return new Date(0);
    if (diaStr.includes('/')) {
      const [d, m, y] = diaStr.split('/');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    return new Date(diaStr);
  }

  formatarDia(dia: DiaDaFesta): string {
    return `${dia.dia_semana} ${dia.dia}`;
  }

  gerarPDF(): void {
    const linhas = this.linhasFiltradas();
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });

    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Relatório de Voluntários', 14, 14);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const info: string[] = [];
    if (this.anoSelecionado()) info.push(`Ano: ${this.anoSelecionado()}`);
    if (this.idEquipeSelecionada()) {
      const eq = this.equipes().find(e => String(e.idEquipe) === this.idEquipeSelecionada());
      if (eq) info.push(`Equipe: ${eq.nome}`);
    }
    if (this.filtroStatus() !== 'todos') info.push(this.filtroStatus() === 'confirmados' ? 'Confirmados' : 'Presentes');
    info.push(`${linhas.length} registro(s)`);
    doc.text(info.join(' · '), 14, 21);

    autoTable(doc, {
      startY: 26,
      head: [['Nome', 'Equipe', 'Dia', 'Hora Planejamento', 'Hora Presença']],
      body: linhas.map(l => [
        l.nome,
        l.equipeNome,
        l.diaLabel,
        l.horaPlanejamento || '—',
        l.horaPresenca || '—'
      ]),
      headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 45 },
        2: { cellWidth: 38 },
        3: { cellWidth: 38 },
        4: { cellWidth: 38 },
      },
    });

    doc.save(`relatorio_${this.anoSelecionado() ?? 'todos'}.pdf`);
  }

  getSortLabel(key: 'dia' | 'equipe' | 'nome' | 'horaPresenca'): string {
    const labels = { dia: 'Dia', nome: 'Nome', equipe: 'Equipe', horaPresenca: 'Hora presença' };
    return labels[key];
  }

  adicionarSortKey(key: 'dia' | 'equipe' | 'nome' | 'horaPresenca'): void {
    this.sortOrdem.update(o => [...o, key]);
  }

  removerSortKey(key: 'dia' | 'equipe' | 'nome' | 'horaPresenca'): void {
    this.sortOrdem.update(o => o.filter(k => k !== key));
  }

  moverSortKey(index: number, delta: number): void {
    this.sortOrdem.update(o => {
      const novo = [...o];
      const [item] = novo.splice(index, 1);
      novo.splice(index + delta, 0, item);
      return novo;
    });
  }

  exportarCSV(): void {
    const linhas = this.linhasFiltradas();
    const cabecalho = ['Nome', 'Equipe', 'Dia', 'Hora Planejamento', 'Hora Presença', 'Confirmado', 'Presente'];

    const linhasCSV = [
      cabecalho.join(';'),
      ...linhas.map(l => [
        l.nome,
        l.equipeNome,
        l.diaLabel,
        l.horaPlanejamento,
        l.horaPresenca,
        l.confirmado ? 'Sim' : 'Não',
        l.presente ? 'Sim' : 'Não'
      ].map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + linhasCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${this.anoSelecionado() ?? 'todos'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
