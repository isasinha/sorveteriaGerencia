import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { DiaDaFestaService, DiaDaFesta } from '../core/services/dia-da-festa.service';
import { EquipesService, Equipe } from '../core/services/equipes.service';
import { PessoasService, Pessoa } from '../core/services/pessoas.service';
import { PresencaService, Presenca } from '../core/services/presenca.service';
import { TimeAutoMinutesDirective } from '../shared/time-auto-minutes.directive';

interface EntradaLocal {
  seq: number;
  horaChegada: string;
  horaSaida: string;
  idEquipe: string;
  presencaId?: string;
}

@Component({
  selector: 'app-planejamento',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent, TimeAutoMinutesDirective],
  templateUrl: './planejamento.component.html',
  styleUrl: './planejamento.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanejamentoComponent implements OnInit {
  private diasDaFesta = signal<DiaDaFesta[]>([]);
  private todasPessoas = signal<Pessoa[]>([]);
  private presencas = signal<Presenca[]>([]);

  equipes = signal<Equipe[]>([]);
  loading = signal(true);
  salvando = signal<string | null>(null);
  avisoCheckout = signal<string | null>(null);

  anoSelecionado = signal(0);
  busca = signal('');
  dropdownAberto = signal(false);
  pessoaSelecionada = signal<Pessoa | null>(null);
  entradasPorDia = signal<Record<number, EntradaLocal[]>>({});
  listasAbertas = signal<Record<number, boolean>>({});

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
    return [...this.diasDaFesta()]
      .filter(d => this.extrairAno(d.dia) === ano)
      .sort((a, b) => this.converterParaDate(a.dia).getTime() - this.converterParaDate(b.dia).getTime());
  });

  pessoasFiltradas = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    let lista = [...this.todasPessoas()].filter(p => p.ativo !== false);

    lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (!termo) return lista;
    return lista.filter(p => p.nome.toLowerCase().includes(termo));
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
      if (anos.length > 0) await this.carregarAno(anos[0]);
    } finally {
      this.loading.set(false);
    }
  }

  async selecionarAno(ano: number): Promise<void> {
    if (ano === this.anoSelecionado()) return;
    this.limparSelecao();
    this.presencas.set([]);
    await this.carregarAno(ano);
  }

  private async carregarAno(ano: number): Promise<void> {
    this.anoSelecionado.set(ano);
    const presencas = await this.presencaService.getConfirmacoesAntesByAno(ano);
    this.presencas.set(presencas);
    const pessoa = this.pessoaSelecionada();
    if (pessoa) this.preencherEntradasDaPessoa(pessoa);
  }

  abrirDropdown(): void { this.dropdownAberto.set(true); }
  fecharDropdown(): void { setTimeout(() => this.dropdownAberto.set(false), 150); }

  setBusca(valor: string): void {
    this.busca.set(valor);
    this.dropdownAberto.set(true);
    this.pessoaSelecionada.set(null);
    this.entradasPorDia.set({});
  }

  selecionarPessoa(pessoa: Pessoa): void {
    this.pessoaSelecionada.set(pessoa);
    this.busca.set(pessoa.nome);
    this.dropdownAberto.set(false);
    this.preencherEntradasDaPessoa(pessoa);
  }

  limparSelecao(): void {
    this.pessoaSelecionada.set(null);
    this.busca.set('');
    this.entradasPorDia.set({});
    this.dropdownAberto.set(false);
  }

  private preencherEntradasDaPessoa(pessoa: Pessoa): void {
    const idPessoa = this.getPessoaKey(pessoa);
    const resultado: Record<number, EntradaLocal[]> = {};
    for (const dia of this.diasDoAno()) {
      const idDia = dia.idDia!;
      const existentes = this.presencas()
        .filter(p => p.idDia === idDia && String(p.idPessoa) === idPessoa)
        .sort((a, b) => (a.sequencia ?? 1) - (b.sequencia ?? 1));

      if (existentes.length > 0) {
        const lista: EntradaLocal[] = existentes.map(p => ({
          seq: p.sequencia ?? 1,
          horaChegada: p.horaChegada,
          horaSaida: p.horaSaida,
          idEquipe: p.idEquipe ?? '',
          presencaId: p.id
        }));
        const ultimo = lista[lista.length - 1];
        if (ultimo.horaSaida) {
          lista.push({ seq: ultimo.seq + 1, horaChegada: '', horaSaida: '', idEquipe: '' });
        }
        resultado[idDia] = lista;
      } else {
        resultado[idDia] = [{ seq: 1, horaChegada: '', horaSaida: '', idEquipe: '' }];
      }
    }
    this.entradasPorDia.set(resultado);
  }

  getEntradas(idDia: number): EntradaLocal[] {
    return this.entradasPorDia()[idDia] ?? [];
  }

  setHoraChegada(idDia: number, seq: number, value: string): void {
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? []).map(x => x.seq === seq ? { ...x, horaChegada: value } : x);
      return { ...e, [idDia]: lista };
    });
  }

  setHoraSaida(idDia: number, seq: number, value: string): void {
    const key = `${idDia}-${seq}`;
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? []).map(x => {
        if (x.seq !== seq) return x;
        if (value && x.horaChegada && value < x.horaChegada) {
          this.avisoCheckout.set(key);
          return x;
        }
        this.avisoCheckout.set(null);
        return { ...x, horaSaida: value };
      });
      return { ...e, [idDia]: lista };
    });
  }

  setEquipe(idDia: number, seq: number, value: string): void {
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? []).map(x =>
        x.seq === seq ? { ...x, idEquipe: value } : x
      );
      return { ...e, [idDia]: lista };
    });
  }

  getPessoaKey(pessoa: Pessoa): string {
    return String(pessoa.id ?? pessoa.idPessoa);
  }

  isSalvando(idDia: number, seq: number): boolean {
    return this.salvando() === `${idDia}-${seq}`;
  }

  contarPresencas(idDia: number): number {
    const pessoas = new Set(
      this.presencas().filter(p => p.idDia === idDia).map(p => String(p.idPessoa))
    );
    return pessoas.size;
  }

  toggleLista(idDia: number): void {
    this.listasAbertas.update(m => ({ ...m, [idDia]: !m[idDia] }));
  }

  isListaAberta(idDia: number): boolean {
    return !!this.listasAbertas()[idDia];
  }

  getPessoasParaDia(idDia: number): Pessoa[] {
    const ids = new Set(
      this.presencas().filter(p => p.idDia === idDia).map(p => String(p.idPessoa))
    );
    return this.todasPessoas()
      .filter(p => ids.has(String(p.id ?? p.idPessoa)))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  async excluirEntrada(idDia: number, seq: number): Promise<void> {
    const entrada = this.getEntradas(idDia).find(e => e.seq === seq);
    if (!entrada) return;
    if (!confirm(`Excluir a ${seq}ª entrada?`)) return;
    if (entrada.presencaId) {
      await this.presencaService.deleteConfirmacaoAntes(entrada.presencaId);
      const presencas = await this.presencaService.getConfirmacoesAntesByAno(this.anoSelecionado());
      this.presencas.set(presencas);
    }
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? [])
        .filter(x => x.seq !== seq)
        .map((x, i) => ({ ...x, seq: i + 1 }));
      const resultado = lista.length > 0 ? lista : [{ seq: 1, horaChegada: '', horaSaida: '', idEquipe: '' }];
      return { ...e, [idDia]: resultado };
    });
  }

  async salvarEntrada(idDia: number, seq: number): Promise<void> {
    const pessoa = this.pessoaSelecionada();
    if (!pessoa) return;
    const idPessoa = this.getPessoaKey(pessoa);
    const entrada = this.getEntradas(idDia).find(e => e.seq === seq);
    if (!entrada) return;

    this.salvando.set(`${idDia}-${seq}`);
    try {
      const savedId = await this.presencaService.saveConfirmacaoAntes({
        id: entrada.presencaId,
        idPessoa,
        idDia,
        ano: this.anoSelecionado(),
        sequencia: seq,
        horaChegada: entrada.horaChegada,
        horaSaida: entrada.horaSaida,
        idEquipe: entrada.idEquipe
      });
      const presencas = await this.presencaService.getConfirmacoesAntesByAno(this.anoSelecionado());
      this.presencas.set(presencas);
      this.entradasPorDia.update(e => {
        let lista = (e[idDia] ?? []).map(x => x.seq === seq ? { ...x, presencaId: savedId } : x);
        const atual = lista.find(x => x.seq === seq);
        if (atual?.horaSaida) {
          if (!lista.some(x => x.seq === seq + 1)) {
            lista = [...lista, { seq: seq + 1, horaChegada: '', horaSaida: '', idEquipe: '' }];
          }
        } else {
          const proxima = lista.find(x => x.seq === seq + 1);
          if (proxima && !proxima.horaChegada && !proxima.horaSaida && !proxima.presencaId) {
            lista = lista.filter(x => x.seq !== seq + 1);
          }
        }
        return { ...e, [idDia]: lista };
      });
    } finally {
      this.salvando.set(null);
    }
  }

  formatarDia(dia: string): string {
    if (!dia) return '';
    const partes = dia.split('/');
    return partes.length >= 2 ? `${partes[0]}/${partes[1]}` : dia;
  }

  private extrairAno(dia: string): number | null {
    if (!dia) return null;
    const p = dia.split('/');
    if (p.length === 3 && p[2].length === 4) { const a = parseInt(p[2], 10); return isNaN(a) ? null : a; }
    const p2 = dia.split('-');
    if (p2.length === 3 && p2[0].length === 4) { const a = parseInt(p2[0], 10); return isNaN(a) ? null : a; }
    return null;
  }

  private converterParaDate(dia: string): Date {
    const p = dia.split('/');
    if (p.length === 3) return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    return new Date(dia);
  }
}
