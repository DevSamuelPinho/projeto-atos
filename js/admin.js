/**
 * PROJETO ATOS — Painel Administrativo Unificado
 * Lógica completa de:
 * - Autenticação e Sessão Persistente
 * - Navegação via Sidebar (14 seções) e Header com busca
 * - Dashboard com métricas consolidadas
 * - CRUD de Edições e Missões (integradas ao site público)
 * - CRUD de Agenda e Eventos (integradas ao site público)
 * - Gerenciamento e Filtros de Voluntários
 * - Gerenciamento de Participantes e Inscrições por Edição
 * - CRUD de Parceiros
 * - CRUD de Indicadores de Impacto (integrados ao site público)
 * - Biblioteca de Mídia (Vídeos e Fotos)
 * - Conteúdos Institucionais & Notícias
 * - Apoios & Doações
 * - Usuários & Níveis de Acesso
 * - Configurações Gerais
 * - Auditoria / Logs
 * - Backup & Restauração JSON
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminApp();
});

function initAdminApp() {
  initAuth();
  initSidebarNav();
  initGlobalSearch();
  initEdicoesModule();
  initAgendaModule();
  initVoluntariosModule();
  initParticipantesModule();
  initParceirosModule();
  initImpactoModule();
  initMidiaModule();
  initConteudosModule();

  initComprovanteModule();
  initUsuariosModule();
  initConfiguracoesModule();
  initAuditoriaModule();
  initBackupModule();
  initNotificacoesModule();
}

/* --------------------------------------------------------------------------
   1. AUTENTICAÇÃO E SESSÃO
   -------------------------------------------------------------------------- */
function initAuth() {
  const loginScreen = document.getElementById('admin-login-screen');
  const adminApp = document.getElementById('admin-app');
  const loginForm = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const btnRecuperar = document.getElementById('btn-recuperar-senha');

  // Verifica sessão ativa
  const sessionUser = window.atosDB.getAdminSessionUser();
  if (sessionUser) {
    loginScreen.classList.add('hidden');
    adminApp.classList.remove('hidden');
    updateUserDisplay(sessionUser);
    renderCurrentSection('dashboard');
  } else {
    loginScreen.classList.remove('hidden');
    adminApp.classList.add('hidden');
  }

  // Submit de Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');

    const email = emailInput.value.trim();
    const pass = passwordInput.value.trim();

    try {
      const resultado = await window.atosDB.autenticarAdmin(email, pass);
      if (resultado.ok) {
        loginScreen.classList.add('hidden');
        adminApp.classList.remove('hidden');
        updateUserDisplay(resultado.user);
        renderCurrentSection('dashboard');
        showToast('Login realizado!', `Bem-vindo de volta, ${resultado.user.nome.split(' ')[0]}.`, 'check', 'cacto');
      } else {
        loginError.textContent = resultado.error || 'Credenciais inválidas.';
        loginError.classList.remove('hidden');
      }
    } catch (err) {
      loginError.textContent = err.message || 'Erro ao realizar login.';
      loginError.classList.remove('hidden');
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Deseja realmente sair da área administrativa?')) {
        window.atosDB.logoutAdmin();
        window.location.hash = 'login';
        window.location.reload();
      }
    });
  }

  // Recuperação de Acesso
  if (btnRecuperar) {
    btnRecuperar.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Recuperação de Acesso:\nA credencial padrão para administração mestre é:\nUsuário: admin (ou melque@projetoatos.org.br)\nSenha: atos2026\n\nCaso tenha alterado a senha, você pode restaurar o banco através do backup inicial.');
    });
  }
}

function updateUserDisplay(user) {
  if (!user) return;
  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');
  const avatarEl = document.getElementById('user-avatar-initials');

  if (nameEl) nameEl.textContent = user.nome;
  if (roleEl) roleEl.textContent = user.role || 'Administrador';
  if (avatarEl) {
    const parts = (user.nome || 'PA').trim().split(' ');
    const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]) : parts[0].substring(0, 2);
    avatarEl.textContent = initials.toUpperCase();
  }
}

/* --------------------------------------------------------------------------
   2. NAVEGAÇÃO PELA SIDEBAR E CONTROLE DE TELAS
   -------------------------------------------------------------------------- */
function initSidebarNav() {
  const links = document.querySelectorAll('.admin-sidebar-link');
  const btnToggle = document.getElementById('btn-toggle-mobile-sidebar');
  const btnClose = document.getElementById('btn-close-mobile-sidebar');
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('admin-sidebar-backdrop');

  links.forEach(link => {
    link.addEventListener('click', () => {
      const section = link.getAttribute('data-section');
      navigateToSection(section);

      // Fecha sidebar mobile se aberta
      if (window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
      }
    });
  });

  // Toggle mobile sidebar
  if (btnToggle && sidebar && backdrop) {
    btnToggle.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
    });
  }

  if (btnClose && sidebar && backdrop) {
    btnClose.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
    });
  }
}

function navigateToSection(sectionName) {
  const links = document.querySelectorAll('.admin-sidebar-link');
  const sections = document.querySelectorAll('.admin-section');
  const titleEl = document.getElementById('header-page-title');
  const subEl = document.getElementById('header-page-subtitle');

  links.forEach(l => {
    if (l.getAttribute('data-section') === sectionName) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  sections.forEach(s => s.classList.add('hidden'));

  const target = document.getElementById(`section-${sectionName}`);
  if (target) {
    target.classList.remove('hidden');
  }

  // Títulos descritivos do Header
  const headersMap = {
    dashboard: {
      title: 'Dashboard',
      sub: 'Olá, Administrador 👋 Veja o resumo das atividades do Projeto ATOS.'
    },
    edicoes: {
      title: 'Edições & Missões',
      sub: 'Gerencie as próximas caravanas, cidades e inscrições abertas.'
    },
    agenda: {
      title: 'Agenda & Eventos',
      sub: 'Controle o calendário de cultos, ações sociais e compromissos missionários.'
    },
    voluntarios: {
      title: 'Rede de Voluntários',
      sub: 'Consulte voluntários cadastrados, profissões e cidades de atuação.'
    },
    participantes: {
      title: 'Participantes por Missão',
      sub: 'Acompanhe inscrições, confirmações de presença e participantes.'
    },
    parceiros: {
      title: 'Parceiros & Mantenedores',
      sub: 'Igrejas locais, profissionais e entidades apoiadoras da obra.'
    },
    impacto: {
      title: 'Indicadores de Impacto',
      sub: 'Estatísticas reais que alimentam os contadores da página pública.'
    },
    midia: {
      title: 'Fotos & Vídeos',
      sub: 'Acervo de mídia, vídeos das expedições e registros no campo.'
    },
    conteudos: {
      title: 'Conteúdos & Notícias',
      sub: 'Informativos, testemunhos e comunicados oficiais do ministério.'
    },

    usuarios: {
      title: 'Usuários & Permissões',
      sub: 'Gerencie contas com perfis de Super Admin, Administrador, Editor e Operador.'
    },
    configuracoes: {
      title: 'Configurações Gerais',
      sub: 'Dados institucionais, chave PIX, telefones e redes sociais.'
    },
    auditoria: {
      title: 'Auditoria & Logs',
      sub: 'Histórico detalhado de alterações e ações administrativas registradas.'
    },
    backup: {
      title: 'Backup & Dados',
      sub: 'Exportação completa e importação segura do banco de dados.'
    }
  };

  const meta = headersMap[sectionName] || { title: 'Administração', sub: 'Painel de Controle' };
  if (titleEl) titleEl.textContent = meta.title;
  if (subEl) subEl.textContent = meta.sub;

  renderCurrentSection(sectionName);
  if (window.lucide) lucide.createIcons();
}

function renderCurrentSection(section) {
  switch (section) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'edicoes':
      renderEdicoes();
      break;
    case 'agenda':
      renderAgenda();
      break;
    case 'voluntarios':
      renderVoluntarios();
      break;
    case 'participantes':
      renderParticipantesSelect();
      break;
    case 'parceiros':
      renderParceiros();
      break;
    case 'impacto':
      renderImpacto();
      break;
    case 'midia':
      renderMidia();
      break;
    case 'conteudos':
      renderConteudos();
      break;

    case 'usuarios':
      renderUsuarios();
      break;
    case 'configuracoes':
      renderConfiguracoes();
      break;
    case 'auditoria':
      renderAuditoria();
      break;
    case 'backup':
      // Backup já inicializado
      break;
  }
}

/* --------------------------------------------------------------------------
   3. BUSCA GLOBAL NO ADMIN
   -------------------------------------------------------------------------- */
function initGlobalSearch() {
  const input = document.getElementById('global-admin-search');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const termo = input.value.trim().toLowerCase();
      if (!termo) return;

      // Se encontrou voluntário ou edição, redireciona
      const pessoas = window.atosDB.getPessoas().filter(p => 
        p.nome.toLowerCase().includes(termo) || p.whatsapp.includes(termo)
      );
      if (pessoas.length > 0) {
        navigateToSection('voluntarios');
        const filtro = document.getElementById('filtro-termo');
        if (filtro) {
          filtro.value = termo;
          renderVoluntarios();
        }
        return;
      }

      const edicoes = window.atosDB.getEdicoes().filter(ed =>
        ed.nome.toLowerCase().includes(termo) || ed.cidade.toLowerCase().includes(termo)
      );
      if (edicoes.length > 0) {
        navigateToSection('edicoes');
        return;
      }

      showToast('Busca', `Nenhum resultado direto para "${termo}".`, 'search', 'chama');
    }
  });
}

/* --------------------------------------------------------------------------
   4. SEÇÃO DASHBOARD
   -------------------------------------------------------------------------- */
function renderDashboard() {
  const edicoes = window.atosDB.getEdicoes();
  const pessoas = window.atosDB.getPessoas();
  const participacoes = window.atosDB.getParticipacoes();
  const parceiros = window.atosDB.getParceiros();
  const impactos = window.atosDB.getImpacto();

  const agenda = window.atosDB.getAgenda();
  const logs = window.atosDB.getLogsAuditoria();

  // Métricas
  const edicoesAtivas = edicoes.filter(e => e.status !== 'Concluída' && e.status !== 'Cancelada').length;
  const totalVoluntarios = pessoas.length;
  const totalParticipantes = participacoes.length;
  const totalParceiros = parceiros.length;

  let totalImpactoValor = 0;
  const impPrincipal = impactos.find(i => i.chave === 'pessoas_alcancadas' || i.chave === 'acoes_realizadas');
  if (impPrincipal) totalImpactoValor = impPrincipal.valor;

  const elEd = document.getElementById('dash-met-edicoes');
  const elVol = document.getElementById('dash-met-voluntarios');
  const elPart = document.getElementById('dash-met-participantes');
  const elParc = document.getElementById('dash-met-parceiros');
  const elImp = document.getElementById('dash-met-impacto');

  if (elEd) elEd.textContent = edicoesAtivas;
  if (elVol) elVol.textContent = totalVoluntarios;
  if (elPart) elPart.textContent = totalParticipantes;
  if (elParc) elParc.textContent = totalParceiros;
  if (elImp) elImp.textContent = totalImpactoValor.toLocaleString('pt-BR');

  // Lista de Próximas Edições
  const listaEd = document.getElementById('dash-edicoes-lista');
  if (listaEd) {
    listaEd.innerHTML = '';
    const proximas = edicoes.filter(e => e.status !== 'Concluída' && e.status !== 'Cancelada').slice(0, 3);
    if (proximas.length === 0) {
      listaEd.innerHTML = `
        <div class="p-6 text-center text-carvao/60 bg-areia-light/60 rounded-xl">
          <p class="text-xs">Nenhuma edição futura agendada.</p>
          <button onclick="navigateToSection('edicoes')" class="text-xs text-chama font-bold underline mt-1">Cadastrar Missão</button>
        </div>
      `;
    } else {
      proximas.forEach(ed => {
        const dados = window.atosDB.getEdicaoComParticipantes(ed.id);
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3.5 bg-areia-light/70 rounded-xl border border-areia';
        div.innerHTML = `
          <div>
            <span class="text-[0.65rem] font-bold text-cacto uppercase">${ed.cidade} - ${ed.estado}</span>
            <h4 class="font-display text-lg text-carvao leading-none">${ed.nome}</h4>
            <p class="text-[0.7rem] text-carvao/60 mt-0.5">Data: ${ed.data} &bull; ${ed.status}</p>
          </div>
          <div class="text-right">
            <span class="font-display text-2xl text-chama leading-none">${dados ? dados.totais.totalGeral : 0}</span>
            <span class="text-[0.65rem] text-carvao/60 block">Inscritos</span>
          </div>
        `;
        listaEd.appendChild(div);
      });
    }
  }

  // Últimos Voluntários
  const listaVol = document.getElementById('dash-voluntarios-lista');
  if (listaVol) {
    listaVol.innerHTML = '';
    const ultimos = pessoas.slice(-4).reverse();
    if (ultimos.length === 0) {
      listaVol.innerHTML = `<p class="text-xs text-carvao/60 py-4 text-center">Nenhum voluntário cadastrado ainda.</p>`;
    } else {
      ultimos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'py-2.5 flex items-center justify-between text-xs';
        div.innerHTML = `
          <div>
            <p class="font-semibold text-carvao">${p.nome}</p>
            <span class="text-[0.68rem] text-carvao/60">${p.cidade} - ${p.estado} &bull; ${p.whatsapp}</span>
          </div>
          <span class="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-cacto/15 text-cacto-dark">
            ${p.profissional ? 'Profissional' : 'Voluntário'}
          </span>
        `;
        listaVol.appendChild(div);
      });
    }
  }

  // Agenda em Breve
  const listaAg = document.getElementById('dash-agenda-lista');
  if (listaAg) {
    listaAg.innerHTML = '';
    const proximosEv = agenda.filter(a => a.status !== 'Cancelado').slice(0, 3);
    if (proximosEv.length === 0) {
      listaAg.innerHTML = `<p class="text-xs text-carvao/60 py-3 text-center">Nenhum evento futuro na agenda.</p>`;
    } else {
      proximosEv.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-white rounded-xl border border-areia flex items-center justify-between text-xs';
        div.innerHTML = `
          <div>
            <span class="text-[0.65rem] font-bold text-chama uppercase">${ev.categoria}</span>
            <p class="font-semibold text-carvao text-xs">${ev.titulo}</p>
            <span class="text-[0.68rem] text-carvao/60">${ev.data} às ${ev.horario}</span>
          </div>
          <span class="text-xs font-bold text-cacto">✓</span>
        `;
        listaAg.appendChild(div);
      });
    }
  }

  // Atividades Recentes
  const listaLogs = document.getElementById('dash-atividades-lista');
  if (listaLogs) {
    listaLogs.innerHTML = '';
    const ultimosLogs = logs.slice(0, 4);
    if (ultimosLogs.length === 0) {
      listaLogs.innerHTML = `<p class="text-xs text-carvao/60 py-2 text-center">Nenhuma atividade registrada.</p>`;
    } else {
      ultimosLogs.forEach(l => {
        const timeFmt = new Date(l.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const div = document.createElement('div');
        div.className = 'p-2.5 bg-areia-light/50 rounded-xl border border-areia/60 flex items-start justify-between text-[0.72rem]';
        div.innerHTML = `
          <div>
            <strong class="text-carvao">${l.usuario}:</strong>
            <span class="text-carvao/80">${l.item}</span>
          </div>
          <span class="text-carvao/40 text-[0.65rem] ml-2 flex-shrink-0">${timeFmt}</span>
        `;
        listaLogs.appendChild(div);
      });
    }
  }

  if (window.lucide) lucide.createIcons();
}

