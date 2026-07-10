// Baseado em: https://angular.dev/guide/components
import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarLayoutComponent } from '../shared/layout/sidebar-layout.component';
import { DiaDaFestaService, DiaDaFesta } from '../core/services/dia-da-festa.service';
import { EquipesService, Equipe } from '../core/services/equipes.service';
import { PessoasService, Pessoa } from '../core/services/pessoas.service';
import { PresencaService, Presenca, ItemStatus, ChapelariaStatus } from '../core/services/presenca.service';
import { ItensService, Item } from '../core/services/itens.service';
import { TimeAutoMinutesDirective } from '../shared/time-auto-minutes.directive';

interface EntradaLocal {
  seq: number;
  horaChegada: string;
  horaSaida: string;
  idEquipe: string;
  presencaId?: string;
  itensStatus: Record<string, ItemStatus>;
  chapelaria: ChapelariaStatus;
}

@Component({
  selector: 'app-presenca',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarLayoutComponent, TimeAutoMinutesDirective],
  templateUrl: './presenca.component.html',
  styleUrl: './presenca.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresencaComponent implements OnInit {
  private diasDaFesta = signal<DiaDaFesta[]>([]);
  private todasPessoas = signal<Pessoa[]>([]);
  private presencas = signal<Presenca[]>([]);

  equipes = signal<Equipe[]>([]);
  todosItens = signal<Item[]>([]);
  loading = signal(true);
  salvando = signal<string | null>(null);
  avisoCheckout = signal<string | null>(null);

  anoSelecionado = signal(0);
  busca = signal('');
  dropdownAberto = signal(false);
  pessoaSelecionada = signal<Pessoa | null>(null);
  entradasPorDia = signal<Record<number, EntradaLocal[]>>({});

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
    private presencaService: PresencaService,
    private itensService: ItensService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [dias, pessoas, equipes, itens] = await Promise.all([
        this.diaDaFestaService.getDiasDaFesta(),
        this.pessoasService.getPessoas(),
        this.equipesService.getEquipes(),
        this.itensService.getItens()
      ]);
      this.diasDaFesta.set(dias);
      this.todasPessoas.set(pessoas);
      this.equipes.set(equipes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      this.todosItens.set(itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));
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
    const presencas = await this.presencaService.getPresencasByAno(ano);
    this.presencas.set(presencas);
    const pessoa = this.pessoaSelecionada();
    if (pessoa) this.preencherEntradasDaPessoa(pessoa);
  }

  // --- dropdown compartilhado ---
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
          presencaId: p.id,
          itensStatus: p.itensStatus ?? {},
          chapelaria: p.chapelaria ?? { numero: '', entregue: false, devolvido: false }
        }));
        const ultimo = lista[lista.length - 1];
        if (ultimo.horaSaida) {
          const chapelariaHerdada = ultimo.chapelaria?.entregue && !ultimo.chapelaria?.devolvido
            ? { numero: ultimo.chapelaria.numero, entregue: true, devolvido: false }
            : { numero: '', entregue: false, devolvido: false };
          lista.push({ seq: ultimo.seq + 1, horaChegada: '', horaSaida: '', idEquipe: '', itensStatus: {}, chapelaria: chapelariaHerdada });
        }
        resultado[idDia] = lista;
      } else {
        resultado[idDia] = [{ seq: 1, horaChegada: '', horaSaida: '', idEquipe: '', itensStatus: {}, chapelaria: { numero: '', entregue: false, devolvido: false } }];
      }
    }
    this.entradasPorDia.set(resultado);
  }

  // --- getters de entradas ---
  getEntradas(idDia: number): EntradaLocal[] {
    return this.entradasPorDia()[idDia] ?? [];
  }

  // --- setters de entradas ---
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
          // Valor inválido: mantém aviso até ser corrigido, não salva
          this.avisoCheckout.set(key);
          return x; // não atualiza horaSaida
        }
        this.avisoCheckout.set(null);
        return { ...x, horaSaida: value };
      });
      return { ...e, [idDia]: lista };
    });
  }

  setEquipe(idDia: number, seq: number, value: string): void {
    this.entradasPorDia.update(e => {
      const todasEntradas = e[idDia] ?? [];
      const lista = todasEntradas.map(x => {
        if (x.seq !== seq) return x;
        const equipe = this.equipes().find(eq => eq.id === value);
        const anterior = todasEntradas.find(a => a.seq === seq - 1);
        const novosItens: Record<string, ItemStatus> = {};
        for (const idItem of equipe?.itensPadrao ?? []) {
          if (x.itensStatus[idItem] !== undefined) {
            // Preserva status já existente ao trocar equipe
            novosItens[idItem] = x.itensStatus[idItem];
          } else if (anterior?.itensStatus[idItem]?.entregue && !anterior?.itensStatus[idItem]?.devolvido) {
            // Herda do checkin anterior: entregue mas não devolvido
            novosItens[idItem] = { entregue: true, devolvido: false };
          } else {
            novosItens[idItem] = { entregue: false, devolvido: false };
          }
        }
        return { ...x, idEquipe: value, itensStatus: novosItens };
      });
      return { ...e, [idDia]: lista };
    });
  }

  getItensDeEntrada(entrada: EntradaLocal): Item[] {
    const equipe = this.equipes().find(e => e.id === entrada.idEquipe);
    if (!equipe?.itensPadrao?.length) return [];
    return this.todosItens().filter(i => equipe.itensPadrao!.includes(i.id!));
  }

  getItemStatus(entrada: EntradaLocal, idItem: string): ItemStatus {
    return entrada.itensStatus[idItem] ?? { entregue: false, devolvido: false };
  }

  setItemStatus(idDia: number, seq: number, idItem: string, campo: 'entregue' | 'devolvido', valor: boolean): void {
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? []).map(x => {
        if (x.seq !== seq) return x;
        const current = this.getItemStatus(x, idItem);
        // Não permite marcar devolvido sem entregue
        if (campo === 'devolvido' && valor && !current.entregue) return x;
        // Ao desmarcar entregue, também desmarca devolvido
        const newItemStatus = campo === 'entregue' && !valor
          ? { entregue: false, devolvido: false }
          : { ...current, [campo]: valor };
        return { ...x, itensStatus: { ...x.itensStatus, [idItem]: newItemStatus } };
      });
      return { ...e, [idDia]: lista };
    });
  }

  // --- chapelaria ---
  setChapelariaNumero(idDia: number, seq: number, valor: string): void {
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? []).map(x => {
        if (x.seq !== seq) return x;
        const temNumero = valor.trim() !== '';
        const chap = temNumero
          ? { ...x.chapelaria, numero: valor, entregue: true }
          : { numero: '', entregue: false, devolvido: false };
        return { ...x, chapelaria: chap };
      });
      return { ...e, [idDia]: lista };
    });
  }

  setChapelariaEntregue(idDia: number, seq: number, valor: boolean): void {
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? []).map(x => {
        if (x.seq !== seq) return x;
        const chap = valor
          ? { ...x.chapelaria, entregue: true }
          : { ...x.chapelaria, entregue: false, devolvido: false };
        return { ...x, chapelaria: chap };
      });
      return { ...e, [idDia]: lista };
    });
  }

  setChapelariaDevolvido(idDia: number, seq: number, valor: boolean): void {
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? []).map(x => {
        if (x.seq !== seq) return x;
        if (valor && !x.chapelaria.entregue) return x;
        return { ...x, chapelaria: { ...x.chapelaria, devolvido: valor } };
      });
      return { ...e, [idDia]: lista };
    });
  }

  // --- utilitários ---
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

  nomeEquipe(idEquipe: string): string {
    return this.equipes().find(e => e.id === idEquipe)?.nome ?? '';
  }

  async excluirEntrada(idDia: number, seq: number): Promise<void> {
    const entrada = this.getEntradas(idDia).find(e => e.seq === seq);
    if (!entrada) return;
    if (!confirm(`Excluir a ${seq}ª entrada?`)) return;
    if (entrada.presencaId) {
      await this.presencaService.deletePresenca(entrada.presencaId);
      const presencas = await this.presencaService.getPresencasByAno(this.anoSelecionado());
      this.presencas.set(presencas);
    }
    this.entradasPorDia.update(e => {
      const lista = (e[idDia] ?? [])
        .filter(x => x.seq !== seq)
        .map((x, i) => ({ ...x, seq: i + 1 }));
      const resultado = lista.length > 0 ? lista : [{ seq: 1, horaChegada: '', horaSaida: '', idEquipe: '', itensStatus: {}, chapelaria: { numero: '', entregue: false, devolvido: false } }];
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
      const savedId = await this.presencaService.savePresenca({
        id: entrada.presencaId,
        idPessoa,
        idDia,
        ano: this.anoSelecionado(),
        sequencia: seq,
        horaChegada: entrada.horaChegada,
        horaSaida: entrada.horaSaida,
        idEquipe: entrada.idEquipe,
        itensStatus: entrada.itensStatus,
        chapelaria: entrada.chapelaria
      });
      const presencas = await this.presencaService.getPresencasByAno(this.anoSelecionado());
      this.presencas.set(presencas);
      this.entradasPorDia.update(e => {
        let lista = (e[idDia] ?? []).map(x => x.seq === seq ? { ...x, presencaId: savedId } : x);
        const atual = lista.find(x => x.seq === seq);
        if (atual?.horaSaida) {
          // Checkout salvo: abre próximo grupo se não existir
          if (!lista.some(x => x.seq === seq + 1)) {
            const chapelariaHerdada = atual?.chapelaria?.entregue && !atual?.chapelaria?.devolvido
              ? { numero: atual.chapelaria.numero, entregue: true, devolvido: false }
              : { numero: '', entregue: false, devolvido: false };
            lista = [...lista, { seq: seq + 1, horaChegada: '', horaSaida: '', idEquipe: '', itensStatus: {}, chapelaria: chapelariaHerdada }];
          }
        } else {
          // Checkout vazio: remove próximo grupo se estiver sem conteúdo
          const proxima = lista.find(x => x.seq === seq + 1);
          if (proxima && !proxima.horaChegada && !proxima.horaSaida && !proxima.presencaId) {
            lista = lista.filter(x => x.seq !== seq + 1);
          }
        }
        return { ...e, [idDia]: lista };
      });
      if (!pessoa.voluntario_desde && pessoa.id && entrada.horaChegada) {
        const diaFesta = this.diasDaFesta().find(d => d.idDia === idDia);
        if (diaFesta?.dia) {
          await this.pessoasService.updatePessoa(pessoa.id, { voluntario_desde: diaFesta.dia });
          const pessoaAtualizada = { ...pessoa, voluntario_desde: diaFesta.dia };
          this.todasPessoas.update(ps => ps.map(p => p.id === pessoa.id ? pessoaAtualizada : p));
          this.pessoaSelecionada.set(pessoaAtualizada);
        }
      }
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
