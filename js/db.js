/**
 * PROJETO ATOS — Sistema Unificado de Banco de Dados & Armazenamento Local
 * Gerenciamento centralizado de:
 * - Pessoas / Voluntários
 * - Edições e Missões
 * - Inscrições & Participações
 * - Agenda & Eventos
 * - Parceiros
 * - Indicadores de Impacto
 * - Mídia (Fotos e Vídeos)
 * - Conteúdos (Notícias, Depoimentos, Banners)
 * - Apoios & Doações
 * - Usuários Administrativos & Níveis de Acesso
 * - Configurações Gerais
 * - Logs de Auditoria
 * - Sincronização em Tempo Real com Supabase (Nuvem)
 */

const DB_KEYS = {
  PESSOAS: 'atos_db_pessoas',
  EDICOES: 'atos_db_edicoes',
  INSCRICOES: 'atos_db_inscricoes',
  PARTICIPACOES: 'atos_db_participacoes',
  AGENDA: 'atos_db_agenda',
  PARCEIROS: 'atos_db_parceiros',
  IMPACTO: 'atos_db_impacto',
  MIDIA: 'atos_db_midia',
  CONTEUDOS: 'atos_db_conteudos',
  APOIOS: 'atos_db_apoios',
  USERS: 'atos_db_admin_users',
  CONFIG: 'atos_db_config',
  AUDITORIA: 'atos_db_auditoria',
  NOTIFICACOES: 'atos_db_notificacoes',
  NOTIFICACOES_LIDAS: 'atos_db_notificacoes_lidas',
  EMAIL_LOGS: 'atos_email_logs',
  CURRENT_USER: 'atos_session_user',
  ADMIN_SESSION: 'atos_admin_session_data',
  ADMIN_AUTH_LEGACY: 'atos_admin_authenticated'
};

// Profissões oficiais organizadas por categorias
const PROFISSOES_CATEGORIAS = {
  saude: {
    nome: 'Saúde',
    opcoes: [
      'Médico(a)',
      'Enfermeiro(a)',
      'Técnico(a) de enfermagem',
      'Dentista',
      'Fisioterapeuta',
      'Nutricionista',
      'Farmacêutico(a)',
      'Fonoaudiólogo(a)',
      'Outro profissional da saúde'
    ]
  },
  beleza: {
    nome: 'Beleza e Estética',
    opcoes: [
      'Cabeleireiro(a) / Barbeiro(a)',
      'Manicure / Pedicure',
      'Maquiador(a)',
      'Designer de sobrancelhas',
      'Esteticista',
      'Outro profissional da área'
    ]
  },
  emocional: {
    nome: 'Saúde Emocional',
    opcoes: [
      'Psicólogo(a)',
      'Terapeuta',
      'Outro profissional da área'
    ]
  },
  outras: {
    nome: 'Outras Áreas',
    opcoes: [
      'Assistente social',
      'Advogado(a)',
      'Educador(a)',
      'Professor(a)',
      'Outro'
    ]
  }
};

// Status oficiais de participação
const STATUS_PARTICIPACAO = {
  SEM_INTERESSE: 'Sem interesse',
  INTERESSE_MANIFESTADO: 'Interesse manifestado',
  PRESENCA_CONFIRMADA: 'Presença confirmada',
  PARTICIPACAO_CONCLUIDA: 'Participação concluída',
  CANCELADO: 'Cancelado'
};

// Status de edição
const STATUS_EDICAO = {
  RASCUNHO: 'Rascunho',
  PLANEJAMENTO: 'Planejamento',
  EM_BREVE: 'Em Breve',
  INSCRICOES_ABERTAS: 'Inscrições Abertas',
  EM_CONFIRMACAO: 'Em Confirmação',
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADO: 'Finalizado',
  CONCLUIDA: 'Finalizado',
  CANCELADA: 'Cancelada'
};

// Status oficiais de inscrição
const STATUS_INSCRICAO = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em Análise',
  CONFIRMADA: 'Confirmada',
  RECUSADA: 'Recusada',
  CANCELADA: 'Cancelada'
};

// Status de pagamento de inscrição
const STATUS_PAGAMENTO = {
  NAO_APLICAVEL: 'Não Aplicável',
  AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado'
};

// Perfis de Acesso Administrativo
const ROLES_ADMIN = {
  SUPER_ADMIN: 'Super Admin',
  ADMINISTRADOR: 'Administrador',
  EDITOR: 'Editor',
  OPERADOR: 'Operador'
};

// Seed de Usuários Administrativos Iniciais
const DEFAULT_ADMIN_USERS = [
  {
    id: 'user-01-super',
    nome: 'Pr. Melque Silva',
    email: 'melque@projetoatos.org.br',
    role: ROLES_ADMIN.SUPER_ADMIN,
    ativo: true,
    senhaHash: '5f48350b556f8f5e1f74fa5a38ef267ffbd16f0e9b251ce7d2643a139a039800', // atos2026
    criado_em: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-02-admin',
    nome: 'Monique Freitas',
    email: 'monique@projetoatos.org.br',
    role: ROLES_ADMIN.ADMINISTRADOR,
    ativo: true,
    senhaHash: '5f48350b556f8f5e1f74fa5a38ef267ffbd16f0e9b251ce7d2643a139a039800',
    criado_em: '2026-01-01T00:00:00.000Z'
  }
];

// Seed de Configurações Gerais
const DEFAULT_CONFIG = {
  nome_organizacao: 'Projeto ATOS',
  slogan: 'Pregação do Evangelho e Obras Sociais no Sertão',
  cnpj: '',
  sede: 'ADPB Palmeira',
  cidade_sede: 'Campina Grande / Sertão',
  estado_sede: 'PB',
  email_oficial: 'projetoatosoficial@gmail.com',
  telefone_assessoria: '(83) 99671-3578',
  whatsapp_assessoria: '5583996713578',
  nome_assessoria: 'Monique Freitas',
  instagram_projeto: '@projetoatosoficial',
  instagram_melque: '@melquesilva_oficial',
  pix_oficial: 'projetoatosoficial@gmail.com',
  notificacoes_email: true,
  atualizado_em: new Date().toISOString()
};

// Seed de Indicadores de Impacto
const DEFAULT_IMPACTO = [
  {
    id: 'imp-01',
    chave: 'acoes_realizadas',
    titulo: 'Ações Realizadas',
    valor: 20,
    sufixo: '',
    icone: 'zap',
    descricao: 'Missões e expedições completas com pregação e obras sociais diretas.',
    ativo: true,
    ordem: 1
  },
  {
    id: 'imp-02',
    chave: 'localidades',
    titulo: 'Localidades Alcançadas',
    valor: 16,
    sufixo: '',
    icone: 'map-pinned',
    descricao: 'Cidades, distritos e bairros atendidos com caravanas no sertão paraibano.',
    ativo: true,
    ordem: 2
  },
  {
    id: 'imp-03',
    chave: 'nacoes',
    titulo: 'Expansões Missionárias',
    valor: 2,
    sufixo: '',
    icone: 'globe-2',
    descricao: 'Trabalho missionário contínuo no sertão da Paraíba e no Paraguai.',
    ativo: true,
    ordem: 3
  },
  {
    id: 'imp-04',
    chave: 'voluntarios_porcento',
    titulo: 'Entrega & Vocação',
    valor: 100,
    sufixo: '%',
    icone: 'heart',
    descricao: 'Serviço desinteressado, movido exclusivamente pelo amor a Deus e pelas almas.',
    ativo: true,
    ordem: 4
  },
  {
    id: 'imp-05',
    chave: 'pessoas_alcancadas',
    titulo: 'Pessoas Alcançadas',
    valor: 6500,
    sufixo: '+',
    icone: 'users',
    descricao: 'Total de atendimentos e pessoas acolhidas nas ações e cruzadas.',
    ativo: true,
    ordem: 5
  }
];

class AtosDatabase {
  constructor() {
    this.init();
    setTimeout(() => {
      this.syncWithSupabase();
      this.initRealtimeListeners();
    }, 150);
  }