/* --------------------------------------------------------------------------
   5. SEÇÃO EDIÇÕES E MISSÕES
   -------------------------------------------------------------------------- */
function initEdicoesModule() {
  const btnNova = document.getElementById('btn-nova-edicao');
  const modal = document.getElementById('modal-edicao');
  const btnFechar = document.getElementById('modal-edicao-fechar');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const form = document.getElementById('form-edicao');

  if (btnNova) {
    btnNova.addEventListener('click', () => abrirModalEdicao());
  }

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (form) form.reset();
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edicao-id').value;

      const dados = {
        nome: document.getElementById('edicao-nome').value,
        numero: document.getElementById('edicao-numero').value,
        pais: document.getElementById('edicao-pais') ? document.getElementById('edicao-pais').value : 'Brasil',
        estado: document.getElementById('edicao-estado').value,
        cidade: document.getElementById('edicao-cidade').value,
        data: document.getElementById('edicao-data').value,
        horario: document.getElementById('edicao-horario').value,
        local: document.getElementById('edicao-local').value,
        endereco: document.getElementById('edicao-endereco') ? document.getElementById('edicao-endereco').value : '',
        limite_participantes: document.getElementById('edicao-limite').value,
        descricao: document.getElementById('edicao-descricao').value,
        status: document.getElementById('edicao-status').value,
        imagem: document.getElementById('edicao-imagem').value,
        
        // Participação & Inscrição
        tem_inscricao: document.getElementById('edicao-tem-inscricao') ? document.getElementById('edicao-tem-inscricao').checked : true,
        inscricoes_abertas: document.getElementById('edicao-inscricoes-abertas').checked,
        destaque: document.getElementById('edicao-destaque').checked,
        link_grupo: document.getElementById('edicao-link-grupo') ? document.getElementById('edicao-link-grupo').value : '',

        // Pagamento
        tem_pagamento: document.getElementById('edicao-tem-pagamento') ? document.getElementById('edicao-tem-pagamento').checked : false,
        valor_inscricao: document.getElementById('edicao-valor-inscricao') ? document.getElementById('edicao-valor-inscricao').value : 0,
        chave_pix: document.getElementById('edicao-chave-pix') ? document.getElementById('edicao-chave-pix').value : '',
        favorecido_pix: document.getElementById('edicao-favorecido-pix') ? document.getElementById('edicao-favorecido-pix').value : '',
        exige_comprovante: document.getElementById('edicao-exige-comprovante') ? document.getElementById('edicao-exige-comprovante').checked : true,

        // Camisa
        tem_camisa: document.getElementById('edicao-tem-camisa') ? document.getElementById('edicao-tem-camisa').checked : false,
        nome_camisa: document.getElementById('edicao-nome-camisa') ? document.getElementById('edicao-nome-camisa').value : '',
        valor_camisa: document.getElementById('edicao-valor-camisa') ? document.getElementById('edicao-valor-camisa').value : 0,
        tamanhos_camisa: document.getElementById('edicao-tamanhos-camisa') ? document.getElementById('edicao-tamanhos-camisa').value : 'P, M, G, GG'
      };

      try {
        if (id) {
          window.atosDB.updateEdicao(id, dados);
          showToast('Edição Atualizada', `A missão "${dados.nome}" foi atualizada com sucesso.`, 'check', 'cacto');
        } else {
          window.atosDB.createEdicao(dados);
          showToast('Edição Criada', `A missão "${dados.nome}" foi cadastrada e publicada.`, 'check', 'cacto');
        }
        fechar();
        renderEdicoes();
        renderDashboard();
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function abrirModalEdicao(edicao = null) {
  const modal = document.getElementById('modal-edicao');
  const titulo = document.getElementById('modal-edicao-titulo');
  const form = document.getElementById('form-edicao');

  if (!modal) return;

  if (edicao) {
    titulo.textContent = 'EDITAR MISSÃO';
    document.getElementById('edicao-id').value = edicao.id;
    document.getElementById('edicao-nome').value = edicao.nome || '';
    document.getElementById('edicao-numero').value = edicao.numero || '';
    if (document.getElementById('edicao-pais')) document.getElementById('edicao-pais').value = edicao.pais || 'Brasil';
    document.getElementById('edicao-cidade').value = edicao.cidade || '';
    document.getElementById('edicao-estado').value = edicao.estado || 'PB';
    document.getElementById('edicao-data').value = edicao.data || '';
    document.getElementById('edicao-horario').value = edicao.horario || '';
    document.getElementById('edicao-local').value = edicao.local || '';
    if (document.getElementById('edicao-endereco')) document.getElementById('edicao-endereco').value = edicao.endereco || '';
    document.getElementById('edicao-limite').value = edicao.limite_participantes || '';
    document.getElementById('edicao-descricao').value = edicao.descricao || '';
    document.getElementById('edicao-status').value = edicao.status || 'Inscrições Abertas';
    document.getElementById('edicao-imagem').value = edicao.imagem || 'assets/images/casal_1.jpg';
    
    if (document.getElementById('edicao-tem-inscricao')) document.getElementById('edicao-tem-inscricao').checked = edicao.tem_inscricao !== undefined ? Boolean(edicao.tem_inscricao) : true;
    document.getElementById('edicao-inscricoes-abertas').checked = Boolean(edicao.inscricoes_abertas);
    document.getElementById('edicao-destaque').checked = Boolean(edicao.destaque);
    if (document.getElementById('edicao-link-grupo')) document.getElementById('edicao-link-grupo').value = edicao.link_grupo || '';

    if (document.getElementById('edicao-tem-pagamento')) document.getElementById('edicao-tem-pagamento').checked = Boolean(edicao.tem_pagamento);
    if (document.getElementById('edicao-valor-inscricao')) document.getElementById('edicao-valor-inscricao').value = edicao.valor_inscricao || '';
    if (document.getElementById('edicao-chave-pix')) document.getElementById('edicao-chave-pix').value = edicao.chave_pix || '';
    if (document.getElementById('edicao-favorecido-pix')) document.getElementById('edicao-favorecido-pix').value = edicao.favorecido_pix || '';
    if (document.getElementById('edicao-exige-comprovante')) document.getElementById('edicao-exige-comprovante').checked = edicao.exige_comprovante !== undefined ? Boolean(edicao.exige_comprovante) : true;

    if (document.getElementById('edicao-tem-camisa')) document.getElementById('edicao-tem-camisa').checked = Boolean(edicao.tem_camisa);
    if (document.getElementById('edicao-nome-camisa')) document.getElementById('edicao-nome-camisa').value = edicao.nome_camisa || '';
    if (document.getElementById('edicao-valor-camisa')) document.getElementById('edicao-valor-camisa').value = edicao.valor_camisa || '';
    if (document.getElementById('edicao-tamanhos-camisa')) document.getElementById('edicao-tamanhos-camisa').value = edicao.tamanhos_camisa || 'P, M, G, GG, XG';

  } else {
    titulo.textContent = 'CRIAR NOVA MISSÃO';
    form.reset();
    document.getElementById('edicao-id').value = '';
    if (document.getElementById('edicao-pais')) document.getElementById('edicao-pais').value = 'Brasil';
    document.getElementById('edicao-estado').value = 'PB';
    document.getElementById('edicao-imagem').value = 'assets/images/casal_1.jpg';
    if (document.getElementById('edicao-tem-inscricao')) document.getElementById('edicao-tem-inscricao').checked = true;
    document.getElementById('edicao-inscricoes-abertas').checked = true;
    document.getElementById('edicao-destaque').checked = false;
    if (document.getElementById('edicao-tem-pagamento')) document.getElementById('edicao-tem-pagamento').checked = false;
    if (document.getElementById('edicao-tem-camisa')) document.getElementById('edicao-tem-camisa').checked = false;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function renderEdicoes() {
  const grid = document.getElementById('admin-edicoes-grid');
  if (!grid) return;

  const edicoes = window.atosDB.getEdicoes();
  grid.innerHTML = '';

  if (edicoes.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-10 text-center bg-white rounded-2xl border border-areia text-carvao/60 space-y-2">
        <i data-lucide="calendar-x" class="w-8 h-8 mx-auto text-carvao/30"></i>
        <p class="font-semibold text-sm">Nenhuma edição cadastrada.</p>
        <p class="text-xs text-carvao/50">Comece cadastrando a primeira edição do Projeto ATOS.</p>
        <button onclick="abrirModalEdicao()" class="text-xs bg-chama text-white font-bold px-4 py-2 rounded-xl mt-2">Criar Edição</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  edicoes.forEach(ed => {
    const dados = window.atosDB.getEdicaoComParticipantes(ed.id);
    const totais = dados ? dados.totais : { interessados: 0, confirmados: 0, totalGeral: 0 };

    const card = document.createElement('div');
    card.className = 'admin-card p-5 flex flex-col justify-between space-y-4';
    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[0.68rem] font-bold uppercase tracking-wider text-cacto bg-cacto/10 px-2.5 py-0.5 rounded-full">
            📍 ${ed.cidade} - ${ed.estado}
          </span>
          <span class="text-[0.68rem] font-semibold px-2 py-0.5 rounded-full ${
            ed.status === 'Inscrições Abertas' ? 'bg-chama/15 text-chama-dark' :
            ed.status === 'Em Confirmação' ? 'bg-blue-100 text-blue-700' :
            ed.status === 'Concluída' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }">
            ${ed.status}
          </span>
        </div>

        <div>
          <h3 class="font-display text-2xl text-carvao leading-tight">${ed.nome}</h3>
          <p class="text-xs text-carvao/60 mt-1 flex items-center gap-1.5">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-chama"></i>
            <span>${ed.data} &bull; ${ed.horario || 'Horário a definir'}</span>
          </p>
        </div>

        <p class="text-xs text-carvao/75 line-clamp-2 leading-relaxed">
          ${ed.descricao || 'Sem descrição cadastrada.'}
        </p>

        <!-- Indicadores de Inscritos -->
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-areia/50 text-center">
          <div class="bg-areia-light/80 p-2 rounded-xl border border-areia/60">
            <span class="text-[0.65rem] text-chama font-bold uppercase block">Interessados</span>
            <span class="font-display text-xl text-carvao">${totais.interessados}</span>
          </div>
          <div class="bg-areia-light/80 p-2 rounded-xl border border-areia/60">
            <span class="text-[0.65rem] text-cacto font-bold uppercase block">Confirmados</span>
            <span class="font-display text-xl text-carvao">${totais.confirmados}</span>
          </div>
        </div>
      </div>

      <!-- Ações do Card -->
      <div class="pt-3 border-t border-areia/60 flex items-center justify-between gap-2">
        <button type="button" class="btn-ver-participantes-card text-xs font-bold text-chama hover:underline flex items-center gap-1" data-id="${ed.id}">
          <i data-lucide="users" class="w-3.5 h-3.5"></i>
          <span>Inscritos (${totais.totalGeral})</span>
        </button>

        <div class="flex items-center gap-1">
          <button type="button" class="btn-duplicar-edicao p-1.5 text-carvao/60 hover:text-chama rounded-lg hover:bg-areia transition-colors" data-id="${ed.id}" title="Duplicar Missão">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>
          <button type="button" class="btn-editar-edicao p-1.5 text-carvao/60 hover:text-carvao rounded-lg hover:bg-areia transition-colors" data-id="${ed.id}" title="Editar Missão">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button type="button" class="btn-excluir-edicao p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors" data-id="${ed.id}" title="Excluir Missão">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Eventos de clique
  grid.querySelectorAll('.btn-ver-participantes-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      navigateToSection('participantes');
      const sel = document.getElementById('select-edicao-participantes');
      if (sel) {
        sel.value = id;
        renderTabelaParticipantes(id);
      }
    });
  });

  grid.querySelectorAll('.btn-duplicar-edicao').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const clone = window.atosDB.duplicarEdicao(id);
      renderEdicoes();
      showToast('Missão Duplicada', `Cópia criada como rascunho: "${clone.nome}".`, 'copy', 'chama');
    });
  });

  grid.querySelectorAll('.btn-editar-edicao').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const edicao = window.atosDB.getEdicaoById(id);
      if (edicao) abrirModalEdicao(edicao);
    });
  });

  grid.querySelectorAll('.btn-excluir-edicao').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const ed = window.atosDB.getEdicaoById(id);
      if (confirm(`Tem certeza que deseja excluir a edição "${ed ? ed.nome : ''}"? Todas as inscrições vinculadas também serão removidas.`)) {
        window.atosDB.deleteEdicao(id);
        renderEdicoes();
        renderDashboard();
        showToast('Edição Excluída', 'A missão foi removida com sucesso.', 'trash', 'chama');
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

/* --------------------------------------------------------------------------
   6. SEÇÃO AGENDA
   -------------------------------------------------------------------------- */
function initAgendaModule() {
  const btnNovo = document.getElementById('btn-novo-evento');
  const modal = document.getElementById('modal-agenda');
  const btnFechar = document.getElementById('modal-agenda-fechar');
  const btnCancelar = document.getElementById('btn-cancelar-agenda');
  const form = document.getElementById('form-agenda');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('agenda-id').value = '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('agenda-id').value;
      const dados = {
        titulo: document.getElementById('agenda-titulo').value,
        data: document.getElementById('agenda-data').value,
        horario: document.getElementById('agenda-horario').value,
        categoria: document.getElementById('agenda-categoria').value,
        status: document.getElementById('agenda-status').value,
        local: document.getElementById('agenda-local').value,
        responsavel: document.getElementById('agenda-responsavel').value,
        descricao: document.getElementById('agenda-descricao').value
      };

      if (id) {
        window.atosDB.updateAgendaItem(id, dados);
        showToast('Evento Atualizado', 'O compromisso da agenda foi atualizado.', 'check', 'cacto');
      } else {
        window.atosDB.createAgendaItem(dados);
        showToast('Evento Criado', 'Novo compromisso publicado na agenda.', 'check', 'cacto');
      }
      fechar();
      renderAgenda();
      renderDashboard();
    });
  }
}

