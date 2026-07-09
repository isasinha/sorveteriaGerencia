// Baseado em: https://angular.dev/guide/forms
import { Component, ChangeDetectionStrategy, output, signal, computed, OnInit, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PessoasService, Pessoa } from '../../core/services/pessoas.service';
import { EquipesService, Equipe } from '../../core/services/equipes.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { deleteField } from 'firebase/firestore';

@Component({
  selector: 'app-pessoa-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pessoa-form.component.html',
  styleUrl: './pessoa-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaFormComponent implements OnInit {
  pessoaEmEdicao = input<Pessoa | null>(null);
  close = output<void>();
  pessoaAdicionada = output<Pessoa>();
  pessoaAtualizada = output<Pessoa>();

  nome = signal<string>('');
  email = signal<string>('');
  telefone_cel = signal<string>('');
  telefone_rec = signal<string>('');
  telefone_res = signal<string>('');
  data_nascimento = signal<string>('');
  idade = signal<string | number>('');
  idEquipe = signal<string>('');
  equipesSelecionadas = signal<Set<string>>(new Set());
  equipesExpandido = signal<boolean>(false);
  comentarios = signal<string>('');
  imagem = signal<string>('');
  imagemPreview = signal<string | null>(null);
  recepcao = signal<boolean>(false);
  ativo = signal<boolean>(true);
  equipes = signal<Equipe[]>([]);

  salvando = signal<boolean>(false);
  erro = signal<string | null>(null);

  // Computed para verificar se a data de nascimento está completa
  dataCompleta = computed(() => this.data_nascimento().length === 10);

  // Computed para equipes ordenadas alfabeticamente
  equipesOrdenadas = computed(() => {
    return [...this.equipes()].sort((a, b) => {
      // "Temporariamente sem equipe" sempre primeiro
      if (a.nome === 'Temporariamente sem equipe') return -1;
      if (b.nome === 'Temporariamente sem equipe') return 1;
      
      // Demais equipes em ordem alfabética
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  });

  constructor(private pessoasService: PessoasService, private equipesService: EquipesService, private usuariosService: UsuariosService) {
    // Effect para carregar dados quando pessoa em edição mudar
    effect(() => {
      const pessoa = this.pessoaEmEdicao();
      if (pessoa) {
        this.nome.set(pessoa.nome || '');
        this.email.set(pessoa.email || '');
        this.telefone_cel.set(pessoa.telefone_cel || '');
        this.telefone_rec.set(pessoa.telefone_rec || '');
        this.telefone_res.set(pessoa.telefone_res || '');
        this.data_nascimento.set(pessoa.data_nascimento || '');
        this.idade.set(pessoa.idade?.toString() || '');
        this.idEquipe.set(pessoa.idEquipe || '');
        
        // Carregar equipes selecionadas
        if (pessoa.idEquipe) {
          const ids = pessoa.idEquipe.toString().split(',').map(id => id.trim());
          this.equipesSelecionadas.set(new Set(ids));
        } else {
          this.equipesSelecionadas.set(new Set());
        }
        
        this.comentarios.set(pessoa.comentarios || '');
        this.imagem.set(pessoa.imagem || '');
        this.recepcao.set(pessoa.recepcao ?? false);
        this.ativo.set(pessoa.ativo !== false);
        if (pessoa.imagem && pessoa.imagem !== '/sem_imagem.png') {
          this.imagemPreview.set(pessoa.imagem);
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const equipesData = await this.equipesService.getEquipes();
      this.equipes.set(equipesData);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      this.erro.set('Erro ao carregar lista de equipes');
    }
  }

  toggleEquipe(idEquipe: string): void {
    const selecionadas = new Set(this.equipesSelecionadas());
    const equipe = this.equipes().find(e => e.idEquipe?.toString() === idEquipe);
    const isTemporariamenteSemEquipe = equipe?.nome === 'Temporariamente sem equipe';
    
    // Encontrar o ID de "Temporariamente sem equipe"
    const temporariamenteSemEquipeId = this.equipes()
      .find(e => e.nome === 'Temporariamente sem equipe')?.idEquipe?.toString();
    
    if (selecionadas.has(idEquipe)) {
      // Desmarcar a equipe clicada
      selecionadas.delete(idEquipe);
    } else {
      // Marcar a equipe clicada
      if (isTemporariamenteSemEquipe) {
        // Se marcou "Temporariamente sem equipe", limpar todas as outras
        selecionadas.clear();
        selecionadas.add(idEquipe);
      } else {
        // Se marcou outra equipe, remover "Temporariamente sem equipe" se existir
        if (temporariamenteSemEquipeId) {
          selecionadas.delete(temporariamenteSemEquipeId);
        }
        selecionadas.add(idEquipe);
      }
    }
    
    this.equipesSelecionadas.set(selecionadas);
  }

  toggleEquipesExpandido(): void {
    this.equipesExpandido.set(!this.equipesExpandido());
  }

  isEquipeSelecionada(idEquipe: string): boolean {
    return this.equipesSelecionadas().has(idEquipe);
  }

  onClose(): void {
    this.close.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        this.erro.set('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.erro.set('A imagem deve ter no máximo 2MB');
        return;
      }

      // Converter para Base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.imagem.set(base64String);
        this.imagemPreview.set(base64String);
        this.erro.set(null);
      };
      reader.onerror = () => {
        this.erro.set('Erro ao ler o arquivo');
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagem(): void {
    this.imagem.set('');
    this.imagemPreview.set(null);
  }

  bloquearNaoNumerico(event: KeyboardEvent): void {
    // Permitir teclas especiais: Backspace, Delete, Tab, Escape, Enter, setas
    const teclasPermitidas = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Se a tecla está na lista de permitidas, deixar passar
    if (teclasPermitidas.includes(event.key)) {
      return;
    }

    // Bloquear se não for número
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  aplicarMascaraCelular(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 11) {
      valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    this.telefone_cel.set(valor);
  }

  aplicarMascaraTelefone(event: Event, tipo: 'rec' | 'res'): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    // Para telefone de recado, verificar se o terceiro dígito é 9 (celular)
    if (tipo === 'rec' && valor.length >= 3 && valor[2] === '9') {
      // Aplicar máscara de celular (00) 00000-0000
      if (valor.length <= 11) {
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
        valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
      }
    } else {
      // Aplicar máscara de telefone fixo (00) 0000-0000
      if (valor.length <= 10) {
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
      }
    }
    
    if (tipo === 'rec') {
      this.telefone_rec.set(valor);
    } else {
      this.telefone_res.set(valor);
    }
  }

  aplicarMascaraData(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 8) {
      valor = valor.replace(/(\d{2})(\d)/, '$1/$2');
      valor = valor.replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }
    
    this.data_nascimento.set(valor);
    
    // Calcular idade automaticamente se a data estiver completa
    if (valor.length === 10) {
      const idadeCalculada = this.calcularIdade(valor);
      if (idadeCalculada !== null) {
        this.idade.set(idadeCalculada.toString());
      }
    } else {
      this.idade.set('');
    }
  }

  calcularIdade(dataNascimento: string): number | null {
    if (!dataNascimento || dataNascimento.length !== 10) return null;

    const partes = dataNascimento.split('/');
    if (partes.length !== 3) return null;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;

    const hoje = new Date();
    const nascimento = new Date(ano, mes - 1, dia);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();

    if (mesAtual < mes - 1 || (mesAtual === mes - 1 && diaAtual < dia)) {
      idade--;
    }

    return idade >= 0 ? idade : null;
  }

  validarTelefone(telefone: string, tipo: string): string | null {
    if (!telefone) return null; // Campo opcional
    
    const apenasNumeros = telefone.replace(/\D/g, '');
    
    if (tipo === 'celular') {
      if (apenasNumeros.length !== 11) {
        return 'Telefone celular deve ter 11 dígitos (DDD + 9 dígitos)';
      }
      if (apenasNumeros[2] !== '9') {
        return 'Telefone celular deve começar com 9 após o DDD';
      }
    } else {
      // Telefone fixo ou recado
      if (apenasNumeros.length === 11) {
        if (apenasNumeros[2] !== '9') {
          return `Telefone ${tipo} com 11 dígitos deve começar com 9 após o DDD`;
        }
      } else if (apenasNumeros.length === 10) {
        if (apenasNumeros[2] === '9') {
          return `Telefone ${tipo} fixo não deve começar com 9 após o DDD`;
        }
      } else if (apenasNumeros.length > 0) {
        return `Telefone ${tipo} deve ter 10 ou 11 dígitos`;
      }
    }
    
    return null;
  }

  validarData(data: string): string | null {
    if (!data) return null; // Campo opcional
    
    if (data.length !== 10) {
      return 'Data de nascimento deve estar no formato DD/MM/AAAA';
    }
    
    const partes = data.split('/');
    if (partes.length !== 3) {
      return 'Data de nascimento inválida';
    }
    
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);
    
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) {
      return 'Data de nascimento contém valores inválidos';
    }
    
    if (dia < 1 || dia > 31) {
      return 'Dia deve estar entre 01 e 31';
    }
    
    if (mes < 1 || mes > 12) {
      return 'Mês deve estar entre 01 e 12';
    }
    
    const anoAtual = new Date().getFullYear();
    if (ano < 1900 || ano > anoAtual) {
      return `Ano deve estar entre 1900 e ${anoAtual}`;
    }
    
    // Validar data real (ex: 31/02 é inválido)
    const dataObj = new Date(ano, mes - 1, dia);
    if (dataObj.getDate() !== dia || dataObj.getMonth() !== mes - 1) {
      return 'Data de nascimento inválida para o mês informado';
    }
    
    return null;
  }

  validarEmail(email: string): string | null {
    if (!email) return null; // Campo opcional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email informado não é válido';
    }
    
    return null;
  }

  async onSubmit(): Promise<void> {
    this.erro.set(null);
    
    // Validação: nome é obrigatório
    if (!this.nome().trim()) {
      this.erro.set('Nome é obrigatório');
      return;
    }

    // Validar email
    const erroEmail = this.validarEmail(this.email().trim());
    if (erroEmail) {
      this.erro.set(erroEmail);
      return;
    }

    // Validar telefones
    const erroTelCel = this.validarTelefone(this.telefone_cel().trim(), 'celular');
    if (erroTelCel) {
      this.erro.set(erroTelCel);
      return;
    }

    const erroTelRec = this.validarTelefone(this.telefone_rec().trim(), 'recado');
    if (erroTelRec) {
      this.erro.set(erroTelRec);
      return;
    }

    const erroTelRes = this.validarTelefone(this.telefone_res().trim(), 'residencial');
    if (erroTelRes) {
      this.erro.set(erroTelRes);
      return;
    }

    // Validar data de nascimento
    const erroData = this.validarData(this.data_nascimento().trim());
    if (erroData) {
      this.erro.set(erroData);
      return;
    }

    this.salvando.set(true);

    try {
      // Buscar ID de "Temporariamente sem equipe"
      const temporariamenteSemEquipeId = this.equipes()
        .find(e => e.nome === 'Temporariamente sem equipe')?.idEquipe?.toString();
      
      // Se não há equipes selecionadas e existe "Temporariamente sem equipe", atribuir automaticamente
      let equipesParaSalvar = Array.from(this.equipesSelecionadas());
      if (equipesParaSalvar.length === 0 && temporariamenteSemEquipeId) {
        equipesParaSalvar = [temporariamenteSemEquipeId];
      }
      
      const pessoaEdit = this.pessoaEmEdicao();
      
      if (pessoaEdit && pessoaEdit.id) {
        // Modo edição
        const pessoaAtualizada: Partial<Pessoa> = {
          nome: this.nome().trim(),
        };

        // Adicionar campos opcionais - permite limpar campos vazios usando deleteField
        pessoaAtualizada.email = this.email().trim() || (deleteField() as any);
        pessoaAtualizada.telefone_cel = this.telefone_cel().trim() || (deleteField() as any);
        pessoaAtualizada.telefone_rec = this.telefone_rec().trim() || (deleteField() as any);
        pessoaAtualizada.telefone_res = this.telefone_res().trim() || (deleteField() as any);
        pessoaAtualizada.data_nascimento = this.data_nascimento().trim() || (deleteField() as any);
        
        const idadeStr = String(this.idade()).trim();
        if (idadeStr) {
          pessoaAtualizada.idade = parseInt(idadeStr, 10);
        } else {
          pessoaAtualizada.idade = deleteField() as any;
        }
        
        // Converter equipes selecionadas para string separada por vírgula
        if (equipesParaSalvar.length > 0) {
          pessoaAtualizada.idEquipe = equipesParaSalvar.join(',');
        }
        
        pessoaAtualizada.comentarios = this.comentarios().trim() || (deleteField() as any);
        pessoaAtualizada.recepcao = this.recepcao();
        pessoaAtualizada.ativo = this.ativo();
        
        // Imagem: usar padrão se não houver valor
        pessoaAtualizada.imagem = this.imagem().trim() || '/sem_imagem.png';

        // Atualizar no Firestore
        await this.pessoasService.updatePessoa(pessoaEdit.id, pessoaAtualizada);

        // Se o e-mail mudou, atualizar também no Auth e na coleção de logins
        const emailAntigo = (pessoaEdit.email ?? '').trim();
        const emailNovo = (pessoaAtualizada.email as string | undefined ?? '').trim();
        if (emailAntigo && emailNovo && emailAntigo !== emailNovo) {
          await this.usuariosService.atualizarEmailLogin(pessoaEdit.id, emailAntigo, emailNovo);
        }

        // Emitir evento de sucesso
        this.pessoaAtualizada.emit({ ...pessoaEdit, ...pessoaAtualizada } as Pessoa);
        this.onClose();
      } else {
        // Modo criação
      // Obter próximo idPessoa
      const proximoId = await this.pessoasService.getProximoIdPessoa();

      // Criar objeto pessoa
      const novaPessoa: Pessoa = {
        idPessoa: proximoId,
        nome: this.nome().trim(),
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (this.email().trim()) {
        novaPessoa.email = this.email().trim();
      }
      if (this.telefone_cel().trim()) {
        novaPessoa.telefone_cel = this.telefone_cel().trim();
      }
      if (this.telefone_rec().trim()) {
        novaPessoa.telefone_rec = this.telefone_rec().trim();
      }
      if (this.telefone_res().trim()) {
        novaPessoa.telefone_res = this.telefone_res().trim();
      }
      if (this.data_nascimento().trim()) {
        novaPessoa.data_nascimento = this.data_nascimento().trim();
      }
      const idadeStr = String(this.idade()).trim();
      if (idadeStr) {
        novaPessoa.idade = parseInt(idadeStr, 10);
      }
      
      // Converter equipes selecionadas para string separada por vírgula
      if (equipesParaSalvar.length > 0) {
        novaPessoa.idEquipe = equipesParaSalvar.join(',');
      }
      
      if (this.comentarios().trim()) {
        novaPessoa.comentarios = this.comentarios().trim();
      }
      novaPessoa.recepcao = this.recepcao();
      novaPessoa.ativo = this.ativo();
      
      // Imagem: usar padrão se não houver valor
      novaPessoa.imagem = this.imagem().trim() || '/sem_imagem.png';

      // Salvar no Firestore
      await this.pessoasService.addPessoa(novaPessoa);

      // Emitir evento de sucesso
      this.pessoaAdicionada.emit(novaPessoa);
      this.onClose();
      }
    } catch (err: any) {
      console.error('Erro ao adicionar pessoa:', err);
      
      // Mensagens de erro mais amigáveis
      let mensagemErro = 'Não foi possível salvar os dados. Por favor, verifique as informações e tente novamente.';
      
      if (err?.message?.includes('invalid data')) {
        mensagemErro = 'Alguns dados estão no formato incorreto. Verifique os campos preenchidos.';
      } else if (err?.message?.includes('permission')) {
        mensagemErro = 'Você não tem permissão para realizar esta ação.';
      } else if (err?.message?.includes('network')) {
        mensagemErro = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      this.erro.set(mensagemErro);
    } finally {
      this.salvando.set(false);
    }
  }
}