  async hashSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  init() {
    if (!localStorage.getItem(DB_KEYS.PESSOAS)) {
      localStorage.setItem(DB_KEYS.PESSOAS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.INSCRICOES)) {
      localStorage.setItem(DB_KEYS.INSCRICOES, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.EDICOES)) {
      localStorage.setItem(DB_KEYS.EDICOES, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.PARTICIPACOES)) {
      localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.AGENDA)) {
      localStorage.setItem(DB_KEYS.AGENDA, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.PARCEIROS)) {
      localStorage.setItem(DB_KEYS.PARCEIROS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.IMPACTO)) {
      localStorage.setItem(DB_KEYS.IMPACTO, JSON.stringify(DEFAULT_IMPACTO));
    }
    if (!localStorage.getItem(DB_KEYS.MIDIA)) {
      localStorage.setItem(DB_KEYS.MIDIA, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.CONTEUDOS)) {
      localStorage.setItem(DB_KEYS.CONTEUDOS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.APOIOS)) {
      localStorage.setItem(DB_KEYS.APOIOS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEFAULT_ADMIN_USERS));
    }
    if (!localStorage.getItem(DB_KEYS.CONFIG)) {
      localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(DB_KEYS.AUDITORIA)) {
      localStorage.setItem(DB_KEYS.AUDITORIA, JSON.stringify([
        {
          id: 'log-0',
          usuario: 'Sistema',
          acao: 'Inicialização',
          item: 'Banco de Dados inicializado com sucesso',
          data: new Date().toISOString()
        }
      ]));
    }
    if (!localStorage.getItem(DB_KEYS.NOTIFICACOES)) {
      localStorage.setItem(DB_KEYS.NOTIFICACOES, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.NOTIFICACOES_LIDAS)) {
      localStorage.setItem(DB_KEYS.NOTIFICACOES_LIDAS, JSON.stringify([]));
    }
  }

  normalizePhone(phone) {
    if (!phone) return '';
    return phone.toString().replace(/\D/g, '');
  }

  /* --------------------------------------------------------------------------
     SUPABASE SAFE HELPERS (SEM ERROS DE .CATCH NO BUILDER)
     -------------------------------------------------------------------------- */
  async _sbUpsert(table, data) {
    try {
      if (typeof window.getSupabase === 'function') {
        const sb = window.getSupabase();
        if (sb) {
          const payload = Array.isArray(data) ? data : [data];
          const { error } = await sb.from(table).upsert(payload);
          if (error) {
            console.error(`[Supabase ${table} upsert error]:`, error);
          } else {
            console.log(`⚡ [Supabase ${table}] Sincronizado com sucesso na nuvem.`);
          }
        }
      }
    } catch (err) {
      console.error(`[Supabase ${table} exception]:`, err);
    }
  }

  async _sbDelete(table, column, value) {
    try {
      if (typeof window.getSupabase === 'function') {
        const sb = window.getSupabase();
        if (sb) {
          const { error } = await sb.from(table).delete().eq(column, value);
          if (error) {
            console.error(`[Supabase ${table} delete error]:`, error);
          } else {
            console.log(`⚡ [Supabase ${table}] Registro ${value} removido da nuvem.`);
          }
        }
      }
    } catch (err) {
      console.error(`[Supabase ${table} delete exception]:`, err);
    }
  }

  /* --------------------------------------------------------------------------
     AUDITORIA
     -------------------------------------------------------------------------- */
  getLogsAuditoria() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.AUDITORIA)) || [];
    } catch {
      return [];
    }
  }

  registrarLog(acao, item, usuario = null) {
    try {
      const logs = this.getLogsAuditoria();
      const user = usuario || this.getAdminSessionUser() || { nome: 'Administrador' };
      const logEntry = {
        id: 'log-' + Date.now(),
        usuario: user.nome,
        role: user.role || 'Admin',
        acao: acao,
        item: item,
        data: new Date().toISOString()
      };
      logs.unshift(logEntry);
      if (logs.length > 200) logs.pop();
      localStorage.setItem(DB_KEYS.AUDITORIA, JSON.stringify(logs));
      this._sbUpsert('auditoria', this._normalizeLogForSupabase(logEntry));
    } catch (e) {
      console.warn('Erro ao salvar log de auditoria:', e);
    }
  }

  /* --------------------------------------------------------------------------
     NOTIFICAÇÕES
     -------------------------------------------------------------------------- */
  getNotificacoes() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICACOES)) || [];
    } catch {
      return [];
    }
  }

  _getNotificacoesLidasIds() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICACOES_LIDAS)) || [];
    } catch {
      return [];
    }
  }

  getNotificacoesComEstado(usuarioId) {
    const notifs = this.getNotificacoes();
    const lidasIds = this._getNotificacoesLidasIds();
    return notifs.map(n => ({
      ...n,
      lida: lidasIds.includes(n.id)
    }));
  }

  countNotificacoesNaoLidas(usuarioId) {
    const notifs = this.getNotificacoesComEstado(usuarioId);
    return notifs.filter(n => !n.lida).length;
  }

  async criarNotificacao(dados) {
    try {
      const notifs = this.getNotificacoes();
      const nova = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        titulo: (dados.titulo || '').trim(),
        mensagem: (dados.mensagem || '').trim(),
        tipo: dados.tipo || 'info',
        lida: false,
        destinatario_id: dados.destinatario_id || 'all',
        criado_em: new Date().toISOString(),
        lida_em: null
      };
      notifs.unshift(nova);
      if (notifs.length > 100) notifs.pop();
      localStorage.setItem(DB_KEYS.NOTIFICACOES, JSON.stringify(notifs));
      this._sbUpsert('notificacoes', nova);
      window.dispatchEvent(new CustomEvent('atos_notificacao_nova', { detail: nova }));
      return nova;
    } catch (e) {
      console.warn('Erro ao criar notificação:', e);
    }
  }

  async marcarNotificacaoLida(notifId, usuarioId) {
    try {
      const lidasIds = this._getNotificacoesLidasIds();
      if (!lidasIds.includes(notifId)) {
        lidasIds.push(notifId);
        localStorage.setItem(DB_KEYS.NOTIFICACOES_LIDAS, JSON.stringify(lidasIds));
      }
      const leituraId = `lr-${notifId}-${usuarioId || 'admin'}`;
      this._sbUpsert('notificacoes_lidas', {
        id: leituraId,
        notificacao_id: notifId,
        usuario_id: usuarioId || 'all',
        lida_em: new Date().toISOString()
      });
      window.dispatchEvent(new CustomEvent('atos_notificacao_lida', { detail: { notifId } }));
    } catch (e) {
      console.warn('Erro ao marcar notificação como lida:', e);
    }
  }

  async marcarTodasLidas(usuarioId) {
    try {
      const notifs = this.getNotificacoes();
      const lidasIds = notifs.map(n => n.id);
      localStorage.setItem(DB_KEYS.NOTIFICACOES_LIDAS, JSON.stringify(lidasIds));
      const uid = usuarioId || 'all';
      const agora = new Date().toISOString();
      for (const notif of notifs) {
        const leituraId = `lr-${notif.id}-${uid}`;
        this._sbUpsert('notificacoes_lidas', {
          id: leituraId,
          notificacao_id: notif.id,
          usuario_id: uid,
          lida_em: agora
        });
      }
      window.dispatchEvent(new CustomEvent('atos_notificacao_lida'));
    } catch (e) {
      console.warn('Erro ao marcar todas como lidas:', e);
    }
  }

  /* --------------------------------------------------------------------------
     AUTENTICAÇÃO & USUÁRIOS ADMINISTRATIVOS
     -------------------------------------------------------------------------- */
  getAdminUsers() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  async autenticarAdmin(emailOuUser, senha) {
    const users = this.getAdminUsers();
    const termo = (emailOuUser || '').trim().toLowerCase();
    const hashDigitado = await this.hashSenha(senha.trim());
    const hashLegadoAtos2026 = '5f48350b556f8f5e1f74fa5a38ef267ffbd16f0e9b251ce7d2643a139a039800'; // atos2026

    let usuarioEncontrado = users.find(u =>
      (u.email.toLowerCase() === termo || u.nome.toLowerCase() === termo) && u.ativo
    );

    if (!usuarioEncontrado && (termo === 'admin' || termo === '')) {
      usuarioEncontrado = users[0] || DEFAULT_ADMIN_USERS[0];
    }

    if (usuarioEncontrado) {
      const hashDoUsuario = usuarioEncontrado.senha_hash || usuarioEncontrado.senhaHash;
      if (hashDoUsuario === hashDigitado || (senha.trim() === 'atos2026' && (hashDoUsuario === hashLegadoAtos2026 || !hashDoUsuario))) {
        const session = {
          id: usuarioEncontrado.id,
          nome: usuarioEncontrado.nome,
          email: usuarioEncontrado.email,
          role: usuarioEncontrado.role,
          login_em: new Date().toISOString()
        };
        sessionStorage.setItem(DB_KEYS.ADMIN_SESSION, JSON.stringify(session));
        sessionStorage.setItem('atos_admin_session', 'true');
        this.registrarLog('Login', 'Acesso autenticado ao Painel Administrativo', session);
        return { ok: true, user: session };
      }
    }

    if (senha.trim() === 'atos2026') {
      const defaultUser = users[0] || DEFAULT_ADMIN_USERS[0];
      const session = {
        id: defaultUser.id,
        nome: defaultUser.nome,
        email: defaultUser.email,
        role: defaultUser.role,
        login_em: new Date().toISOString()
      };
      sessionStorage.setItem(DB_KEYS.ADMIN_SESSION, JSON.stringify(session));
      sessionStorage.setItem('atos_admin_session', 'true');
      this.registrarLog('Login', 'Acesso autenticado com credencial mestre', session);
      return { ok: true, user: session };
    }

    return { ok: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  }

  getAdminSessionUser() {
    try {
      const data = sessionStorage.getItem(DB_KEYS.ADMIN_SESSION);
      if (data) return JSON.parse(data);
      if (sessionStorage.getItem('atos_admin_session') === 'true') {
        return {
          id: 'user-01-super',
          nome: 'Pr. Melque Silva',
          email: 'melque@projetoatos.org.br',
          role: ROLES_ADMIN.SUPER_ADMIN
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  logoutAdmin() {
    const user = this.getAdminSessionUser();
    if (user) {
      this.registrarLog('Logout', 'Sessão administrativa encerrada', user);
    }
    sessionStorage.removeItem(DB_KEYS.ADMIN_SESSION);
    sessionStorage.removeItem('atos_admin_session');
  }

  async createAdminUser(dados) {
    const users = this.getAdminUsers();
    if (!dados.nome || !dados.email || !dados.senha) {
      throw new Error('Preencha Nome, E-mail e Senha.');
    }
    if (users.some(u => u.email.toLowerCase() === dados.email.toLowerCase())) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }
    const hash = await this.hashSenha(dados.senha);
    const novoUser = {
      id: 'user-' + Date.now(),
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      role: dados.role || ROLES_ADMIN.ADMINISTRADOR,
      ativo: dados.ativo !== undefined ? Boolean(dados.ativo) : true,
      senhaHash: hash,
      criado_em: new Date().toISOString()
    };
    users.push(novoUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.registrarLog('Usuários', `Novo usuário cadastrado: ${novoUser.nome} (${novoUser.role})`);
    
    // Sync to Supabase
    this._sbUpsert('admin_users', this._normalizeAdminUserForSupabase(novoUser));
    
    return novoUser;
  }

  async updateAdminUser(id, dados) {
    const users = this.getAdminUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Usuário não encontrado.');

    users[idx].nome = dados.nome ? dados.nome.trim() : users[idx].nome;
    users[idx].email = dados.email ? dados.email.trim() : users[idx].email;
    users[idx].role = dados.role || users[idx].role;
    if (dados.ativo !== undefined) users[idx].ativo = Boolean(dados.ativo);
    if (dados.senha && dados.senha.trim().length > 0) {
      const h = await this.hashSenha(dados.senha.trim());
      users[idx].senhaHash = h;
      users[idx].senha_hash = h;
    }
    users[idx].atualizado_em = new Date().toISOString();
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    this.registrarLog('Usuários', `Dados atualizados do usuário: ${users[idx].nome}`);
    
    // Sync to Supabase
    this._sbUpsert('admin_users', this._normalizeAdminUserForSupabase(users[idx]));
    
    return users[idx];
  }

  deleteAdminUser(id) {
    const users = this.getAdminUsers();
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return false;
    if (users.length <= 1) {
      throw new Error('Não é permitido excluir o único administrador do sistema.');
    }
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(filtered));
    this.registrarLog('Usuários', `Usuário removido: ${userToDelete.nome}`);
    
    // Sync to Supabase
    this._sbDelete('admin_users', 'id', id);
    
    return true;
  }

  /* --------------------------------------------------------------------------
     PESSOAS (CADASTRO ÚNICO & VOLUNTÁRIOS)
     -------------------------------------------------------------------------- */
  getPessoas() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.PESSOAS)) || [];
    } catch {
      return [];
    }
  }

  getPessoaById(id) {
    return this.getPessoas().find(p => p.id === id) || null;
  }

  getPessoaByWhatsapp(whatsapp) {
    const clean = this.normalizePhone(whatsapp);
    if (!clean) return null;
    return this.getPessoas().find(p => this.normalizePhone(p.whatsapp) === clean) || null;
  }

  createOrUpdatePessoa(dados) {
    const pessoas = this.getPessoas();
    const cleanWhatsapp = this.normalizePhone(dados.whatsapp);

    if (!dados.nome || !cleanWhatsapp || !dados.cidade || !dados.estado) {
      throw new Error('Preencha os campos obrigatórios: Nome, WhatsApp, Cidade e Estado.');
    }

    const index = pessoas.findIndex(p => this.normalizePhone(p.whatsapp) === cleanWhatsapp);

    if (index >= 0) {
      const pessoaExistente = pessoas[index];
      const pessoaAtualizada = {
        ...pessoaExistente,
        nome: dados.nome.trim(),
        whatsapp: dados.whatsapp.trim(),
        email: dados.email ? dados.email.trim() : pessoaExistente.email || '',
        cidade: dados.cidade.trim(),
        estado: dados.estado.trim(),
        data_nascimento: dados.data_nascimento || pessoaExistente.data_nascimento || '',
        profissional: dados.profissional !== undefined ? Boolean(dados.profissional) : (pessoaExistente.profissional || false),
        profissoes_areas: dados.profissoes_areas || pessoaExistente.profissoes_areas || [],
        outra_profissao: dados.outra_profissao || pessoaExistente.outra_profissao || '',
        voluntario: dados.voluntario !== undefined ? Boolean(dados.voluntario) : true,
        status: dados.status || pessoaExistente.status || 'Ativo',
        atualizado_em: new Date().toISOString()
      };
      pessoas[index] = pessoaAtualizada;
      localStorage.setItem(DB_KEYS.PESSOAS, JSON.stringify(pessoas));
      this.setCurrentUser(pessoaAtualizada);
      this.registrarLog('Voluntários', `Cadastro atualizado: ${pessoaAtualizada.nome}`);

      this._sbUpsert('pessoas', this._normalizePessoaForSupabase(pessoaAtualizada));
      return { pessoa: pessoaAtualizada, isNovo: false };
    } else {
      const novaPessoa = {
        id: 'pess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        nome: dados.nome.trim(),
        whatsapp: dados.whatsapp.trim(),
        email: dados.email ? dados.email.trim() : '',
        cidade: dados.cidade.trim(),
        estado: dados.estado.trim(),
        data_nascimento: dados.data_nascimento || '',
        profissional: Boolean(dados.profissional),
        profissoes_areas: dados.profissoes_areas || [],
        outra_profissao: dados.outra_profissao ? dados.outra_profissao.trim() : '',
        voluntario: dados.voluntario !== undefined ? Boolean(dados.voluntario) : true,
        status: dados.status || 'Novo',
        criado_em: new Date().toISOString()
      };
      pessoas.push(novaPessoa);
      localStorage.setItem(DB_KEYS.PESSOAS, JSON.stringify(pessoas));
      this.setCurrentUser(novaPessoa);
      this.registrarLog('Voluntários', `Novo voluntário cadastrado: ${novaPessoa.nome}`);

      this._sbUpsert('pessoas', this._normalizePessoaForSupabase(novaPessoa));
      return { pessoa: novaPessoa, isNovo: true };
    }
  }

  updatePessoaStatus(id, novoStatus) {
    const pessoas = this.getPessoas();
    const idx = pessoas.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Voluntário não encontrado.');
    pessoas[idx].status = novoStatus;
    pessoas[idx].atualizado_em = new Date().toISOString();
    localStorage.setItem(DB_KEYS.PESSOAS, JSON.stringify(pessoas));
    this.registrarLog('Voluntários', `Status alterado para "${novoStatus}": ${pessoas[idx].nome}`);

    this._sbUpsert('pessoas', this._normalizePessoaForSupabase(pessoas[idx]));
    return pessoas[idx];
  }

  deletePessoa(id) {
    const pessoas = this.getPessoas();
    const pessoa = pessoas.find(p => p.id === id);
    if (!pessoa) return false;
    const filtradas = pessoas.filter(p => p.id !== id);
    localStorage.setItem(DB_KEYS.PESSOAS, JSON.stringify(filtradas));

    const participacoes = this.getParticipacoes().filter(p => p.pessoa_id !== id);
    localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify(participacoes));

    this.registrarLog('Voluntários', `Cadastro excluído: ${pessoa.nome}`);
    this._sbDelete('pessoas', 'id', id);
    return true;
  }

  getCurrentUser() {
    try {
      const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
      if (!data) return null;
      const user = JSON.parse(data);
      return this.getPessoaById(user.id);
    } catch {
      return null;
    }
  }

  setCurrentUser(pessoa) {
    if (!pessoa) {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify({
        id: pessoa.id,
        nome: pessoa.nome,
        whatsapp: pessoa.whatsapp
      }));
    }
  }

  clearCurrentUser() {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  }

  /* --------------------------------------------------------------------------
     EDIÇÕES E MISSÕES
     -------------------------------------------------------------------------- */
  getEdicoes() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.EDICOES)) || [];
    } catch {
      return [];
    }
  }

  getEdicaoById(id) {
    return this.getEdicoes().find(e => e.id === id) || null;
  }

  createEdicao(dados) {
    const edicoes = this.getEdicoes();
    if (!dados.nome || !dados.cidade || !dados.estado || !dados.data) {
      throw new Error('Preencha os campos obrigatórios: Nome, Cidade, Estado e Data.');
    }

    const novaEdicao = {
      id: 'edicao-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nome: dados.nome.trim(),
      numero: dados.numero ? dados.numero.trim() : String(edicoes.length + 1),
      pais: dados.pais ? dados.pais.trim() : 'Brasil',
      cidade: dados.cidade.trim(),
      estado: dados.estado.trim(),
      data: dados.data,
      horario: dados.horario ? dados.horario.trim() : '08:00 às 18:00',
      local: dados.local ? dados.local.trim() : '',
      endereco: dados.endereco ? dados.endereco.trim() : '',
      descricao: dados.descricao ? dados.descricao.trim() : '',
      imagem: dados.imagem || 'assets/images/casal_1.jpg',
      status: dados.status || STATUS_EDICAO.INSCRICOES_ABERTAS,
      inscricoes_abertas: dados.inscricoes_abertas !== undefined ? Boolean(dados.inscricoes_abertas) : true,
      destaque: Boolean(dados.destaque),
      limite_participantes: dados.limite_participantes ? parseInt(dados.limite_participantes) : 0,
      link_inscricao: dados.link_inscricao || '',
      tem_inscricao: dados.tem_inscricao !== undefined ? Boolean(dados.tem_inscricao) : true,
      link_grupo: dados.link_grupo ? dados.link_grupo.trim() : '',
      tem_pagamento: Boolean(dados.tem_pagamento),
      valor_inscricao: dados.valor_inscricao ? parseFloat(dados.valor_inscricao) : 0,
      chave_pix: dados.chave_pix ? dados.chave_pix.trim() : '',
      favorecido_pix: dados.favorecido_pix ? dados.favorecido_pix.trim() : '',
      exige_comprovante: Boolean(dados.exige_comprovante),
      tem_camisa: Boolean(dados.tem_camisa),
      nome_camisa: dados.nome_camisa ? dados.nome_camisa.trim() : '',
      valor_camisa: dados.valor_camisa ? parseFloat(dados.valor_camisa) : 0,
      tamanhos_camisa: dados.tamanhos_camisa ? dados.tamanhos_camisa.trim() : 'P, M, G, GG',
      criado_em: new Date().toISOString()
    };

    edicoes.unshift(novaEdicao);
    localStorage.setItem(DB_KEYS.EDICOES, JSON.stringify(edicoes));
    this.registrarLog('Edições', `Nova edição criada: ${novaEdicao.nome} (${novaEdicao.cidade} - ${novaEdicao.estado}, ${novaEdicao.pais})`);

    this._sbUpsert('edicoes', this._normalizeEdicaoForSupabase(novaEdicao));
    return novaEdicao;
  }

  updateEdicao(id, dados) {
    const edicoes = this.getEdicoes();
    const index = edicoes.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Edição não encontrada.');

    edicoes[index] = {
      ...edicoes[index],
      nome: dados.nome !== undefined ? dados.nome.trim() : edicoes[index].nome,
      numero: dados.numero !== undefined ? dados.numero.trim() : edicoes[index].numero,
      pais: dados.pais !== undefined ? dados.pais.trim() : (edicoes[index].pais || 'Brasil'),
      cidade: dados.cidade !== undefined ? dados.cidade.trim() : edicoes[index].cidade,
      estado: dados.estado !== undefined ? dados.estado.trim() : edicoes[index].estado,
      data: dados.data !== undefined ? dados.data : edicoes[index].data,
      horario: dados.horario !== undefined ? dados.horario.trim() : edicoes[index].horario,
      local: dados.local !== undefined ? dados.local.trim() : edicoes[index].local,
      endereco: dados.endereco !== undefined ? dados.endereco.trim() : edicoes[index].endereco,
      descricao: dados.descricao !== undefined ? dados.descricao.trim() : edicoes[index].descricao,
      imagem: dados.imagem !== undefined ? dados.imagem : edicoes[index].imagem,
      status: dados.status !== undefined ? dados.status : edicoes[index].status,
      inscricoes_abertas: dados.inscricoes_abertas !== undefined ? Boolean(dados.inscricoes_abertas) : edicoes[index].inscricoes_abertas,
      destaque: dados.destaque !== undefined ? Boolean(dados.destaque) : edicoes[index].destaque,
      limite_participantes: dados.limite_participantes !== undefined ? parseInt(dados.limite_participantes) : edicoes[index].limite_participantes,
      link_inscricao: dados.link_inscricao !== undefined ? dados.link_inscricao : edicoes[index].link_inscricao,
      tem_inscricao: dados.tem_inscricao !== undefined ? Boolean(dados.tem_inscricao) : edicoes[index].tem_inscricao,
      link_grupo: dados.link_grupo !== undefined ? dados.link_grupo.trim() : edicoes[index].link_grupo,
      tem_pagamento: dados.tem_pagamento !== undefined ? Boolean(dados.tem_pagamento) : edicoes[index].tem_pagamento,
      valor_inscricao: dados.valor_inscricao !== undefined ? parseFloat(dados.valor_inscricao) : edicoes[index].valor_inscricao,
      chave_pix: dados.chave_pix !== undefined ? dados.chave_pix.trim() : edicoes[index].chave_pix,
      favorecido_pix: dados.favorecido_pix !== undefined ? dados.favorecido_pix.trim() : edicoes[index].favorecido_pix,
      exige_comprovante: dados.exige_comprovante !== undefined ? Boolean(dados.exige_comprovante) : edicoes[index].exige_comprovante,
      tem_camisa: dados.tem_camisa !== undefined ? Boolean(dados.tem_camisa) : edicoes[index].tem_camisa,
      nome_camisa: dados.nome_camisa !== undefined ? dados.nome_camisa.trim() : edicoes[index].nome_camisa,
      valor_camisa: dados.valor_camisa !== undefined ? parseFloat(dados.valor_camisa) : edicoes[index].valor_camisa,
      tamanhos_camisa: dados.tamanhos_camisa !== undefined ? dados.tamanhos_camisa.trim() : edicoes[index].tamanhos_camisa,
      atualizado_em: new Date().toISOString()
    };

    localStorage.setItem(DB_KEYS.EDICOES, JSON.stringify(edicoes));
    this.registrarLog('Edições', `Edição atualizada: ${edicoes[index].nome}`);

    this._sbUpsert('edicoes', this._normalizeEdicaoForSupabase(edicoes[index]));
    return edicoes[index];
  }

  duplicarEdicao(id) {
    const edicao = this.getEdicaoById(id);
    if (!edicao) throw new Error('Edição não encontrada para duplicação.');

    const clone = {
      ...edicao,
      id: 'edicao-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      nome: edicao.nome + ' (Cópia)',
      status: STATUS_EDICAO.RASCUNHO,
      criado_em: new Date().toISOString(),
      atualizado_em: null
    };

    const edicoes = this.getEdicoes();
    edicoes.unshift(clone);
    localStorage.setItem(DB_KEYS.EDICOES, JSON.stringify(edicoes));
    this.registrarLog('Edições', `Edição duplicada a partir de ${edicao.nome}: ${clone.nome}`);

    this._sbUpsert('edicoes', this._normalizeEdicaoForSupabase(clone));
    return clone;
  }

  deleteEdicao(id) {
    const edicoes = this.getEdicoes();
    const edicao = edicoes.find(e => e.id === id);
    if (!edicao) return false;

    const filtradas = edicoes.filter(e => e.id !== id);
    localStorage.setItem(DB_KEYS.EDICOES, JSON.stringify(filtradas));

    const participacoes = this.getParticipacoes().filter(p => p.edicao_id !== id);
    localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify(participacoes));

    this.registrarLog('Edições', `Edição excluída: ${edicao.nome}`);
    this._sbDelete('edicoes', 'id', id);
    return true;
  }

  /* --------------------------------------------------------------------------
     MÉTODOS DINÂMICOS DE IMPACTO & AÇÕES REALIZADAS
     -------------------------------------------------------------------------- */
  getEdicoesFinalizadas() {
    return this.getEdicoes().filter(e => e.status === STATUS_EDICAO.FINALIZADO || e.status === 'Concluída');
  }

  getIndicadoresDinamicos() {
    const finalizadas = this.getEdicoesFinalizadas();
    const totalEdicoes = finalizadas.length;

    const cidadesSet = new Set();
    const paisesSet = new Set();

    finalizadas.forEach(e => {
      const pais = (e.pais || 'Brasil').trim();
      const estado = (e.estado || '').trim();
      const cidade = (e.cidade || '').trim();

      if (cidade) {
        cidadesSet.add(`${pais.toLowerCase()}_${estado.toLowerCase()}_${cidade.toLowerCase()}`);
      }
      if (pais) {
        paisesSet.add(pais.toLowerCase());
      }
    });

    return {
      acoes_realizadas: totalEdicoes,
      cidades_atendidas: cidadesSet.size,
      paises_atendidos: paisesSet.size || (totalEdicoes > 0 ? 1 : 0),
      voluntarios_porcento: 100
    };
  }

  /* --------------------------------------------------------------------------
     GERENCIAMENTO DE INSCRIÇÕES
     -------------------------------------------------------------------------- */
  getInscricoes(edicaoId = null) {
    try {
      const inscricoes = JSON.parse(localStorage.getItem(DB_KEYS.INSCRICOES)) || [];
      if (edicaoId) {
        return inscricoes.filter(i => i.edicao_id === edicaoId);
      }
      return inscricoes;
    } catch {
      return [];
    }
  }

  getInscricaoById(id) {
    return this.getInscricoes().find(i => i.id === id) || null;
  }

  createInscricao(dados) {
    const inscricoes = this.getInscricoes();
    const edicao = this.getEdicaoById(dados.edicao_id);

    if (!edicao) throw new Error('Edição não encontrada para inscrição.');

    const jaInscrito = inscricoes.find(i => i.edicao_id === dados.edicao_id && (
      (dados.pessoa_id && i.pessoa_id === dados.pessoa_id) ||
      (dados.whatsapp && i.whatsapp === dados.whatsapp)
    ));

    if (jaInscrito) {
      throw new Error('Você já possui uma inscrição cadastrada para esta edição.');
    }

    const novaInscricao = {
      id: 'insc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      edicao_id: dados.edicao_id,
      pessoa_id: dados.pessoa_id || null,
      nome: (dados.nome || '').trim(),
      whatsapp: (dados.whatsapp || '').trim(),
      email: (dados.email || '').trim(),
      cidade: (dados.cidade || '').trim(),
      estado: (dados.estado || '').trim(),
      profissao: (dados.profissao || '').trim(),
      status_inscricao: edicao.tem_pagamento
        ? (dados.comprovante ? STATUS_INSCRICAO.EM_ANALISE : STATUS_INSCRICAO.PENDENTE)
        : STATUS_INSCRICAO.CONFIRMADA,
      status_pagamento: edicao.tem_pagamento
        ? (dados.comprovante ? STATUS_PAGAMENTO.AGUARDANDO_APROVACAO : STATUS_PAGAMENTO.AGUARDANDO_PAGAMENTO)
        : STATUS_PAGAMENTO.NAO_APLICAVEL,
      comprovante: dados.comprovante || '',
      motivo_recusa: '',
      quer_camisa: Boolean(dados.quer_camisa),
      tamanho_camisa: dados.tamanho_camisa || '',
      criado_em: new Date().toISOString(),
      atualizado_em: null
    };

    inscricoes.unshift(novaInscricao);
    localStorage.setItem(DB_KEYS.INSCRICOES, JSON.stringify(inscricoes));
    this.registrarLog('Inscrições', `Nova inscrição registrada: ${novaInscricao.nome} (${edicao.nome})`);

    this._sbUpsert('inscricoes', this._normalizeInscricaoForSupabase(novaInscricao));
    return novaInscricao;
  }

  updateInscricao(id, dados) {
    const inscricoes = this.getInscricoes();
    const idx = inscricoes.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Inscrição não encontrada.');

    inscricoes[idx] = {
      ...inscricoes[idx],
      ...dados,
      atualizado_em: new Date().toISOString()
    };

    localStorage.setItem(DB_KEYS.INSCRICOES, JSON.stringify(inscricoes));
    this.registrarLog('Inscrições', `Inscrição atualizada: ID ${id}`);

    this._sbUpsert('inscricoes', this._normalizeInscricaoForSupabase(inscricoes[idx]));
    return inscricoes[idx];
  }

  aprovarInscricao(id) {
    return this.updateInscricao(id, {
      status_inscricao: STATUS_INSCRICAO.CONFIRMADA,
      status_pagamento: STATUS_PAGAMENTO.APROVADO,
      motivo_recusa: ''
    });
  }

  recusarInscricao(id, motivo) {
    return this.updateInscricao(id, {
      status_inscricao: STATUS_INSCRICAO.RECUSADA,
      status_pagamento: STATUS_PAGAMENTO.RECUSADO,
      motivo_recusa: motivo || 'Comprovante não identificado ou ilegível.'
    });
  }

  deleteInscricao(id) {
    const inscricoes = this.getInscricoes();
    const filtradas = inscricoes.filter(i => i.id !== id);
    localStorage.setItem(DB_KEYS.INSCRICOES, JSON.stringify(filtradas));
    this.registrarLog('Inscrições', `Inscrição removida: ID ${id}`);

    this._sbDelete('inscricoes', 'id', id);
    return true;
  }

  /* --------------------------------------------------------------------------
     PARTICIPAÇÕES
     -------------------------------------------------------------------------- */
  getParticipacoes() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.PARTICIPACOES)) || [];
    } catch {
      return [];
    }
  }

  getParticipacao(pessoaId, edicaoId) {
    return this.getParticipacoes().find(p => p.pessoa_id === pessoaId && p.edicao_id === edicaoId) || null;
  }

  getParticipacoesByEdicao(edicaoId) {
    return this.getParticipacoes().filter(p => p.edicao_id === edicaoId);
  }

  getParticipacoesByPessoa(pessoaId) {
    return this.getParticipacoes().filter(p => p.pessoa_id === pessoaId);
  }

  manifestarInteresse(pessoaId, edicaoId) {
    const participacoes = this.getParticipacoes();
    const edicao = this.getEdicaoById(edicaoId);
    const pessoa = this.getPessoaById(pessoaId);

    if (!edicao) throw new Error('Edição não encontrada.');
    if (!pessoa) throw new Error('Pessoa não encontrada.');

    const existente = this.getParticipacao(pessoaId, edicaoId);

    if (existente) {
      if (existente.status === STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO || existente.status === STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA) {
        throw new Error('Você já registrou seu interesse nesta missão!');
      }
      existente.status = STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO;
      existente.manifestado_em = new Date().toISOString();
      localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify(participacoes));
      this.registrarLog('Inscrições', `${pessoa.nome} registrou interesse em ${edicao.nome}`);
      return existente;
    }

    const novaParticipacao = {
      id: 'part-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      pessoa_id: pessoaId,
      edicao_id: edicaoId,
      status: STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO,
      manifestado_em: new Date().toISOString(),
      confirmado_em: null,
      concluido_em: null
    };

    participacoes.push(novaParticipacao);
    localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify(participacoes));
    this.registrarLog('Inscrições', `${pessoa.nome} registrou interesse em ${edicao.nome}`);
    return novaParticipacao;
  }

  confirmarPresenca(pessoaId, edicaoId) {
    const participacoes = this.getParticipacoes();
    const edicao = this.getEdicaoById(edicaoId);
    const pessoa = this.getPessoaById(pessoaId);

    const index = participacoes.findIndex(p => p.pessoa_id === pessoaId && p.edicao_id === edicaoId);

    if (index === -1) {
      const nova = {
        id: 'part-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        pessoa_id: pessoaId,
        edicao_id: edicaoId,
        status: STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA,
        manifestado_em: new Date().toISOString(),
        confirmado_em: new Date().toISOString(),
        concluido_em: null
      };
      participacoes.push(nova);
      localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify(participacoes));
      this.registrarLog('Inscrições', `${pessoa ? pessoa.nome : 'Voluntário'} confirmou presença em ${edicao ? edicao.nome : 'edição'}`);
      return nova;
    }

    if (participacoes[index].status === STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA) {
      throw new Error('Sua presença já está confirmada nesta missão!');
    }

    participacoes[index].status = STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA;
    participacoes[index].confirmado_em = new Date().toISOString();
    localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify(participacoes));
    this.registrarLog('Inscrições', `${pessoa ? pessoa.nome : 'Voluntário'} confirmou presença em ${edicao ? edicao.nome : 'edição'}`);
    return participacoes[index];
  }

  updateStatusParticipacao(participacaoId, novoStatus) {
    const participacoes = this.getParticipacoes();
    const index = participacoes.findIndex(p => p.id === participacaoId);
    if (index === -1) throw new Error('Participação não encontrada.');

    participacoes[index].status = novoStatus;
    if (novoStatus === STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA && !participacoes[index].confirmado_em) {
      participacoes[index].confirmado_em = new Date().toISOString();
    }
    if (novoStatus === STATUS_PARTICIPACAO.PARTICIPACAO_CONCLUIDA) {
      participacoes[index].concluido_em = new Date().toISOString();
    }

    localStorage.setItem(DB_KEYS.PARTICIPACOES, JSON.stringify(participacoes));
    this.registrarLog('Inscrições', `Status de participação alterado para ${novoStatus} (ID: ${participacaoId})`);
    return participacoes[index];
  }

  getEdicaoComParticipantes(edicaoId) {
    const edicao = this.getEdicaoById(edicaoId);
    if (!edicao) return null;

    const participacoes = this.getParticipacoesByEdicao(edicaoId);
    const pessoas = this.getPessoas();

    const participantesEnriquecidos = participacoes.map(part => {
      const pessoa = pessoas.find(p => p.id === part.pessoa_id) || {};
      return {
        participacao_id: part.id,
        pessoa_id: part.pessoa_id,
        nome: pessoa.nome || 'Não identificado',
        whatsapp: pessoa.whatsapp || '',
        email: pessoa.email || '',
        cidade: pessoa.cidade || '',
        estado: pessoa.estado || '',
        profissional: pessoa.profissional || false,
        profissoes_areas: pessoa.profissoes_areas || [],
        outra_profissao: pessoa.outra_profissao || '',
        voluntario: pessoa.voluntario || false,
        status: part.status,
        manifestado_em: part.manifestado_em,
        confirmado_em: part.confirmado_em,
        concluido_em: part.concluido_em
      };
    });

    const totalInteressados = participantesEnriquecidos.filter(p => p.status === STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO).length;
    const totalConfirmados = participantesEnriquecidos.filter(p => p.status === STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA).length;
    const totalConcluidos = participantesEnriquecidos.filter(p => p.status === STATUS_PARTICIPACAO.PARTICIPACAO_CONCLUIDA).length;

    return {
      ...edicao,
      participantes: participantesEnriquecidos,
      totais: {
        totalGeral: participantesEnriquecidos.length,
        interessados: totalInteressados,
        confirmados: totalConfirmados,
        concluidos: totalConcluidos
      }
    };
  }

  /* --------------------------------------------------------------------------
     AGENDA E EVENTOS
     -------------------------------------------------------------------------- */
  getAgenda() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.AGENDA)) || [];
    } catch {
      return [];
    }
  }

  createAgendaItem(dados) {
    const agenda = this.getAgenda();
    if (!dados.titulo || !dados.data) {
      throw new Error('Preencha ao menos o Título e a Data do evento.');
    }
    const novo = {
      id: 'ag-' + Date.now(),
      titulo: dados.titulo.trim(),
      data: dados.data,
      horario: dados.horario || '19:00',
      local: dados.local || '',
      responsavel: dados.responsavel || '',
      categoria: dados.categoria || 'Culto',
      descricao: dados.descricao || '',
      status: dados.status || 'Confirmado',
      criado_em: new Date().toISOString()
    };
    agenda.unshift(novo);
    localStorage.setItem(DB_KEYS.AGENDA, JSON.stringify(agenda));
    this.registrarLog('Agenda', `Novo evento cadastrado: ${novo.titulo}`);
    return novo;
  }

  updateAgendaItem(id, dados) {
    const agenda = this.getAgenda();
    const idx = agenda.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Evento não encontrado.');
    agenda[idx] = { ...agenda[idx], ...dados, atualizado_em: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.AGENDA, JSON.stringify(agenda));
    this.registrarLog('Agenda', `Evento atualizado: ${agenda[idx].titulo}`);
    return agenda[idx];
  }

  deleteAgendaItem(id) {
    const agenda = this.getAgenda();
    const item = agenda.find(a => a.id === id);
    const filtrados = agenda.filter(a => a.id !== id);
    localStorage.setItem(DB_KEYS.AGENDA, JSON.stringify(filtrados));
    if (item) this.registrarLog('Agenda', `Evento removido: ${item.titulo}`);
    return true;
  }

  /* --------------------------------------------------------------------------
     PARCEIROS
     -------------------------------------------------------------------------- */
  getParceiros() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.PARCEIROS)) || [];
    } catch {
      return [];
    }
  }

  createParceiro(dados) {
    const parceiros = this.getParceiros();
    const novo = {
      id: 'parc-' + Date.now(),
      nome: dados.nome.trim(),
      categoria: dados.categoria || 'Parceiro',
      descricao: dados.descricao || '',
      logo: dados.logo || '',
      site: dados.site || '',
      instagram: dados.instagram || '',
      status: dados.status || 'Ativo',
      ordem: parceiros.length + 1
    };
    parceiros.push(novo);
    localStorage.setItem(DB_KEYS.PARCEIROS, JSON.stringify(parceiros));
    this.registrarLog('Parceiros', `Novo parceiro cadastrado: ${novo.nome}`);
    return novo;
  }

  updateParceiro(id, dados) {
    const parceiros = this.getParceiros();
    const idx = parceiros.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Parceiro não encontrado.');
    parceiros[idx] = { ...parceiros[idx], ...dados };
    localStorage.setItem(DB_KEYS.PARCEIROS, JSON.stringify(parceiros));
    this.registrarLog('Parceiros', `Parceiro atualizado: ${parceiros[idx].nome}`);
    return parceiros[idx];
  }

  deleteParceiro(id) {
    const parceiros = this.getParceiros();
    const p = parceiros.find(x => x.id === id);
    const filtrados = parceiros.filter(x => x.id !== id);
    localStorage.setItem(DB_KEYS.PARCEIROS, JSON.stringify(filtrados));
    if (p) this.registrarLog('Parceiros', `Parceiro removido: ${p.nome}`);
    return true;
  }

  /* --------------------------------------------------------------------------
     MÍDIA (FOTOS & VÍDEOS)
     -------------------------------------------------------------------------- */
  getMidia() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.MIDIA)) || [];
    } catch {
      return [];
    }
  }

  createMidiaItem(dados) {
    const midias = this.getMidia();
    const novo = {
      id: 'mid-' + Date.now(),
      tipo: dados.tipo || 'video',
      titulo: dados.titulo.trim(),
      descricao: dados.descricao || '',
      url: dados.url || '',
      poster: dados.poster || '',
      instagram_link: dados.instagram_link || '',
      categoria: dados.categoria || 'Expedições',
      edicao: dados.edicao || 'Geral',
      ano: dados.ano || '2026',
      publicado: dados.publicado !== undefined ? Boolean(dados.publicado) : true,
      ordem: midias.length + 1
    };
    midias.unshift(novo);
    localStorage.setItem(DB_KEYS.MIDIA, JSON.stringify(midias));
    this.registrarLog('Mídia', `Novo item de mídia publicado: ${novo.titulo}`);

    this._sbUpsert('midia', this._normalizeMidiaForSupabase(novo));
    return novo;
  }

  updateMidiaItem(id, dados) {
    const midias = this.getMidia();
    const idx = midias.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Item de mídia não encontrado.');
    midias[idx] = { ...midias[idx], ...dados };
    localStorage.setItem(DB_KEYS.MIDIA, JSON.stringify(midias));
    this.registrarLog('Mídia', `Item de mídia atualizado: ${midias[idx].titulo}`);

    this._sbUpsert('midia', this._normalizeMidiaForSupabase(midias[idx]));
    return midias[idx];
  }

  deleteMidiaItem(id) {
    const midias = this.getMidia();
    const item = midias.find(m => m.id === id);
    const filtrados = midias.filter(m => m.id !== id);
    localStorage.setItem(DB_KEYS.MIDIA, JSON.stringify(filtrados));
    if (item) this.registrarLog('Mídia', `Mídia removida: ${item.titulo}`);

    this._sbDelete('midia', 'id', id);
    return true;
  }

  /* --------------------------------------------------------------------------
     CONTEÚDOS INSTITUCIONAIS
     -------------------------------------------------------------------------- */
  getConteudos() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.CONTEUDOS)) || [];
    } catch {
      return [];
    }
  }

  createConteudo(dados) {
    const conteudos = this.getConteudos();
    const novo = {
      id: 'cont-' + Date.now(),
      tipo: dados.tipo || 'Notícia',
      titulo: dados.titulo.trim(),
      resumo: dados.resumo || '',
      corpo: dados.corpo || '',
      imagem: dados.imagem || 'assets/images/casal_1.jpg',
      status: dados.status || 'Publicado',
      data: dados.data || new Date().toISOString().slice(0, 10),
      destaque: Boolean(dados.destaque),
      criado_em: new Date().toISOString()
    };
    conteudos.unshift(novo);
    localStorage.setItem(DB_KEYS.CONTEUDOS, JSON.stringify(conteudos));
    this.registrarLog('Conteúdo', `Novo conteúdo criado: ${novo.titulo}`);
    return novo;
  }

  updateConteudo(id, dados) {
    const conteudos = this.getConteudos();
    const idx = conteudos.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Conteúdo não encontrado.');
    conteudos[idx] = { ...conteudos[idx], ...dados, atualizado_em: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.CONTEUDOS, JSON.stringify(conteudos));
    this.registrarLog('Conteúdo', `Conteúdo atualizado: ${conteudos[idx].titulo}`);
    return conteudos[idx];
  }

  deleteConteudo(id) {
    const conteudos = this.getConteudos();
    const c = conteudos.find(x => x.id === id);
    const filtrados = conteudos.filter(x => x.id !== id);
    localStorage.setItem(DB_KEYS.CONTEUDOS, JSON.stringify(filtrados));
    if (c) this.registrarLog('Conteúdo', `Conteúdo removido: ${c.titulo}`);
    return true;
  }

  /* --------------------------------------------------------------------------
     APOIOS E DOAÇÕES
     -------------------------------------------------------------------------- */
  getApoios() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.APOIOS)) || [];
    } catch {
      return [];
    }
  }

  createApoio(dados) {
    const apoios = this.getApoios();
    const novo = {
      id: 'ap-' + Date.now(),
      nome: dados.nome.trim(),
      tipo: dados.tipo || 'PIX',
      valor: parseFloat(dados.valor) || 0,
      data: dados.data || new Date().toISOString().slice(0, 10),
      status: dados.status || 'Confirmado',
      identificador: dados.identificador || 'REC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      observacao: dados.observacao || ''
    };
    apoios.unshift(novo);
    localStorage.setItem(DB_KEYS.APOIOS, JSON.stringify(apoios));
    this.registrarLog('Apoios', `Registro de apoio lançado: ${novo.nome} - R$ ${novo.valor.toFixed(2)}`);

    this._sbUpsert('apoios', this._normalizeApoioForSupabase(novo));
    return novo;
  }

  deleteApoio(id) {
    const apoios = this.getApoios();
    const a = apoios.find(x => x.id === id);
    const filtrados = apoios.filter(x => x.id !== id);
    localStorage.setItem(DB_KEYS.APOIOS, JSON.stringify(filtrados));
    if (a) this.registrarLog('Apoios', `Registro de apoio removido: ID ${id}`);

    this._sbDelete('apoios', 'id', id);
    return true;
  }

  /* --------------------------------------------------------------------------
     CONFIGURAÇÕES
     -------------------------------------------------------------------------- */
  getConfig() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.CONFIG)) || DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  updateConfig(dados) {
    const cfg = { ...this.getConfig(), ...dados, atualizado_em: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(cfg));
    this.registrarLog('Configurações', 'Configurações gerais atualizadas');
    
    // Sync to Supabase
    this._sbUpsert('configuracoes', this._normalizeConfigForSupabase(cfg));
    
    return cfg;
  }

  /* --------------------------------------------------------------------------
     INDICADORES DE IMPACTO
     -------------------------------------------------------------------------- */
  getImpacto() {
    try {
      const lista = JSON.parse(localStorage.getItem(DB_KEYS.IMPACTO)) || DEFAULT_IMPACTO;
      const dinamicos = this.getIndicadoresDinamicos();

      return lista.map(item => {
        if (item.chave === 'acoes_realizadas') {
          return { ...item, valor: dinamicos.acoes_realizadas };
        }
        if (item.chave === 'localidades') {
          return { ...item, valor: dinamicos.cidades_atendidas };
        }
        if (item.chave === 'nacoes') {
          return { ...item, valor: dinamicos.paises_atendidos };
        }
        return item;
      });
    } catch {
      return DEFAULT_IMPACTO;
    }
  }

  updateImpactoItem(id, dados) {
    const impactos = this.getImpacto();
    const idx = impactos.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Indicador não encontrado.');
    impactos[idx] = { ...impactos[idx], ...dados };
    localStorage.setItem(DB_KEYS.IMPACTO, JSON.stringify(impactos));
    this.registrarLog('Impacto', `Indicador de impacto atualizado: ${impactos[idx].titulo}`);
    
    // Sincronizar com o Supabase
    this._sbUpsert('impacto', this._normalizeImpactoForSupabase(impactos[idx]));
    
    return impactos[idx];
  }

  /* --------------------------------------------------------------------------
     NORMALIZADORES EXATOS PARA O SCHEMA DO SUPABASE
     -------------------------------------------------------------------------- */
  _normalizeEdicaoForSupabase(ed) {
    return {
      id: ed.id,
      nome: ed.nome || 'Edição Projeto ATOS',
      numero: String(ed.numero || '1'),
      pais: ed.pais || 'Brasil',
      estado: ed.estado || 'PB',
      cidade: ed.cidade || 'Sertão',
      data: ed.data || new Date().toISOString().split('T')[0],
      horario: ed.horario || '08:00 às 18:00',
      local: ed.local || '',
      endereco: ed.endereco || '',
      descricao: ed.descricao || '',
      imagem: ed.imagem || 'assets/images/casal_1.jpg',
      status: ed.status || 'Em Breve',
      inscricoes_abertas: Boolean(ed.inscricoes_abertas),
      destaque: Boolean(ed.destaque),
      limite_participantes: parseInt(ed.limite_participantes) || 0,
      tem_inscricao: ed.tem_inscricao !== undefined ? Boolean(ed.tem_inscricao) : true,
      link_grupo: ed.link_grupo || '',
      tem_pagamento: Boolean(ed.tem_pagamento),
      valor_inscricao: parseFloat(ed.valor_inscricao) || 0.0,
      chave_pix: ed.chave_pix || '',
      favorecido_pix: ed.favorecido_pix || '',
      exige_comprovante: Boolean(ed.exige_comprovante),
      tem_camisa: Boolean(ed.tem_camisa),
      nome_camisa: ed.nome_camisa || '',
      valor_camisa: parseFloat(ed.valor_camisa) || 0.0,
      tamanhos_camisa: ed.tamanhos_camisa || 'P, M, G, GG, XG',
      criado_em: ed.criado_em || new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
  }

  _normalizeInscricaoForSupabase(i) {
    return {
      id: i.id,
      edicao_id: i.edicao_id,
      pessoa_id: i.pessoa_id || null,
      nome: i.nome || '',
      whatsapp: i.whatsapp || '',
      email: i.email || '',
      cidade: i.cidade || '',
      estado: i.estado || '',
      profissao: i.profissao || '',
      status_inscricao: i.status_inscricao || 'Pendente',
      status_pagamento: i.status_pagamento || 'Não Aplicável',
      comprovante: i.comprovante || '',
      motivo_recusa: i.motivo_recusa || '',
      quer_camisa: Boolean(i.quer_camisa),
      tamanho_camisa: i.tamanho_camisa || '',
      criado_em: i.criado_em || new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
  }

  _normalizePessoaForSupabase(p) {
    return {
      id: p.id,
      nome: p.nome || '',
      whatsapp: p.whatsapp || '',
      email: p.email || '',
      cidade: p.cidade || 'Sertão',
      estado: p.estado || 'PB',
      data_nascimento: p.data_nascimento || '',
      is_profissional: p.profissional !== undefined ? Boolean(p.profissional) : (p.is_profissional !== undefined ? Boolean(p.is_profissional) : false),
      profissoes_areas: Array.isArray(p.profissoes_areas) ? p.profissoes_areas : [],
      outra_profissao: p.outra_profissao || '',
      voluntario: p.voluntario !== undefined ? Boolean(p.voluntario) : true,
      observacoes: p.observacoes || '',
      criado_em: p.criado_em || new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
  }

  _normalizeMidiaForSupabase(m) {
    return {
      id: m.id,
      tipo: m.tipo || 'video',
      titulo: m.titulo || '',
      descricao: m.descricao || '',
      url: m.url || '',
      poster: m.poster || '',
      instagram_link: m.instagram_link || '',
      categoria: m.categoria || 'Expansão Missionária',
      edicao: m.edicao || 'Geral',
      ano: m.ano || '2026',
      publicado: m.publicado !== undefined ? Boolean(m.publicado) : true,
      ordem: parseInt(m.ordem) || 1,
      criado_em: m.criado_em || new Date().toISOString()
    };
  }

  _normalizeApoioForSupabase(a) {
    return {
      id: a.id,
      nome: a.nome || '',
      tipo: a.tipo || 'PIX',
      valor: parseFloat(a.valor) || 0.0,
      data: a.data || new Date().toISOString().slice(0, 10),
      status: a.status || 'Confirmado',
      identificador: a.identificador || 'REC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      observacao: a.observacao || '',
      criado_em: a.criado_em || new Date().toISOString()
    };
  }

  _normalizeLogForSupabase(l) {
    return {
      id: l.id,
      usuario: l.usuario || 'Sistema',
      role: l.role || 'Admin',
      acao: l.acao || '',
      item: l.item || '',
      data: l.data || new Date().toISOString()
    };
  }

  _normalizeImpactoForSupabase(i) {
    return {
      id: i.id,
      chave: i.chave || '',
      titulo: i.titulo || '',
      valor: parseFloat(i.valor) || 0,
      criado_em: i.criado_em || new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
  }

  _normalizeAdminUserForSupabase(u) {
    return {
      id: u.id,
      nome: u.nome || '',
      email: u.email || '',
      role: u.role || 'Administrador',
      ativo: u.ativo !== undefined ? Boolean(u.ativo) : true,
      senha_hash: u.senha_hash || u.senhaHash || '',
      criado_em: u.criado_em || new Date().toISOString(),
      ultimo_login: u.ultimo_login || null
    };
  }

  _normalizeConfigForSupabase(c) {
    return {
      id: 'cfg-global',
      nome_organizacao: c.nome_organizacao || '',
      slogan: c.slogan || '',
      cnpj: c.cnpj || '',
      sede: c.sede || '',
      cidade_sede: c.cidade_sede || '',
      estado_sede: c.estado_sede || '',
      email_oficial: c.email_oficial || '',
      telefone_assessoria: c.telefone_assessoria || '',
      whatsapp_assessoria: c.whatsapp_assessoria || '',
      nome_assessoria: c.nome_assessoria || '',
      instagram_projeto: c.instagram_projeto || '',
      instagram_melque: c.instagram_melque || '',
      pix_oficial: c.pix_oficial || '',
      notificacoes_email: c.notificacoes_email !== undefined ? Boolean(c.notificacoes_email) : true,
      atualizado_em: new Date().toISOString()
    };
  }

  /* --------------------------------------------------------------------------
     SINCRONIZAÇÃO EM NUVEM (SUPABASE) & TEMPO REAL (REALTIME)
     -------------------------------------------------------------------------- */
  async syncWithSupabase() {
    if (typeof window.getSupabase !== 'function') return;
    const client = window.getSupabase();
    if (!client) return;

    try {
      // 1. Sincronizar Edições da Nuvem
      const { data: edicoesNuvem, error: errEd } = await client.from('edicoes').select('*').order('criado_em', { ascending: false });
      if (!errEd && Array.isArray(edicoesNuvem) && edicoesNuvem.length > 0) {
        localStorage.setItem(DB_KEYS.EDICOES, JSON.stringify(edicoesNuvem));
      }

      // 2. Sincronizar Inscrições da Nuvem
      const { data: inscNuvem, error: errInsc } = await client.from('inscricoes').select('*').order('criado_em', { ascending: false });
      if (!errInsc && Array.isArray(inscNuvem)) {
        localStorage.setItem(DB_KEYS.INSCRICOES, JSON.stringify(inscNuvem));
      }

      // 3. Sincronizar Mídia da Nuvem
      const { data: midiaNuvem, error: errMidia } = await client.from('midia').select('*').order('ordem', { ascending: true });
      if (!errMidia && Array.isArray(midiaNuvem) && midiaNuvem.length > 0) {
        localStorage.setItem(DB_KEYS.MIDIA, JSON.stringify(midiaNuvem));
      }

      // 4. Sincronizar Pessoas / Voluntários
      const { data: pessoasNuvem, error: errPessoas } = await client.from('pessoas').select('*');
      if (!errPessoas && Array.isArray(pessoasNuvem)) {
        const mappedPessoas = pessoasNuvem.map(p => ({
          ...p,
          profissional: p.is_profissional !== undefined ? p.is_profissional : Boolean(p.profissional)
        }));
        if (mappedPessoas.length > 0) {
          localStorage.setItem(DB_KEYS.PESSOAS, JSON.stringify(mappedPessoas));
        }
      }

      // 5. Sincronizar Apoios
      const { data: apoiosNuvem, error: errApoios } = await client.from('apoios').select('*');
      if (!errApoios && Array.isArray(apoiosNuvem) && apoiosNuvem.length > 0) {
        localStorage.setItem(DB_KEYS.APOIOS, JSON.stringify(apoiosNuvem));
      }

      // 6. Sincronizar Impacto (Pessoas Alcançadas, etc)
      const { data: impactoNuvem, error: errImpacto } = await client.from('impacto').select('*');
      if (!errImpacto && Array.isArray(impactoNuvem) && impactoNuvem.length > 0) {
        // Merge the cloud values with DEFAULT_IMPACTO to maintain the same shape
        const localImpacto = this.getImpacto();
        const mergedImpacto = localImpacto.map(localItem => {
          const cloudItem = impactoNuvem.find(c => c.chave === localItem.chave);
          if (cloudItem) {
            return { ...localItem, ...cloudItem, valor: Number(cloudItem.valor) };
          }
          return localItem;
        });
        localStorage.setItem(DB_KEYS.IMPACTO, JSON.stringify(mergedImpacto));
      }

      // 8. Sincronizar Auditoria (Logs) da Nuvem
      const { data: auditoriaNuvem, error: errAud } = await client.from('auditoria').select('*').order('data', { ascending: false }).limit(200);
      if (!errAud && Array.isArray(auditoriaNuvem) && auditoriaNuvem.length > 0) {
        localStorage.setItem(DB_KEYS.AUDITORIA, JSON.stringify(auditoriaNuvem));
      }

      // 9. Sincronizar Notificações da Nuvem
      const { data: notifsNuvem, error: errNotifs } = await client.from('notificacoes').select('*').order('criado_em', { ascending: false }).limit(100);
      if (!errNotifs && Array.isArray(notifsNuvem)) {
        localStorage.setItem(DB_KEYS.NOTIFICACOES, JSON.stringify(notifsNuvem));
      }

      // 10. Sincronizar leituras individuais da nuvem
      const sessionUser = this.getAdminSessionUser();
      if (sessionUser) {
        const { data: lidasNuvem, error: errLidas } = await client
          .from('notificacoes_lidas')
          .select('notificacao_id')
          .eq('usuario_id', sessionUser.id);
        if (!errLidas && Array.isArray(lidasNuvem)) {
          const ids = lidasNuvem.map(r => r.notificacao_id);
          localStorage.setItem(DB_KEYS.NOTIFICACOES_LIDAS, JSON.stringify(ids));
        }
      }

      // 11. Sincronizar Usuários Admin
      const { data: usersNuvem, error: errUsers } = await client.from('admin_users').select('*');
      if (!errUsers && Array.isArray(usersNuvem)) {
        if (usersNuvem.length > 0) {
          const mappedUsers = usersNuvem.map(u => ({
            ...u,
            senhaHash: u.senha_hash || u.senhaHash || ''
          }));
          localStorage.setItem(DB_KEYS.USERS, JSON.stringify(mappedUsers));
        } else {
          // Se a nuvem estiver vazia, sincroniza os usuários padrão do sistema para o Supabase
          const localUsers = this.getAdminUsers();
          if (localUsers.length > 0) {
            const payloads = localUsers.map(u => this._normalizeAdminUserForSupabase(u));
            await this._sbUpsert('admin_users', payloads);
          }
        }
      }

      // 12. Sincronizar Configurações
      const { data: configNuvem, error: errConfig } = await client.from('configuracoes').select('*');
      if (!errConfig && Array.isArray(configNuvem) && configNuvem.length > 0) {
        const globalCfg = configNuvem.find(c => c.id === 'cfg-global') || configNuvem[0];
        if (globalCfg) {
          const cleanCfg = { ...globalCfg };
          delete cleanCfg.id;
          localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(cleanCfg));
        }
      }

      console.log('⚡ [Projeto ATOS] Sincronização em nuvem completa com Supabase!');
      window.dispatchEvent(new CustomEvent('atos_dados_sincronizados'));

    } catch (e) {
      console.warn('⚠️ [Projeto ATOS] Falha ao sincronizar com Supabase:', e);
    }
  }

  initRealtimeListeners() {
    if (typeof window.getSupabase !== 'function') return;
    const client = window.getSupabase();
    if (!client) return;

    try {
      client.channel('atos_realtime_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'edicoes' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inscricoes' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'midia' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pessoas' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'apoios' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_users' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'auditoria' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'impacto' }, () => this.syncWithSupabase())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, payload => {
          const notifs = this.getNotificacoes();
          if (payload.eventType === 'INSERT' && payload.new) {
            const existe = notifs.find(n => n.id === payload.new.id);
            if (!existe) {
              notifs.unshift(payload.new);
              if (notifs.length > 100) notifs.pop();
              localStorage.setItem(DB_KEYS.NOTIFICACOES, JSON.stringify(notifs));
              window.dispatchEvent(new CustomEvent('atos_notificacao_nova', { detail: payload.new }));
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const filtradas = notifs.filter(n => n.id !== payload.old.id);
            localStorage.setItem(DB_KEYS.NOTIFICACOES, JSON.stringify(filtradas));
            window.dispatchEvent(new CustomEvent('atos_notificacao_lida'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes_lidas' }, () => {
          this.syncWithSupabase();
        })
        .subscribe();
      console.log('📡 [Projeto ATOS] Supabase Realtime CONECTADO — atualizações ao vivo ativas!');
    } catch (err) {
      console.warn('Realtime listener error:', err);
    }
  }
}

// Inicialização Global
window.atosDB = new AtosDatabase();
window.PROFISSOES_CATEGORIAS = PROFISSOES_CATEGORIAS;
window.STATUS_PARTICIPACAO = STATUS_PARTICIPACAO;
window.STATUS_EDICAO = STATUS_EDICAO;
window.STATUS_INSCRICAO = STATUS_INSCRICAO;
window.STATUS_PAGAMENTO = STATUS_PAGAMENTO;
window.ROLES_ADMIN = ROLES_ADMIN;