function renderAgenda() {
  const tbody = document.getElementById('tabela-agenda-body');
  if (!tbody) return;

  const agenda = window.atosDB.getAgenda();
  tbody.innerHTML = '';

  if (agenda.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-xs text-carvao/60">Nenhum evento cadastrado na agenda.</td></tr>`;
    return;
  }

  agenda.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-areia/20 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3 font-semibold text-carvao">
        ${item.data} &bull; <span class="text-cacto font-normal">${item.horario}</span>
      </td>
      <td class="px-4 py-3">
        <p class="font-bold text-carvao text-xs">${item.titulo}</p>
        <span class="text-[0.65rem] uppercase font-bold text-chama bg-chama/10 px-2 py-0.5 rounded-full">${item.categoria}</span>
      </td>
      <td class="px-4 py-3 text-xs text-carvao/70">${item.local || '-'}</td>
      <td class="px-4 py-3 text-xs text-carvao/70">${item.responsavel || '-'}</td>
      <td class="px-4 py-3">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${item.status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
          ${item.status}
        </span>
      </td>
      <td class="px-4 py-3 text-right">
        <button class="btn-excluir-agenda text-red-500 hover:text-red-700 p-1" data-id="${item.id}">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-excluir-agenda').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Deseja excluir este compromisso da agenda?')) {
        window.atosDB.deleteAgendaItem(id);
        renderAgenda();
        renderDashboard();
        showToast('Agenda', 'Compromisso removido.', 'trash', 'chama');
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

/* --------------------------------------------------------------------------
   7. SEÇÃO VOLUNTÁRIOS
   -------------------------------------------------------------------------- */
function initVoluntariosModule() {
  const termoInput = document.getElementById('filtro-termo');
  const cidadeSelect = document.getElementById('filtro-cidade');
  const areaSelect = document.getElementById('filtro-area');
  const btnLimpar = document.getElementById('btn-limpar-filtros');
  const btnExportar = document.getElementById('btn-exportar-voluntarios');

  if (termoInput) termoInput.addEventListener('input', renderVoluntarios);
  if (cidadeSelect) cidadeSelect.addEventListener('change', renderVoluntarios);
  if (areaSelect) areaSelect.addEventListener('change', renderVoluntarios);

  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      if (termoInput) termoInput.value = '';
      if (cidadeSelect) cidadeSelect.value = '';
      if (areaSelect) areaSelect.value = '';
      renderVoluntarios();
    });
  }

  if (btnExportar) {
    btnExportar.addEventListener('click', exportarVoluntariosCSV);
  }
}

function popularFiltroCidades(pessoas) {
  const select = document.getElementById('filtro-cidade');
  if (!select) return;

  const valorAtual = select.value;
  const cidades = [...new Set(pessoas.map(p => p.cidade).filter(Boolean))].sort();

  select.innerHTML = '<option value="">Todas as Cidades</option>';
  cidades.forEach(cid => {
    const opt = document.createElement('option');
    opt.value = cid;
    opt.textContent = cid;
    if (cid === valorAtual) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderVoluntarios() {
  const tbody = document.getElementById('tabela-voluntarios-body');
  const emptyState = document.getElementById('voluntarios-empty-state');
  const contagemEl = document.getElementById('contagem-voluntarios-filtrados');
  if (!tbody) return;

  const pessoas = window.atosDB.getPessoas();
  popularFiltroCidades(pessoas);

  const termo = (document.getElementById('filtro-termo')?.value || '').toLowerCase().trim();
  const cidade = document.getElementById('filtro-cidade')?.value || '';
  const area = document.getElementById('filtro-area')?.value || '';

  const filtrados = pessoas.filter(p => {
    const matchTermo = !termo ||
      (p.nome && p.nome.toLowerCase().includes(termo)) ||
      (p.whatsapp && p.whatsapp.includes(termo)) ||
      (p.email && p.email.toLowerCase().includes(termo));

    const matchCidade = !cidade || p.cidade === cidade;

    let matchArea = true;
    if (area === 'Voluntário Geral') {
      matchArea = Boolean(p.voluntario);
    } else if (area) {
      matchArea = (p.profissoes_areas || []).some(pr => {
        const cat = Object.values(window.PROFISSOES_CATEGORIAS).find(c => c.nome === area);
        return cat && cat.opcoes.includes(pr);
      }) || (p.outra_profissao && p.outra_profissao.toLowerCase().includes(area.toLowerCase()));
    }

    return matchTermo && matchCidade && matchArea;
  });

  if (contagemEl) {
    contagemEl.textContent = `Mostrando ${filtrados.length} de ${pessoas.length} voluntários cadastrados`;
  }

  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  } else {
    if (emptyState) emptyState.classList.add('hidden');
  }

  filtrados.forEach(p => {
    const cleanWhats = (p.whatsapp || '').replace(/\D/g, '');
    const dataCad = p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '-';

    let profText = (p.profissoes_areas && p.profissoes_areas.length > 0)
      ? p.profissoes_areas.join(', ')
      : (p.outra_profissao || (p.voluntario ? 'Voluntário Geral' : 'Geral'));

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-areia/20 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3.5">
        <span class="font-semibold text-carvao block">${p.nome}</span>
        <span class="text-[0.7rem] text-carvao/50 block">Cadastrado em: ${dataCad}</span>
      </td>
      <td class="px-4 py-3.5">
        <a href="https://wa.me/55${cleanWhats}" target="_blank" class="text-cacto font-semibold hover:underline inline-flex items-center gap-1">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>${p.whatsapp}</span>
        </a>
        ${p.email ? `<span class="text-[0.68rem] text-carvao/60 block">${p.email}</span>` : ''}
      </td>
      <td class="px-4 py-3.5">
        <span class="text-carvao">${p.cidade} - ${p.estado}</span>
      </td>
      <td class="px-4 py-3.5 max-w-xs truncate" title="${profText}">
        <span class="text-xs text-carvao/80 font-medium">${profText}</span>
      </td>
      <td class="px-4 py-3.5">
        <span class="text-[0.68rem] font-bold px-2 py-0.5 rounded-full ${p.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
          ${p.status || 'Ativo'}
        </span>
      </td>
      <td class="px-4 py-3.5 text-right">
        <button type="button" class="btn-excluir-voluntario p-1 text-red-500 hover:text-red-700" data-id="${p.id}" title="Excluir Voluntário">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-excluir-voluntario').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const p = window.atosDB.getPessoaById(id);
      if (confirm(`Deseja realmente remover o voluntário "${p ? p.nome : ''}"?`)) {
        window.atosDB.deletePessoa(id);
        renderVoluntarios();
        renderDashboard();
        showToast('Voluntário Removido', 'O cadastro foi excluído com sucesso.', 'trash', 'chama');
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

function exportarVoluntariosCSV() {
  const pessoas = window.atosDB.getPessoas();
  if (pessoas.length === 0) {
    alert('Nenhum voluntário para exportar.');
    return;
  }

  let csv = 'Nome;WhatsApp;Email;Cidade;Estado;Data Nascimento;Profissional;Profissoes;Outra Profissao;Voluntario;Status;Data Cadastro\n';
  pessoas.forEach(p => {
    const profs = (p.profissoes_areas || []).join(', ');
    csv += `"${p.nome}";"${p.whatsapp}";"${p.email || ''}";"${p.cidade}";"${p.estado}";"${p.data_nascimento || ''}";"${p.profissional ? 'Sim' : 'Não'}";"${profs}";"${p.outra_profissao || ''}";"${p.voluntario ? 'Sim' : 'Não'}";"${p.status || 'Ativo'}";"${p.criado_em || ''}"\n`;
  });

  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `voluntarios_projeto_atos_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* --------------------------------------------------------------------------
   8. SEÇÃO PARTICIPANTES POR EDIÇÃO
   -------------------------------------------------------------------------- */
function initParticipantesModule() {
  const selectEd = document.getElementById('select-edicao-participantes');
  const btnExportar = document.getElementById('btn-exportar-participantes');

  if (selectEd) {
    selectEd.addEventListener('change', () => {
      renderTabelaParticipantes(selectEd.value);
    });
  }

  if (btnExportar && selectEd) {
    btnExportar.addEventListener('click', () => {
      exportarParticipantesCSV(selectEd.value);
    });
  }
}

function renderParticipantesSelect() {
  const select = document.getElementById('select-edicao-participantes');
  if (!select) return;

  const edicoes = window.atosDB.getEdicoes();
  select.innerHTML = '';

  if (edicoes.length === 0) {
    select.innerHTML = '<option value="">Nenhuma edição cadastrada</option>';
    renderTabelaParticipantes('');
    return;
  }

  edicoes.forEach(ed => {
    const opt = document.createElement('option');
    opt.value = ed.id;
    opt.textContent = `${ed.nome} (${ed.cidade} - ${ed.estado} &bull; ${ed.data})`;
    select.appendChild(opt);
  });

  renderTabelaParticipantes(select.value);
}

function renderTabelaParticipantes(edicaoId) {
  const tbody = document.getElementById('tabela-participantes-body');
  const emptyState = document.getElementById('participantes-empty-state');
  const metricaTotal = document.getElementById('metrica-total');
  const metricaInteresse = document.getElementById('metrica-interessados');
  const metricaConfirmados = document.getElementById('metrica-confirmados');
  const metricaConcluidos = document.getElementById('metrica-concluidos');

  if (!tbody) return;

  if (!edicaoId) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  const dados = window.atosDB.getEdicaoComParticipantes(edicaoId);
  const inscricoes = window.atosDB.getInscricoes(edicaoId);
  if (!dados) return;

  const totaisInscricoes = inscricoes.length;
  const confirmadosInscricoes = inscricoes.filter(i => i.status_inscricao === 'Confirmada').length;
  const analiseInscricoes = inscricoes.filter(i => i.status_inscricao === 'Em Análise' || i.status_inscricao === 'Pendente').length;

  const totalGeral = dados.totais.totalGeral + totaisInscricoes;
  const totalConfirmados = dados.totais.confirmados + confirmadosInscricoes;
  const totalInteressados = dados.totais.interessados + analiseInscricoes;

  if (metricaTotal) metricaTotal.textContent = totalGeral;
  if (metricaInteresse) metricaInteresse.textContent = totalInteressados;
  if (metricaConfirmados) metricaConfirmados.textContent = totalConfirmados;
  if (metricaConcluidos) metricaConcluidos.textContent = dados.totais.concluidos;

  tbody.innerHTML = '';

  if (dados.participantes.length === 0 && inscricoes.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  } else {
    if (emptyState) emptyState.classList.add('hidden');
  }

  // 1. Renderiza Inscrições Oficiais (Comprovantes & Pagamento)
  inscricoes.forEach(insc => {
    const cleanWhats = (insc.whatsapp || '').replace(/\D/g, '');
    const dataInsc = insc.criado_em ? new Date(insc.criado_em).toLocaleDateString('pt-BR') : '-';

    let camisaInfo = insc.quer_camisa ? ` &bull; Camisa: ${insc.tamanho_camisa || 'Sim'}` : '';

    const tr = document.createElement('tr');
    tr.className = 'bg-chama/5 hover:bg-chama/10 transition-colors border-l-4 border-chama';
    tr.innerHTML = `
      <td class="px-4 py-3.5">
        <div class="flex items-center gap-2">
          <span class="text-[0.65rem] uppercase font-bold bg-chama text-white px-2 py-0.5 rounded-full">Inscrição</span>
          <span class="font-bold text-carvao block">${insc.nome}</span>
        </div>
        <span class="text-[0.7rem] text-carvao/60 block mt-0.5">${insc.email || 'Sem e-mail'} &bull; Inscrito em: ${dataInsc}</span>
      </td>
      <td class="px-4 py-3.5">
        <a href="https://wa.me/55${cleanWhats}" target="_blank" class="text-cacto font-semibold hover:underline inline-flex items-center gap-1">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>${insc.whatsapp}</span>
        </a>
      </td>
      <td class="px-4 py-3.5">
        <span class="text-carvao">${insc.cidade} - ${insc.estado}</span>
      </td>
      <td class="px-4 py-3.5">
        <span class="text-xs text-carvao/80 font-medium">${insc.profissao || 'Voluntário'}${camisaInfo}</span>
      </td>
      <td class="px-4 py-3.5">
        <div class="space-y-1">
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full block text-center ${
            insc.status_inscricao === 'Confirmada' ? 'bg-green-100 text-green-800' :
            insc.status_inscricao === 'Em Análise' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }">
            ${insc.status_inscricao}
          </span>
          <span class="text-[0.65rem] text-carvao/60 block text-center">PIX: ${insc.status_pagamento}</span>
          ${(() => {
            const emailLog = window.AtosEmailService ? window.AtosEmailService.getUltimoLogByParticipacao(insc.id) : null;
            if (emailLog && emailLog.status === 'enviado') {
              const horaFmt = new Date(emailLog.enviado_em).toLocaleString('pt-BR');
              return `<span class="inline-flex items-center justify-center gap-1 text-[0.62rem] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold w-full text-center" title="E-mail enviado em ${horaFmt}"><i data-lucide="mail-check" class="w-3 h-3 text-emerald-600"></i> E-mail enviado</span>`;
            } else if (emailLog && emailLog.status === 'falha') {
              return `<span class="inline-flex items-center justify-center gap-1 text-[0.62rem] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold w-full text-center" title="${emailLog.erro}"><i data-lucide="mail-x" class="w-3 h-3 text-red-600"></i> E-mail falhou</span>`;
            } else {
              return `<span class="inline-flex items-center justify-center gap-1 text-[0.62rem] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold w-full text-center" title="E-mail de confirmação pendente"><i data-lucide="mail" class="w-3 h-3 text-amber-600"></i> E-mail pendente</span>`;
            }
          })()}
        </div>
      </td>
      <td class="px-4 py-3.5 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button type="button" class="btn-ver-comprovante text-xs bg-white hover:bg-areia text-carvao border border-areia px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1" data-id="${insc.id}" title="Verificar dados, comprovante e confirmar com e-mail">
            <i data-lucide="${insc.comprovante ? 'file-check' : 'user-check'}" class="w-3.5 h-3.5 text-chama"></i>
            <span>${insc.comprovante ? 'Comprovante' : 'Verificar'}</span>
          </button>
          ${insc.status_inscricao !== 'Confirmada' ? `
          <button type="button" class="btn-aprovar-inscricao-rapido text-xs bg-cacto hover:bg-cacto-dark text-white px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1" data-id="${insc.id}" title="Abrir confirmação e envio de e-mail">
            <i data-lucide="mail-check" class="w-3.5 h-3.5"></i>
            <span>Confirmar</span>
          </button>
          ` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // 2. Renderiza Manifestações de Interesse gerais
  dados.participantes.forEach(part => {
    const cleanWhats = (part.whatsapp || '').replace(/\D/g, '');
    const dataInt = part.manifestado_em ? new Date(part.manifestado_em).toLocaleDateString('pt-BR') : '-';

    let profText = (part.profissoes_areas && part.profissoes_areas.length > 0)
      ? part.profissoes_areas.join(', ')
      : (part.outra_profissao || (part.voluntario ? 'Voluntário Geral' : 'Geral'));

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-areia/20 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3.5">
        <span class="font-semibold text-carvao block">${part.nome}</span>
        <span class="text-[0.7rem] text-carvao/50 block">Interesse em: ${dataInt}</span>
      </td>
      <td class="px-4 py-3.5">
        <a href="https://wa.me/55${cleanWhats}" target="_blank" class="text-cacto font-semibold hover:underline inline-flex items-center gap-1">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>${part.whatsapp}</span>
        </a>
      </td>
      <td class="px-4 py-3.5">
        <span class="text-carvao">${part.cidade} - ${part.estado}</span>
      </td>
      <td class="px-4 py-3.5 max-w-xs truncate" title="${profText}">
        <span class="text-xs text-carvao/80 font-medium">${profText}</span>
      </td>
      <td class="px-4 py-3.5">
        <span class="text-xs font-bold px-2.5 py-1 rounded-full ${
          part.status === window.STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA ? 'bg-green-100 text-green-800' :
          part.status === window.STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO ? 'bg-yellow-100 text-yellow-800' :
          part.status === window.STATUS_PARTICIPACAO.PARTICIPACAO_CONCLUIDA ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
        }">
          ${part.status}
        </span>
      </td>
      <td class="px-4 py-3.5 text-right">
        <select class="select-alterar-status text-xs bg-white border border-areia rounded-lg px-2 py-1.5 focus:outline-none focus:border-chama" data-part-id="${part.participacao_id}">
          <option value="${window.STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO}" ${part.status === window.STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO ? 'selected' : ''}>Interesse manifestado</option>
          <option value="${window.STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA}" ${part.status === window.STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA ? 'selected' : ''}>Presença confirmada</option>
          <option value="${window.STATUS_PARTICIPACAO.PARTICIPACAO_CONCLUIDA}" ${part.status === window.STATUS_PARTICIPACAO.PARTICIPACAO_CONCLUIDA ? 'selected' : ''}>Participação concluída</option>
          <option value="${window.STATUS_PARTICIPACAO.CANCELADO}" ${part.status === window.STATUS_PARTICIPACAO.CANCELADO ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Eventos de comprovante e aprovação rápida
  tbody.querySelectorAll('.btn-ver-comprovante').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      abrirModalComprovante(id);
    });
  });

  tbody.querySelectorAll('.btn-aprovar-inscricao-rapido').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      abrirModalComprovante(id);
    });
  });

  tbody.querySelectorAll('.select-alterar-status').forEach(sel => {
    sel.addEventListener('change', () => {
      const partId = sel.getAttribute('data-part-id');
      const novoStatus = sel.value;
      window.atosDB.updateStatusParticipacao(partId, novoStatus);
      renderTabelaParticipantes(edicaoId);
      renderDashboard();
    });
  });

  if (window.lucide) lucide.createIcons();
}

function exportarParticipantesCSV(edicaoId) {
  if (!edicaoId) return;
  const dados = window.atosDB.getEdicaoComParticipantes(edicaoId);
  if (!dados || dados.participantes.length === 0) {
    alert('Nenhum participante para exportar nesta edição.');
    return;
  }

  let csv = `Edição: ${dados.nome} (${dados.cidade} - ${dados.estado})\n`;
  csv += 'Nome;WhatsApp;Email;Cidade;Estado;Profissoes;Status;Data Interesse;Data Confirmacao\n';

  dados.participantes.forEach(p => {
    const profs = (p.profissoes_areas || []).join(', ');
    csv += `"${p.nome}";"${p.whatsapp}";"${p.email || ''}";"${p.cidade}";"${p.estado}";"${profs}";"${p.status}";"${p.manifestado_em || ''}";"${p.confirmado_em || ''}"\n`;
  });

  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `participantes_${dados.cidade.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* --------------------------------------------------------------------------
   9. SEÇÃO PARCEIROS
   -------------------------------------------------------------------------- */
function initParceirosModule() {
  const btnNovo = document.getElementById('btn-novo-parceiro');
  const modal = document.getElementById('modal-parceiro');
  const btnFechar = document.getElementById('modal-parceiro-fechar');
  const btnCancelar = document.getElementById('btn-cancelar-parceiro');
  const form = document.getElementById('form-parceiro');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('parceiro-id').value = '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('parceiro-id').value;
      const dados = {
        nome: document.getElementById('parceiro-nome').value,
        categoria: document.getElementById('parceiro-categoria').value,
        descricao: document.getElementById('parceiro-descricao').value,
        instagram: document.getElementById('parceiro-instagram').value,
        status: document.getElementById('parceiro-status').value
      };

      if (id) {
        window.atosDB.updateParceiro(id, dados);
        showToast('Parceiro Atualizado', 'Os dados do parceiro foram atualizados.', 'check', 'cacto');
      } else {
        window.atosDB.createParceiro(dados);
        showToast('Parceiro Cadastrado', 'Novo parceiro adicionado ao sistema.', 'check', 'cacto');
      }
      fechar();
      renderParceiros();
      renderDashboard();
    });
  }
}

function renderParceiros() {
  const grid = document.getElementById('grid-parceiros');
  if (!grid) return;

  const parceiros = window.atosDB.getParceiros();
  grid.innerHTML = '';

  if (parceiros.length === 0) {
    grid.innerHTML = `<div class="col-span-full p-8 text-center bg-white rounded-2xl border text-xs text-carvao/60">Nenhum parceiro cadastrado.</div>`;
    return;
  }

  parceiros.forEach(p => {
    const card = document.createElement('div');
    card.className = 'admin-card p-5 flex flex-col justify-between space-y-3';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-[0.65rem] font-bold uppercase text-chama bg-chama/10 px-2 py-0.5 rounded-full">${p.categoria || 'Geral'}</span>
          <span class="text-xs font-semibold ${p.status === 'Ativo' ? 'text-cacto' : 'text-carvao/50'}">${p.status}</span>
        </div>
        <h4 class="font-display text-xl text-carvao">${p.nome}</h4>
        <p class="text-xs text-carvao/70 mt-1">${p.descricao || 'Sem descrição.'}</p>
        ${p.instagram ? `<p class="text-[0.7rem] text-chama mt-2 font-medium">${p.instagram}</p>` : ''}
      </div>
      <div class="pt-3 border-t border-areia flex justify-end">
        <button class="btn-excluir-parceiro text-red-500 hover:text-red-700 text-xs flex items-center gap-1" data-id="${p.id}">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>Excluir</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.btn-excluir-parceiro').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Deseja excluir este parceiro?')) {
        window.atosDB.deleteParceiro(id);
        renderParceiros();
        renderDashboard();
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

/* --------------------------------------------------------------------------
   10. SEÇÃO INDICADORES DE IMPACTO
   -------------------------------------------------------------------------- */
function initImpactoModule() {
  const btnNovo = document.getElementById('btn-novo-impacto');
  const modal = document.getElementById('modal-impacto');
  const btnFechar = document.getElementById('modal-impacto-fechar');
  const btnCancelar = document.getElementById('btn-cancelar-impacto');
  const form = document.getElementById('form-impacto');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('impacto-id').value = '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('impacto-id').value;
      const dados = {
        titulo: document.getElementById('impacto-titulo').value,
        valor: parseFloat(document.getElementById('impacto-valor').value) || 0,
        sufixo: document.getElementById('impacto-sufixo').value,
        icone: document.getElementById('impacto-icone').value,
        descricao: document.getElementById('impacto-descricao').value,
        ativo: document.getElementById('impacto-ativo').checked
      };

      if (id) {
        window.atosDB.updateImpactoItem(id, dados);
        showToast('Impacto Atualizado', 'Os novos números serão exibidos no site público.', 'check', 'cacto');
      } else {
        window.atosDB.createImpactoItem(dados);
        showToast('Impacto Criado', 'Novo indicador adicionado à página pública.', 'check', 'cacto');
      }
      fechar();
      renderImpacto();
      renderDashboard();
    });
  }
}

function renderImpacto() {
  const grid = document.getElementById('grid-impacto');
  if (!grid) return;

  const impactos = window.atosDB.getImpacto();
  grid.innerHTML = '';

  impactos.forEach(imp => {
    const card = document.createElement('div');
    card.className = 'admin-card p-5 text-center flex flex-col justify-between space-y-3';
    card.innerHTML = `
      <div>
        <div class="w-10 h-10 mx-auto rounded-xl bg-chama/10 text-chama flex items-center justify-center mb-2">
          <i data-lucide="${imp.icone || 'sparkles'}" class="w-5 h-5"></i>
        </div>
        <p class="font-display text-4xl text-carvao leading-none">${imp.valor}${imp.sufixo || ''}</p>
        <h4 class="font-bold text-xs uppercase text-carvao/80 mt-1">${imp.titulo}</h4>
        <p class="text-[0.7rem] text-carvao/60 mt-1">${imp.descricao || ''}</p>
        <span class="inline-block text-[0.65rem] font-bold px-2 py-0.5 rounded-full mt-2 ${imp.ativo ? 'bg-cacto/15 text-cacto' : 'bg-gray-100 text-gray-500'}">
          ${imp.ativo ? 'Ativo no Site' : 'Oculto'}
        </span>
      </div>
      <div class="pt-3 border-t border-areia flex items-center justify-center gap-2">
        <button class="btn-editar-impacto text-xs text-chama font-bold hover:underline" data-id="${imp.id}">Editar</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.btn-editar-impacto').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const imp = window.atosDB.getImpacto().find(x => x.id === id);
      if (imp) {
        document.getElementById('impacto-id').value = imp.id;
        document.getElementById('impacto-titulo').value = imp.titulo;
        document.getElementById('impacto-valor').value = imp.valor;
        document.getElementById('impacto-sufixo').value = imp.sufixo || '';
        document.getElementById('impacto-icone').value = imp.icone || 'sparkles';
        document.getElementById('impacto-descricao').value = imp.descricao || '';
        document.getElementById('impacto-ativo').checked = Boolean(imp.ativo);
        const modal = document.getElementById('modal-impacto');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

/* --------------------------------------------------------------------------
   11. SEÇÃO BIBLIOTECA DE MÍDIA
   -------------------------------------------------------------------------- */
function initMidiaModule() {
  const btnNovo = document.getElementById('btn-nova-midia');
  const modal = document.getElementById('modal-midia');
  const btnFechar = document.getElementById('modal-midia-fechar');
  const btnCancelar = document.getElementById('btn-cancelar-midia');
  const form = document.getElementById('form-midia');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('midia-id').value = '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('midia-id').value;
      const dados = {
        tipo: document.getElementById('midia-tipo').value,
        ano: document.getElementById('midia-ano').value,
        titulo: document.getElementById('midia-titulo').value,
        url: document.getElementById('midia-url').value,
        poster: document.getElementById('midia-poster').value,
        instagram_link: document.getElementById('midia-instagram').value,
        descricao: document.getElementById('midia-descricao').value,
        publicado: document.getElementById('midia-publicado').checked
      };

      if (id) {
        window.atosDB.updateMidiaItem(id, dados);
        showToast('Mídia Atualizada', 'As alterações na mídia foram salvas.', 'check', 'cacto');
      } else {
        window.atosDB.createMidiaItem(dados);
        showToast('Mídia Publicada', 'Novo item adicionado à galeria.', 'check', 'cacto');
      }
      fechar();
      renderMidia();
    });
  }
}

function renderMidia() {
  const grid = document.getElementById('grid-midia');
  if (!grid) return;

  const midias = window.atosDB.getMidia();
  grid.innerHTML = '';

  midias.forEach(m => {
    const card = document.createElement('div');
    card.className = 'admin-card overflow-hidden flex flex-col justify-between';
    card.innerHTML = `
      <div class="h-40 bg-carvao relative overflow-hidden flex items-center justify-center">
        ${m.poster ? `<img src="${m.poster}" class="w-full h-full object-cover opacity-80" />` : `<div class="text-white text-xs">Mídia</div>`}
        <span class="absolute top-2 left-2 text-[0.65rem] uppercase font-bold bg-carvao/80 text-white px-2 py-0.5 rounded-full border border-white/20">
          ${m.tipo} &bull; ${m.ano}
        </span>
      </div>
      <div class="p-4 space-y-2 flex-1">
        <h4 class="font-display text-xl text-carvao leading-tight">${m.titulo}</h4>
        <p class="text-xs text-carvao/70 line-clamp-2">${m.descricao || ''}</p>
        ${m.instagram_link ? `<a href="${m.instagram_link}" target="_blank" class="text-[0.7rem] text-chama hover:underline block truncate flex items-center gap-1"><i data-lucide="instagram" class="w-3 h-3"></i><span>${m.instagram_link}</span></a>` : ''}
      </div>
      <div class="p-3 bg-areia/20 border-t border-areia flex justify-between items-center text-xs">
        <span class="${m.publicado ? 'text-cacto' : 'text-carvao/50'} font-semibold text-[0.7rem]">${m.publicado ? 'Publicado' : 'Rascunho'}</span>
        <div class="flex items-center gap-2">
          <button class="btn-editar-midia text-carvao/60 hover:text-chama p-1 rounded-lg hover:bg-areia transition-colors" data-id="${m.id}" title="Editar Mídia">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button class="btn-excluir-midia text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors" data-id="${m.id}" title="Excluir Mídia">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Evento de edição de mídia existente
  grid.querySelectorAll('.btn-editar-midia').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const midia = window.atosDB.getMidia().find(x => x.id === id);
      if (midia) {
        document.getElementById('midia-id').value = midia.id;
        document.getElementById('midia-tipo').value = midia.tipo || 'video';
        document.getElementById('midia-ano').value = midia.ano || '2026';
        document.getElementById('midia-titulo').value = midia.titulo || '';
        document.getElementById('midia-url').value = midia.url || '';
        document.getElementById('midia-poster').value = midia.poster || '';
        document.getElementById('midia-instagram').value = midia.instagram_link || '';
        document.getElementById('midia-descricao').value = midia.descricao || '';
        document.getElementById('midia-publicado').checked = Boolean(midia.publicado);
        
        const modal = document.getElementById('modal-midia');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
      }
    });
  });

  grid.querySelectorAll('.btn-excluir-midia').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Deseja realmente excluir esta mídia da galeria?')) {
        window.atosDB.deleteMidiaItem(id);
        renderMidia();
        showToast('Mídia Removida', 'Item removido da galeria.', 'trash', 'chama');
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

/* --------------------------------------------------------------------------
   12. SEÇÃO CONTEÚDOS E NOTÍCIAS
   -------------------------------------------------------------------------- */
function initConteudosModule() {
  const btnNovo = document.getElementById('btn-novo-conteudo');
  const modal = document.getElementById('modal-conteudo');
  const btnFechar = document.getElementById('modal-conteudo-fechar');
  const btnCancelar = document.getElementById('btn-cancelar-conteudo');
  const form = document.getElementById('form-conteudo');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('conteudo-id').value = '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('conteudo-id').value;
      const dados = {
        tipo: document.getElementById('conteudo-tipo').value,
        status: document.getElementById('conteudo-status').value,
        titulo: document.getElementById('conteudo-titulo').value,
        resumo: document.getElementById('conteudo-resumo').value,
        corpo: document.getElementById('conteudo-corpo').value,
        imagem: document.getElementById('conteudo-imagem').value
      };

      if (id) {
        window.atosDB.updateConteudo(id, dados);
        showToast('Conteúdo Atualizado', 'As informações foram salvas.', 'check', 'cacto');
      } else {
        window.atosDB.createConteudo(dados);
        showToast('Conteúdo Publicado', 'Novo artigo/depoimento adicionado.', 'check', 'cacto');
      }
      fechar();
      renderConteudos();
    });
  }
}

function renderConteudos() {
  const grid = document.getElementById('grid-conteudos');
  if (!grid) return;

  const conteudos = window.atosDB.getConteudos();
  grid.innerHTML = '';

  conteudos.forEach(c => {
    const card = document.createElement('div');
    card.className = 'admin-card p-5 flex flex-col justify-between space-y-3';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-[0.65rem] font-bold uppercase text-cacto bg-cacto/10 px-2 py-0.5 rounded-full">${c.tipo}</span>
          <span class="text-xs text-carvao/50">${c.data} &bull; ${c.status}</span>
        </div>
        <h4 class="font-display text-2xl text-carvao leading-tight">${c.titulo}</h4>
        <p class="text-xs text-carvao/70 mt-1">${c.resumo || c.corpo || ''}</p>
      </div>
      <div class="pt-3 border-t border-areia flex justify-end">
        <button class="btn-excluir-conteudo text-red-500 hover:text-red-700 text-xs flex items-center gap-1" data-id="${c.id}">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>Excluir</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.btn-excluir-conteudo').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Deseja excluir este conteúdo?')) {
        window.atosDB.deleteConteudo(id);
        renderConteudos();
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}



/* --------------------------------------------------------------------------
   14. SEÇÃO USUÁRIOS E PERMISSÕES
   -------------------------------------------------------------------------- */
function initUsuariosModule() {
  const btnNovo = document.getElementById('btn-novo-usuario');
  const modal = document.getElementById('modal-usuario');
  const btnFechar = document.getElementById('modal-usuario-fechar');
  const btnCancelar = document.getElementById('btn-cancelar-usuario');
  const form = document.getElementById('form-usuario');

  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      form.reset();
      document.getElementById('usuario-id').value = '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  }

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (btnCancelar) btnCancelar.addEventListener('click', fechar);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('usuario-id').value;
      const dados = {
        nome: document.getElementById('usuario-nome').value,
        email: document.getElementById('usuario-email').value,
        role: document.getElementById('usuario-role').value,
        senha: document.getElementById('usuario-senha').value,
        ativo: document.getElementById('usuario-ativo').checked
      };

      try {
        if (id) {
          await window.atosDB.updateAdminUser(id, dados);
          showToast('Usuário Atualizado', 'As permissões foram atualizadas.', 'check', 'cacto');
        } else {
          await window.atosDB.createAdminUser(dados);
          showToast('Usuário Criado', 'Novo usuário habilitado no sistema.', 'check', 'cacto');
        }
        fechar();
        renderUsuarios();
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function renderUsuarios() {
  const tbody = document.getElementById('tabela-usuarios-body');
  if (!tbody) return;

  const users = window.atosDB.getAdminUsers();
  tbody.innerHTML = '';

  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-areia/20 transition-colors';
    tr.innerHTML = `
      <td class="px-4 py-3 font-semibold text-carvao">${u.nome}</td>
      <td class="px-4 py-3 text-xs text-carvao/70">${u.email}</td>
      <td class="px-4 py-3">
        <span class="text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
          u.role === 'Super Admin' ? 'bg-red-100 text-red-800' :
          u.role === 'Administrador' ? 'bg-chama/15 text-chama-dark' : 'bg-cacto/15 text-cacto-dark'
        }">
          ${u.role}
        </span>
      </td>
      <td class="px-4 py-3 text-xs ${u.ativo ? 'text-cacto font-bold' : 'text-carvao/40'}">
        ${u.ativo ? 'Ativo' : 'Inativo'}
      </td>
      <td class="px-4 py-3 text-right">
        <button class="btn-excluir-usuario text-red-500 hover:text-red-700 p-1" data-id="${u.id}">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-excluir-usuario').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      try {
        if (confirm('Deseja excluir este usuário administrativo?')) {
          window.atosDB.deleteAdminUser(id);
          renderUsuarios();
          showToast('Usuário', 'Usuário administrativo removido.', 'trash', 'chama');
        }
      } catch (e) {
        alert(e.message);
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

/* --------------------------------------------------------------------------
   15. SEÇÃO CONFIGURAÇÕES
   -------------------------------------------------------------------------- */
function initConfiguracoesModule() {
  const form = document.getElementById('form-configuracoes');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Dados institucionais
      const dados = {
        nome_organizacao: document.getElementById('cfg-nome') ? document.getElementById('cfg-nome').value : '',
        sede: document.getElementById('cfg-sede') ? document.getElementById('cfg-sede').value : '',
        nome_assessoria: document.getElementById('cfg-assessoria') ? document.getElementById('cfg-assessoria').value : '',
        whatsapp_assessoria: document.getElementById('cfg-whatsapp') ? document.getElementById('cfg-whatsapp').value : '',
        pix_oficial: document.getElementById('cfg-pix') ? document.getElementById('cfg-pix').value : '',
        instagram_projeto: document.getElementById('cfg-instagram') ? document.getElementById('cfg-instagram').value : '',
        email_oficial: document.getElementById('cfg-email-oficial') ? document.getElementById('cfg-email-oficial').value.trim() : 'projetoatosoficial@gmail.com'
      };
      window.atosDB.updateConfig(dados);

      // Credenciais do EmailJS: salvar via AtosEmailService para que sejam
      // persistidas como colunas planas emailjs_* no Supabase e no localStorage
      if (window.AtosEmailService) {
        const emailServiceConfig = {
          public_key:  document.getElementById('cfg-email-public-key')  ? document.getElementById('cfg-email-public-key').value.trim()  : '',
          service_id:  document.getElementById('cfg-email-service-id')  ? document.getElementById('cfg-email-service-id').value.trim()  : '',
          template_id: document.getElementById('cfg-email-template-id') ? document.getElementById('cfg-email-template-id').value.trim() : ''
        };
        window.AtosEmailService.salvarConfig(emailServiceConfig);
      }

      renderConfiguracoes();
      showToast('Configurações Salvas', 'Informações gerais e credenciais de e-mail atualizadas e sincronizadas com o banco global.', 'check', 'cacto');
    });
  }

  // Botão para testar conexão do serviço de e-mail
  const btnTestar = document.getElementById('btn-testar-servico-email');
  if (btnTestar) {
    btnTestar.addEventListener('click', async () => {
      if (!window.AtosEmailService) {
        alert('Serviço de e-mail não disponível.');
        return;
      }
      const emailOficial = document.getElementById('cfg-email-oficial') ? document.getElementById('cfg-email-oficial').value.trim() : '';
      const emailDestino = prompt('Digite o endereço de e-mail para receber o teste de confirmação:', emailOficial || 'projetoatosoficial@gmail.com');
      if (!emailDestino) return;

      btnTestar.disabled = true;
      const textoOrig = btnTestar.innerHTML;
      btnTestar.innerHTML = '<span class="animate-spin mr-1 inline-block">⏳</span> Enviando teste...';

      try {
        const res = await window.AtosEmailService.testarConexao(emailDestino);
        if (res.sucesso) {
          showToast('Teste de E-mail Concluído', `E-mail de teste enviado com sucesso para ${emailDestino}!`, 'mail-check', 'cacto');
        } else {
          showToast('Falha no Teste de E-mail', res.erro, 'alert-triangle', 'chama');
          alert(`Falha no envio de teste:\n${res.erro}`);
        }
      } catch (err) {
        showToast('Erro no Teste', err.message, 'x-circle', 'chama');
      } finally {
        btnTestar.disabled = false;
        btnTestar.innerHTML = textoOrig;
      }
    });
  }
}

function renderConfiguracoes() {
  const cfg = window.atosDB.getConfig();
  const elNome = document.getElementById('cfg-nome');
  const elSede = document.getElementById('cfg-sede');
  const elAssessoria = document.getElementById('cfg-assessoria');
  const elWhats = document.getElementById('cfg-whatsapp');
  const elPix = document.getElementById('cfg-pix');
  const elInsta = document.getElementById('cfg-instagram');

  // Usar nome_organizacao como campo canônico (era salvo como nome_projeto por engano)
  if (elNome) elNome.value = cfg.nome_organizacao || cfg.nome_projeto || '';
  if (elSede) elSede.value = cfg.sede || '';
  if (elAssessoria) elAssessoria.value = cfg.nome_assessoria || '';
  if (elWhats) elWhats.value = cfg.whatsapp_assessoria || '';
  if (elPix) elPix.value = cfg.pix_oficial || '';
  if (elInsta) elInsta.value = cfg.instagram_projeto || '';

  // Configuração do Serviço de E-mail
  const elEmailOficial = document.getElementById('cfg-email-oficial');
  const elServiceId    = document.getElementById('cfg-email-service-id');
  const elTemplateId   = document.getElementById('cfg-email-template-id');
  const elPublicKey    = document.getElementById('cfg-email-public-key');
  const elStatusInd    = document.getElementById('cfg-email-status-indicator');

  if (elEmailOficial) elEmailOficial.value = cfg.email_oficial || 'projetoatosoficial@gmail.com';

  // Ler credenciais EmailJS diretamente do atosDB (fonte única de verdade)
  // Suporte ao formato legado (sub-objeto email_service) como fallback
  const esvc = cfg.email_service || {};
  const serviceId  = (cfg.emailjs_service_id  || esvc.service_id  || '').trim();
  const templateId = (cfg.emailjs_template_id || esvc.template_id || '').trim();
  const publicKey  = (cfg.emailjs_public_key  || esvc.public_key  || '').trim();

  if (elServiceId)  elServiceId.value  = serviceId;
  if (elTemplateId) elTemplateId.value = templateId;
  if (elPublicKey)  elPublicKey.value  = publicKey;

  // Status das credenciais: verificado a partir dos dados reais do banco (não do cache do AtosEmailService)
  const PLACEHOLDER = 'COLE_';
  const configurado = Boolean(
    serviceId  && !serviceId.includes(PLACEHOLDER) &&
    templateId && !templateId.includes(PLACEHOLDER) &&
    publicKey  && !publicKey.includes(PLACEHOLDER)
  );

  if (elStatusInd) {
    if (configurado) {
      elStatusInd.innerHTML = '<span class="text-cacto font-bold flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Serviço Configurado e Ativo</span>';
    } else {
      elStatusInd.innerHTML = '<span class="text-chama font-semibold flex items-center gap-1"><i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> Credenciais Pendentes</span>';
    }
    if (window.lucide) lucide.createIcons();
  }
}

/* --------------------------------------------------------------------------
   16. SEÇÃO AUDITORIA / LOGS
   -------------------------------------------------------------------------- */
function initAuditoriaModule() {
  const btnLimpar = document.getElementById('btn-limpar-auditoria');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      if (confirm('Deseja limpar os logs de auditoria do sistema?')) {
        localStorage.setItem(DB_KEYS.AUDITORIA, JSON.stringify([]));
        renderAuditoria();
        showToast('Auditoria', 'Logs esvaziados.', 'check', 'cacto');
      }
    });
  }
}

function renderAuditoria() {
  const tbody = document.getElementById('tabela-auditoria-body');
  if (!tbody) return;

  const logs = window.atosDB.getLogsAuditoria();
  tbody.innerHTML = '';

  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-xs text-carvao/60">Nenhum log registrado.</td></tr>`;
    return;
  }

  logs.forEach(l => {
    const dataFmt = new Date(l.data).toLocaleString('pt-BR');
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-areia/20 transition-colors text-xs';
    tr.innerHTML = `
      <td class="px-4 py-3 font-mono text-carvao/60 text-[0.7rem]">${dataFmt}</td>
      <td class="px-4 py-3 font-semibold text-carvao">${l.usuario}</td>
      <td class="px-4 py-3 font-bold text-chama uppercase text-[0.68rem]">${l.acao}</td>
      <td class="px-4 py-3 text-carvao/80">${l.item}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* --------------------------------------------------------------------------
   17. SEÇÃO BACKUP & RESTAURAÇÃO
   -------------------------------------------------------------------------- */
function initBackupModule() {
  const btnExportar = document.getElementById('btn-exportar-json');
  const inputImportar = document.getElementById('input-importar-json');
  const statusImport = document.getElementById('import-status');

  if (btnExportar) {
    btnExportar.addEventListener('click', () => {
      const dataStr = window.atosDB.exportAll();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_completo_projeto_atos_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Backup Exportado', 'O arquivo JSON completo foi baixado.', 'download', 'cacto');
    });
  }

  if (inputImportar && statusImport) {
    inputImportar.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          window.atosDB.importAll(event.target.result);
          statusImport.textContent = '✓ Backup completo restaurado com sucesso!';
          statusImport.className = 'text-xs p-2.5 rounded-lg bg-green-100 text-green-800 font-semibold block';
          renderDashboard();
          showToast('Backup Restaurado', 'Todos os módulos foram atualizados a partir do arquivo.', 'check', 'cacto');
        } catch (err) {
          statusImport.textContent = 'Erro ao restaurar: ' + err.message;
          statusImport.className = 'text-xs p-2.5 rounded-lg bg-red-100 text-red-800 font-semibold block';
        }
      };
      reader.readAsText(file);
    });
  }
}

/* --------------------------------------------------------------------------
   18. TOAST NOTIFICATIONS UI
   -------------------------------------------------------------------------- */
function showToast(titulo, mensagem, icone = 'check', cor = 'cacto') {
  const toast = document.getElementById('admin-toast');
  const tTitle = document.getElementById('toast-title');
  const tMsg = document.getElementById('toast-msg');
  const tIconBox = document.getElementById('toast-icon-box');
  const tIcon = document.getElementById('toast-icon');

  if (!toast) return;

  if (tTitle) tTitle.textContent = titulo;
  if (tMsg) tMsg.textContent = mensagem;

  if (tIconBox) {
    tIconBox.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
      cor === 'cacto' ? 'bg-cacto/15 text-cacto' : 'bg-chama/15 text-chama'
    }`;
  }

  if (tIcon) tIcon.setAttribute('data-lucide', icone);
  if (window.lucide) lucide.createIcons();

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ----------------------------------------------------------------------------
// GERENCIADOR DE ANÁLISE DE COMPROVANTE, CONFIRMAÇÃO & DISPARO DE E-MAIL
// ----------------------------------------------------------------------------
function abrirModalComprovante(inscricaoId) {
  const inscricao = window.atosDB.getInscricaoById(inscricaoId);
  if (!inscricao) return;

  const modal = document.getElementById('modal-comprovante-analise');
  if (!modal) return;

  const edicao = window.atosDB.getEdicaoById(inscricao.edicao_id);
  const edicaoNome = edicao ? edicao.nome : 'Missão Projeto ATOS';

  document.getElementById('comp-inscricao-id').value = inscricao.id;
  document.getElementById('comp-nome').textContent = inscricao.nome;
  document.getElementById('comp-whats').textContent = inscricao.whatsapp || '-';
  document.getElementById('comp-edicao').textContent = edicaoNome;
  document.getElementById('comp-status').textContent = `${inscricao.status_inscricao} (${inscricao.status_pagamento})`;
  document.getElementById('comp-motivo-recusa').value = inscricao.motivo_recusa || '';

  // E-mail cadastrado oficial
  const elEmail = document.getElementById('comp-email');
  if (elEmail) elEmail.textContent = inscricao.email || 'Não informado no cadastro';

  // Status do E-mail e Idempotência
  const statusBadge = document.getElementById('comp-email-status-badge');
  const statusTitle = document.getElementById('comp-email-status-title');
  const statusDesc = document.getElementById('comp-email-status-desc');
  const statusIconBox = document.getElementById('comp-email-status-icon');
  const statusTimestamp = document.getElementById('comp-email-status-timestamp');
  const btnAprovar = document.getElementById('btn-aprovar-pagamento');
  const btnAprovarTexto = document.getElementById('btn-aprovar-texto');
  const btnAprovarIcone = document.getElementById('btn-aprovar-icone');
  const btnReenviar = document.getElementById('btn-reenviar-email');

  const ultimoLog = window.AtosEmailService ? window.AtosEmailService.getUltimoLogByParticipacao(inscricao.id) : null;

  if (ultimoLog && ultimoLog.status === 'enviado') {
    if (statusBadge) {
      statusBadge.className = 'text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
      statusBadge.textContent = 'Enviado';
    }
    if (statusIconBox) {
      statusIconBox.className = 'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600 mt-0.5';
      statusIconBox.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i>';
    }
    if (statusTitle) statusTitle.textContent = 'E-mail de Confirmação Enviado';
    if (statusDesc) statusDesc.textContent = `Mensagem oficial de presença confirmada entregue com sucesso para ${ultimoLog.email_destino}.`;
    if (statusTimestamp) {
      statusTimestamp.classList.remove('hidden');
      statusTimestamp.textContent = `Data/Hora do envio: ${new Date(ultimoLog.enviado_em).toLocaleString('pt-BR')}`;
    }
    if (btnAprovar) {
      btnAprovar.disabled = true;
      btnAprovar.classList.add('opacity-60', 'cursor-not-allowed');
    }
    if (btnAprovarTexto) btnAprovarTexto.textContent = 'Presença e e-mail já confirmados';
    if (btnAprovarIcone) btnAprovarIcone.setAttribute('data-lucide', 'check-check');
    if (btnReenviar) btnReenviar.classList.remove('hidden');

  } else if (ultimoLog && (ultimoLog.status === 'falha' || ultimoLog.status === 'nao_configurado')) {
    if (statusBadge) {
      statusBadge.className = 'text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800';
      statusBadge.textContent = 'Falha no Envio';
    }
    if (statusIconBox) {
      statusIconBox.className = 'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600 mt-0.5';
      statusIconBox.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4"></i>';
    }
    if (statusTitle) statusTitle.textContent = 'Falha no Disparo do E-mail';
    if (statusDesc) statusDesc.textContent = `Motivo do erro: ${ultimoLog.erro || 'Erro no serviço de e-mail'}`;
    if (statusTimestamp) {
      statusTimestamp.classList.remove('hidden');
      statusTimestamp.textContent = `Tentativa registrada em: ${new Date(ultimoLog.enviado_em).toLocaleString('pt-BR')}`;
    }
    if (btnAprovar) {
      btnAprovar.disabled = false;
      btnAprovar.classList.remove('opacity-60', 'cursor-not-allowed');
    }
    if (btnAprovarTexto) btnAprovarTexto.textContent = 'Confirmar e reenviar e-mail de confirmação';
    if (btnAprovarIcone) btnAprovarIcone.setAttribute('data-lucide', 'mail-check');
    if (btnReenviar) btnReenviar.classList.add('hidden');

  } else {
    // Pendente / Sem envio
    if (statusBadge) {
      statusBadge.className = 'text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800';
      statusBadge.textContent = 'Pendente';
    }
    if (statusIconBox) {
      statusIconBox.className = 'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-600 mt-0.5';
      statusIconBox.innerHTML = '<i data-lucide="mail" class="w-4 h-4"></i>';
    }
    if (statusTitle) statusTitle.textContent = 'Aguardando Confirmação';
    if (statusDesc) statusDesc.textContent = `Ao confirmar, o sistema enviará automaticamente o e-mail oficial para ${inscricao.email || 'o participante'}.`;
    if (statusTimestamp) statusTimestamp.classList.add('hidden');
    if (btnAprovar) {
      btnAprovar.disabled = false;
      btnAprovar.classList.remove('opacity-60', 'cursor-not-allowed');
    }
    if (btnAprovarTexto) btnAprovarTexto.textContent = 'Confirmar e enviar e-mail de confirmação';
    if (btnAprovarIcone) btnAprovarIcone.setAttribute('data-lucide', 'mail-check');
    if (btnReenviar) btnReenviar.classList.add('hidden');
  }

  // --- Visualizador Avançado do Comprovante (PDF & Imagens) ---
  renderizarVisualizadorComprovante(inscricao);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

// ---------------------------------------------------------------------------
// UTILITÁRIOS DE ARQUIVO: Detecção de tipo e conversão para Blob URL
// ---------------------------------------------------------------------------

/**
 * Detecta o tipo de arquivo com base no Data URL ou extensão.
 * Retorna 'image', 'pdf' ou 'unknown'.
 */
function detectarTipoArquivo(src) {
  if (!src) return 'none';
  // 1. Detectar por MIME type no Data URL
  if (src.startsWith('data:image/')) return 'image';
  if (src.startsWith('data:application/pdf')) return 'pdf';
  // 2. Detectar por bytes mágicos em base64 (sem header explícito)
  const b64 = src.includes(',') ? src.split(',')[1] : src;
  if (b64) {
    if (b64.startsWith('JVBERi0')) return 'pdf';   // %PDF-
    if (b64.startsWith('/9j/'))   return 'image';  // JPEG
    if (b64.startsWith('iVBORw0KGgo')) return 'image'; // PNG
    if (b64.startsWith('UklGR')) return 'image';   // WebP
  }
  // 3. Detectar por extensão na URL
  const lower = src.toLowerCase().split('?')[0];
  if (/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/.test(lower)) return 'image';
  if (/\.pdf$/.test(lower)) return 'pdf';
  return 'unknown';
}

/**
 * Converte um Data URL em Blob URL para contornar bloqueios do navegador
 * ao abrir data: URIs grandes em novas abas ou iframes.
 */
function dataURItoBlob(dataURI) {
  try {
    const parts = dataURI.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const binary = atob(parts[1]);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], { type: mime }));
  } catch (e) {
    console.warn('[Admin] Erro ao converter DataURI para Blob:', e);
    return null;
  }
}

/** Objeto para controlar blob URLs ativos e revogá-los ao fechar o modal */
const _comprovanteState = { blobUrl: null, tipo: 'none' };

/**
 * Renderiza o visualizador de comprovante com detecção de tipo.
 */
function renderizarVisualizadorComprovante(inscricao) {
  const src = inscricao.comprovante || '';
  const tipo = detectarTipoArquivo(src);
  _comprovanteState.tipo = tipo;

  // Revogar Blob URL anterior para evitar memory leak
  if (_comprovanteState.blobUrl) {
    URL.revokeObjectURL(_comprovanteState.blobUrl);
    _comprovanteState.blobUrl = null;
  }

  const imgContainer = document.getElementById('comp-img-container');
  const imgEl        = document.getElementById('comp-img');
  const pdfContainer = document.getElementById('comp-pdf-container');
  const pdfIframe    = document.getElementById('comp-pdf-iframe');
  const fallbackEl   = document.getElementById('comp-fallback');
  const fallbackTxt  = document.getElementById('comp-fallback-txt');
  const tipoBadge    = document.getElementById('comp-tipo-badge');
  const acoesBar     = document.getElementById('comp-acoes-arquivo');

  // Ocultar todos os containers primeiro
  if (imgContainer) imgContainer.classList.add('hidden');
  if (pdfContainer) pdfContainer.classList.add('hidden');
  if (fallbackEl)   fallbackEl.classList.add('hidden');
  if (acoesBar)     acoesBar.classList.add('hidden');

  if (tipo === 'image') {
    if (tipoBadge) { tipoBadge.textContent = 'Imagem (JPG / PNG / WebP)'; tipoBadge.className = 'text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700'; }
    if (imgEl) imgEl.src = src;
    if (imgContainer) imgContainer.classList.remove('hidden');
    if (acoesBar) acoesBar.classList.remove('hidden');

  } else if (tipo === 'pdf') {
    if (tipoBadge) { tipoBadge.textContent = 'Documento PDF'; tipoBadge.className = 'text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700'; }
    // Converter para Blob URL para evitar bloqueio de iframe com data: URI
    const blobUrl = dataURItoBlob(src);
    _comprovanteState.blobUrl = blobUrl;
    if (pdfIframe) pdfIframe.src = blobUrl || src;
    if (pdfContainer) pdfContainer.classList.remove('hidden');
    if (acoesBar) acoesBar.classList.remove('hidden');

  } else if (tipo === 'unknown' && src) {
    // Tipo desconhecido mas há arquivo — oferece link de fallback
    if (tipoBadge) { tipoBadge.textContent = 'Arquivo Anexado'; tipoBadge.className = 'text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700'; }
    if (fallbackTxt) fallbackTxt.textContent = 'Tipo de arquivo não reconhecido. Use "Nova Aba" para abrir.';
    if (fallbackEl) fallbackEl.classList.remove('hidden');
    if (acoesBar) acoesBar.classList.remove('hidden');

  } else {
    // Sem arquivo
    if (tipoBadge) { tipoBadge.textContent = 'Sem Arquivo'; tipoBadge.className = 'text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-areia text-carvao/70'; }
    if (fallbackTxt) fallbackTxt.textContent = 'Nenhum comprovante financeiro anexado (ou missão sem taxa de inscrição).';
    if (fallbackEl) fallbackEl.classList.remove('hidden');
  }
}

// ---------------------------------------------------------------------------

function initComprovanteModule() {
  const modal = document.getElementById('modal-comprovante-analise');
  const btnFechar = document.getElementById('modal-comprovante-fechar');
  const btnAprovar = document.getElementById('btn-aprovar-pagamento');
  const btnRecusar = document.getElementById('btn-recusar-pagamento');
  const btnReenviar = document.getElementById('btn-reenviar-email');

  const fechar = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    // Limpar Blob URL ao fechar para liberar memória
    if (_comprovanteState.blobUrl) {
      URL.revokeObjectURL(_comprovanteState.blobUrl);
      _comprovanteState.blobUrl = null;
    }
    // Limpar iframe PDF
    const pdfIframe = document.getElementById('comp-pdf-iframe');
    if (pdfIframe) pdfIframe.src = '';
  };

  if (btnFechar) btnFechar.addEventListener('click', fechar);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) fechar(); });

  // --- Botões de ação do visualizador ---
  const btnAmpliar   = document.getElementById('btn-ampliar-comprovante');
  const btnNovaAba   = document.getElementById('btn-abrir-nova-aba');

  if (btnAmpliar) btnAmpliar.addEventListener('click', () => abrirLightbox());
  if (btnNovaAba) btnNovaAba.addEventListener('click', () => abrirEmNovaAba());

  // Clicar na imagem preview também amplia
  const compImg = document.getElementById('comp-img');
  if (compImg) compImg.addEventListener('click', () => abrirLightbox());

  // --- Lightbox ---
  initLightbox();

  // Variável de controle de idempotência em tempo de execução para evitar cliques múltiplos
  let isSubmitting = false;

  async function processarConfirmacaoComEmail(forcarReenvio = false) {
    if (isSubmitting) return;

    const id = document.getElementById('comp-inscricao-id').value;
    if (!id) return;

    const inscricao = window.atosDB.getInscricaoById(id);
    if (!inscricao) {
      showToast('Erro', 'Participante não localizado.', 'x-circle', 'chama');
      return;
    }

    // Busca os dados reais da pessoa no banco para garantir o e-mail atualizado
    const pessoa = window.atosDB.getPessoaById(inscricao.pessoa_id);
    const emailReal = (inscricao.email || (pessoa ? pessoa.email : '')).trim().toLowerCase();
    
    // Validação estrita do e-mail cadastrado
    const emailDestino = emailReal;
    if (!emailDestino || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDestino)) {
      showToast(
        'E-mail Inválido',
        `O participante ${inscricao.nome} não possui um endereço de e-mail válido cadastrado. Apenas o e-mail cadastrado pode ser utilizado para confirmação.`,
        'alert-triangle',
        'chama'
      );
      return;
    }

    // Travar botão e exibir estado de carregamento
    isSubmitting = true;
    const btnTexto = document.getElementById('btn-aprovar-texto');
    const textoOriginal = btnTexto ? btnTexto.textContent : 'Confirmar';
    if (btnAprovar) {
      btnAprovar.disabled = true;
      btnAprovar.classList.add('opacity-70', 'cursor-wait');
    }
    if (btnTexto) {
      btnTexto.innerHTML = '<span class="inline-block animate-spin mr-1">⏳</span> Enviando e-mail de confirmação...';
    }

    const edicao = window.atosDB.getEdicaoById(inscricao.edicao_id);
    const edicaoNome = edicao ? edicao.nome : 'Missão Projeto ATOS';
    const edicaoData = edicao ? (edicao.data_missao || edicao.data || 'A confirmar') : 'A confirmar';
    const edicaoLocal = edicao ? `${edicao.cidade} - ${edicao.estado}` : 'Sertão - PB';

    try {
      // 1. Atualizar status da participação para Confirmado no sistema
      window.atosDB.aprovarInscricao(id);

      // Atualizar lista de participantes no fundo
      const sel = document.getElementById('select-edicao-participantes');
      if (sel) renderTabelaParticipantes(sel.value);

      // 2. Disparar envio real pelo serviço de e-mail (backend / EmailJS)
      let resultadoEmail = { sucesso: false, erro: 'Serviço de e-mail não disponível.' };
      if (window.AtosEmailService) {
        resultadoEmail = await window.AtosEmailService.enviarConfirmacaoParticipacao({
          participacaoId: id,
          tipo: 'confirmacao_participacao',
          nomeParticipante: inscricao.nome,
          emailParticipante: emailDestino,
          edicaoNome,
          edicaoData,
          edicaoLocal,
          forcarReenvio
        });
      }

      // Re-renderizar a tabela para refletir os badges mais recentes
      if (sel) renderTabelaParticipantes(sel.value);

      // 3. Feedback visual e tratamento de erro sem mascarar
      if (resultadoEmail.sucesso) {
        fechar();
        showToast(
          'Confirmação Concluída',
          `Presença confirmada e e-mail enviado com sucesso para ${resultadoEmail.emailDestino || emailDestino}!`,
          'mail-check',
          'cacto'
        );
      } else if (resultadoEmail.jaEnviado) {
        fechar();
        showToast(
          'Participação Confirmada',
          resultadoEmail.erro,
          'info',
          'cacto'
        );
      } else {
        // NÃO MASCARAR O ERRO: informar o administrador explicitamente
        abrirModalComprovante(id);
        showToast(
          'Atenção: Falha no E-mail',
          `Presença confirmada no sistema, porém o e-mail não pôde ser enviado: ${resultadoEmail.erro}`,
          'alert-triangle',
          'chama'
        );
      }

    } catch (err) {
      console.error('[Admin] Erro na rotina de confirmação:', err);
      showToast('Erro', err.message || 'Falha ao processar confirmação.', 'x-circle', 'chama');
    } finally {
      isSubmitting = false;
      if (btnAprovar) {
        btnAprovar.disabled = false;
        btnAprovar.classList.remove('opacity-70', 'cursor-wait');
      }
      if (btnTexto) btnTexto.textContent = textoOriginal;
      if (window.lucide) lucide.createIcons();
    }
  }

  // Evento do botão principal "Confirmar e enviar e-mail de confirmação"
  if (btnAprovar) {
    btnAprovar.addEventListener('click', () => {
      processarConfirmacaoComEmail(false);
    });
  }

  // Evento do botão secundário de reenvio explícito
  if (btnReenviar) {
    btnReenviar.addEventListener('click', () => {
      const id = document.getElementById('comp-inscricao-id').value;
      const inscricao = window.atosDB.getInscricaoById(id);
      const email = inscricao ? inscricao.email : '';
      if (confirm(`Deseja realmente reenviar o e-mail de confirmação para ${email}?`)) {
        processarConfirmacaoComEmail(true);
      }
    });
  }

  // Evento de recusa
  if (btnRecusar) {
    btnRecusar.addEventListener('click', () => {
      const id = document.getElementById('comp-inscricao-id').value;
      const motivo = document.getElementById('comp-motivo-recusa').value.trim();
      if (id) {
        window.atosDB.recusarInscricao(id, motivo);
        fechar();
        const sel = document.getElementById('select-edicao-participantes');
        if (sel) renderTabelaParticipantes(sel.value);
        showToast('Inscrição Recusada', 'O status foi atualizado para recusado.', 'x-circle', 'chama');
      }
    });
  }
}


// Listener para sincronizacao em tempo real do Supabase
window.addEventListener('atos_dados_sincronizados', () => {
  const activeLink = document.querySelector('.admin-sidebar-link.active');
  const activeSection = activeLink ? activeLink.getAttribute('data-section') : 'dashboard';
  renderCurrentSection(activeSection);
  if (window.lucide) lucide.createIcons();
});

/* --------------------------------------------------------------------------
   21. NOTIFICACOES
   -------------------------------------------------------------------------- */
function initNotificacoesModule() {
  const btn = document.getElementById('btn-notificacoes');
  const dropdown = document.getElementById('notif-dropdown');
  const list = document.getElementById('notif-list');
  const empty = document.getElementById('notif-empty');
  const countLabel = document.getElementById('notif-count-label');
  const badge = document.getElementById('badge-notificacoes');
  const btnMarcarTodas = document.getElementById('btn-marcar-todas-lidas');

  if (!btn || !dropdown) return;

  function renderNotificacoes() {
    const user = window.atosDB.getAdminSessionUser();
    const uid = user ? user.id : 'all';
    const notifs = window.atosDB.getNotificacoesComEstado(uid);
    const unread = notifs.filter(n => !n.lida).length;

    // Update badges
    if (unread > 0) {
      badge.style.display = 'flex';
      badge.textContent = unread > 9 ? '9+' : unread;
      countLabel.style.display = 'inline-block';
      countLabel.textContent = unread + ' novas';
    } else {
      badge.style.display = 'none';
      countLabel.style.display = 'none';
    }

    // Render list
    list.innerHTML = '';
    if (notifs.length === 0) {
      list.appendChild(empty);
      return;
    }

    notifs.forEach(n => {
      const item = document.createElement('div');
      item.className = 'p-3 flex items-start gap-3 hover:bg-areia-light/50 transition-colors relative group';
      if (!n.lida) item.classList.add('bg-areia-light/30');

      let icon = 'info';
      let iconColor = 'text-chama';
      if (n.tipo === 'success') { icon = 'check-circle'; iconColor = 'text-emerald-500'; }
      if (n.tipo === 'warning') { icon = 'alert-triangle'; iconColor = 'text-amber-500'; }

      const dateStr = new Date(n.criado_em).toLocaleString('pt-BR');

      item.innerHTML = `
        <div class="mt-1">
          <i data-lucide="${icon}" class="w-4 h-4 ${iconColor}"></i>
        </div>
        <div class="flex-1 min-w-0 cursor-pointer notif-content">
          <h4 class="text-[0.7rem] font-bold text-carvao ${!n.lida ? 'font-extrabold' : ''}">${n.titulo}</h4>
          <p class="text-[0.65rem] text-carvao/70 mt-0.5 line-clamp-2">${n.mensagem}</p>
          <span class="text-[0.55rem] text-carvao/40 mt-1 block">${dateStr}</span>
        </div>
      `;

      if (!n.lida) {
        const markBtn = item.querySelector('.btn-mark-read');
        if (markBtn) {
          markBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await window.atosDB.marcarNotificacaoLida(n.id, uid);
            renderNotificacoes();
          });
        }
        item.querySelector('.notif-content').addEventListener('click', async () => {
          await window.atosDB.marcarNotificacaoLida(n.id, uid);
          renderNotificacoes();
          dropdown.classList.add('hidden');
        });
      }

      list.appendChild(item);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Toggle Dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  // Mark all as read
  if (btnMarcarTodas) {
    btnMarcarTodas.addEventListener('click', async () => {
      const user = window.atosDB.getAdminSessionUser();
      const uid = user ? user.id : 'all';
      await window.atosDB.marcarTodasLidas(uid);
      renderNotificacoes();
    });
  }

  // Listen to DB events
  window.addEventListener('atos_notificacao_nova', () => {
    showToast('Nova notificação recebida', 'info');
    renderNotificacoes();
  });
  window.addEventListener('atos_notificacao_lida', () => {
    renderNotificacoes();
  });
  window.addEventListener('atos_dados_sincronizados', () => {
    renderNotificacoes();
  });

  // Initial render
  renderNotificacoes();
}

// ---------------------------------------------------------------------------
// LIGHTBOX: Visualização em Tela Cheia de Comprovantes (PDF & Imagens)
// ---------------------------------------------------------------------------

/** Blob URL exclusivo para o lightbox (separado do modal principal) */
const _lightboxState = { blobUrl: null };

function initLightbox() {
  const lightbox     = document.getElementById('modal-lightbox-comprovante');
  const btnFechar    = document.getElementById('lightbox-fechar');
  const btnNovaAba   = document.getElementById('lightbox-btn-nova-aba');
  const btnDownload  = document.getElementById('lightbox-btn-download');

  if (!lightbox) return;

  const fecharLightbox = () => {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    // Limpar conteúdo
    const img = document.getElementById('lightbox-img');
    const pdf = document.getElementById('lightbox-pdf');
    if (img) { img.classList.add('hidden'); img.src = ''; }
    if (pdf) { pdf.classList.add('hidden'); pdf.src = ''; }
    // Revogar blob URL do lightbox
    if (_lightboxState.blobUrl) {
      URL.revokeObjectURL(_lightboxState.blobUrl);
      _lightboxState.blobUrl = null;
    }
  };

  if (btnFechar)  btnFechar.addEventListener('click', fecharLightbox);
  if (lightbox)   lightbox.addEventListener('click', (e) => { if (e.target === lightbox) fecharLightbox(); });

  if (btnNovaAba) btnNovaAba.addEventListener('click', () => {
    const url = _lightboxState.blobUrl;
    if (url) window.open(url, '_blank');
    else abrirEmNovaAba();
  });

  if (btnDownload) btnDownload.addEventListener('click', () => {
    const url = _lightboxState.blobUrl;
    const tipo = _comprovanteState.tipo;
    const ext = tipo === 'pdf' ? '.pdf' : tipo === 'image' ? '.jpg' : '.bin';
    const a = document.createElement('a');
    a.href = url || _comprovanteState.blobUrl || '#';
    a.download = `comprovante${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

/**
 * Abre o lightbox (tela cheia) com o comprovante do participante atual.
 */
function abrirLightbox() {
  const lightbox   = document.getElementById('modal-lightbox-comprovante');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxPdf = document.getElementById('lightbox-pdf');
  const lbTitulo   = document.getElementById('lightbox-titulo');
  const lbSubtitulo = document.getElementById('lightbox-subtitulo');
  const lbIcon     = document.getElementById('lightbox-icon');
  if (!lightbox) return;

  const id = document.getElementById('comp-inscricao-id') ? document.getElementById('comp-inscricao-id').value : null;
  const inscricao = id ? window.atosDB.getInscricaoById(id) : null;
  if (!inscricao) return;

  const src  = inscricao.comprovante || '';
  const tipo = _comprovanteState.tipo || detectarTipoArquivo(src);

  if (lbSubtitulo) lbSubtitulo.textContent = inscricao.nome || 'Participante';

  // Ocultar ambos
  if (lightboxImg) lightboxImg.classList.add('hidden');
  if (lightboxPdf) lightboxPdf.classList.add('hidden');

  // Revogar blob URL anterior do lightbox
  if (_lightboxState.blobUrl) {
    URL.revokeObjectURL(_lightboxState.blobUrl);
    _lightboxState.blobUrl = null;
  }

  if (tipo === 'image') {
    if (lbTitulo)   lbTitulo.textContent = 'Imagem do Comprovante';
    if (lbIcon)     lbIcon.setAttribute('data-lucide', 'image');
    if (lightboxImg) { lightboxImg.src = src; lightboxImg.classList.remove('hidden'); }
  } else if (tipo === 'pdf') {
    if (lbTitulo)   lbTitulo.textContent = 'PDF do Comprovante';
    if (lbIcon)     lbIcon.setAttribute('data-lucide', 'file-text');
    // Reutilizar o blob URL do modal principal se existir, senão criar novo
    const blobUrl = _comprovanteState.blobUrl || dataURItoBlob(src);
    _lightboxState.blobUrl = blobUrl;
    if (lightboxPdf) { lightboxPdf.src = blobUrl || src; lightboxPdf.classList.remove('hidden'); }
  } else {
    // Fallback: tentar abrir em nova aba
    abrirEmNovaAba();
    return;
  }

  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
  if (window.lucide) lucide.createIcons();
}

/**
 * Abre o comprovante em nova aba de forma segura.
 * Usa Blob URL para contornar bloqueio de data: URIs pelo navegador.
 */
function abrirEmNovaAba() {
  const id = document.getElementById('comp-inscricao-id') ? document.getElementById('comp-inscricao-id').value : null;
  const inscricao = id ? window.atosDB.getInscricaoById(id) : null;
  if (!inscricao || !inscricao.comprovante) return;

  // Tentar usar blob URL já gerado
  const blobUrl = _comprovanteState.blobUrl || _lightboxState.blobUrl || dataURItoBlob(inscricao.comprovante);
  if (blobUrl) {
    window.open(blobUrl, '_blank');
  } else {
    // Último recurso: data: URI diretamente (pode ser bloqueado em alguns navegadores)
    window.open(inscricao.comprovante, '_blank');
  }
}
