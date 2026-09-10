/**
 * PROJETO ATOS — Módulo Principal do Sistema de Voluntários e Edições
 * Controla: Renderização de Edições, Modais, Cadastro, Interesse, Confirmação
 */

document.addEventListener('DOMContentLoaded', () => {
  initVoluntarioSystem();
});

/* --------------------------------------------------------------------------
   INICIALIZAÇÃO GERAL DO SISTEMA DE VOLUNTÁRIOS
   -------------------------------------------------------------------------- */
function initVoluntarioSystem() {
  renderEdicoesPublicas();
  syncPublicContentFromDB();
  initModais();
  initFormCadastro();
  initBtnAbrirCadastroGeral();
  initBtnFeedback();
  initBuscarWhats();
}

/* --------------------------------------------------------------------------
   1. RENDERIZAÇÃO DAS PRÓXIMAS EDIÇÕES
   -------------------------------------------------------------------------- */
function renderEdicoesPublicas() {
  const container = document.getElementById('edicoes-container');
  if (!container || !window.atosDB) return;

  const edicoes = window.atosDB.getEdicoes();
  const ativasOuBreve = edicoes.filter(e =>
    e.status !== 'Concluída' && e.status !== 'Cancelada'
  );

  container.innerHTML = '';

  if (ativasOuBreve.length === 0) {
    // Estado "Em Breve" quando não há edições cadastradas
    container.innerHTML = `
      <div class="col-span-full max-w-2xl mx-auto w-full">
        <div class="bg-white rounded-3xl border-2 border-dashed border-areia/80 p-10 sm:p-14 text-center space-y-5 shadow-sm">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-chama/10 text-chama flex items-center justify-center">
            <i data-lucide="map-pin" class="w-8 h-8"></i>
          </div>
          <div class="space-y-2">
            <span class="inline-block text-xs font-bold uppercase tracking-widest text-terra bg-terra-light px-4 py-1.5 rounded-full">PRÓXIMA EDIÇÃO</span>
            <h3 class="font-display text-4xl sm:text-5xl text-carvao">EM BREVE</h3>
            <p class="text-sm sm:text-base text-carvao/75 leading-relaxed max-w-md mx-auto">
              Uma nova missão está sendo preparada. Em breve divulgaremos a cidade, a data e todas as informações sobre a próxima edição do Projeto ATOS.
            </p>
          </div>
          <button
            type="button"
            class="btn-tenho-interesse inline-flex items-center gap-2 bg-chama hover:bg-chama-dark text-white font-bold px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            data-edicao-id=""
          >
            <i data-lucide="bell" class="w-5 h-5"></i>
            <span>TENHO INTERESSE</span>
          </button>
        </div>
      </div>
    `;
  } else {
    ativasOuBreve.forEach(edicao => {
      const card = criarCardEdicao(edicao);
      container.appendChild(card);
    });
  }

  // Eventos dos botões "Tenho Interesse"
  container.querySelectorAll('.btn-tenho-interesse').forEach(btn => {
    btn.addEventListener('click', () => {
      const edicaoId = btn.getAttribute('data-edicao-id') || '';
      handleInteresse(edicaoId);
    });
  });

  if (window.lucide) lucide.createIcons();
}

function criarCardEdicao(edicao) {
  const div = document.createElement('div');
  div.className = 'bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-areia flex flex-col';

  // Formata a data
  let dataFormatada = edicao.data;
  try {
    const partes = edicao.data.split('-');
    if (partes.length === 3) {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      dataFormatada = `${partes[2]} de ${meses[parseInt(partes[1]) - 1]} de ${partes[0]}`;
    }
  } catch {}

  // Badge de status
  const statusBadge = {
    'Inscrições Abertas': 'bg-chama/15 text-chama-dark border border-chama/30',
    'Em Confirmação': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Em Breve': 'bg-gray-100 text-gray-600 border border-gray-200',
  };
  const badgeClass = statusBadge[edicao.status] || 'bg-gray-100 text-gray-700 border border-gray-200';

  // Texto e ícone do botão baseados na configuração da edição
  let btnTexto = 'TENHO INTERESSE';
  let btnIcon = 'heart-handshake';

  if (edicao.tem_inscricao) {
    btnTexto = edicao.tem_pagamento ? 'FAZER INSCRIÇÃO' : 'INSCREVER-SE (GRÁTIS)';
    btnIcon = 'user-check';
  } else if (edicao.status === 'Em Confirmação') {
    btnTexto = 'CONFIRMAR PRESENÇA';
    btnIcon = 'check-circle';
  }

  div.innerHTML = `
    <!-- Imagem -->
    <div class="relative w-full h-48 overflow-hidden bg-areia/30">
      <img
        src="${edicao.imagem || 'assets/images/casal_1.jpg'}"
        alt="Imagem da edição ${edicao.nome}"
        class="w-full h-full object-cover"
        onerror="this.src='assets/images/casal_1.jpg'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-carvao/60 via-transparent to-transparent"></div>
      <span class="absolute bottom-3 left-4 font-display text-white text-lg leading-tight drop-shadow">
        ${edicao.cidade} &bull; ${edicao.estado}
      </span>
    </div>

    <!-- Conteúdo -->
    <div class="flex flex-col flex-grow p-6 space-y-4">
      
      <!-- Header do Card -->
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-display text-2xl sm:text-3xl text-carvao leading-tight">${edicao.nome}</h3>
        <span class="flex-shrink-0 text-[0.7rem] font-bold px-2.5 py-1 rounded-full ${badgeClass}">
          ${edicao.status}
        </span>
      </div>

      <!-- Infos da Edição -->
      <div class="space-y-1.5 text-xs sm:text-sm text-carvao/80">
        <p class="flex items-center gap-2">
          <i data-lucide="calendar" class="w-4 h-4 text-chama flex-shrink-0"></i>
          <span><strong>${dataFormatada}</strong></span>
        </p>
        ${edicao.horario ? `
        <p class="flex items-center gap-2">
          <i data-lucide="clock" class="w-4 h-4 text-chama flex-shrink-0"></i>
          <span>${edicao.horario}</span>
        </p>` : ''}
        ${edicao.descricao ? `
        <p class="flex items-start gap-2 text-xs text-carvao/70 leading-relaxed pt-1">
          <i data-lucide="info" class="w-4 h-4 text-cacto flex-shrink-0 mt-0.5"></i>
          <span class="line-clamp-3">${edicao.descricao}</span>
        </p>` : ''}
      </div>

      <!-- Botão de Ação -->
      <div class="pt-2 mt-auto">
        ${edicao.inscricoes_abertas ? `
        <button
          type="button"
          class="btn-tenho-interesse w-full inline-flex items-center justify-center gap-2.5 bg-chama hover:bg-chama-dark text-white font-bold text-sm px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          data-edicao-id="${edicao.id}"
          data-edicao-status="${edicao.status}"
        >
          <i data-lucide="${btnIcon}" class="w-5 h-5"></i>
          <span>${btnTexto}</span>
        </button>
        ` : `
        <div class="text-center py-3 text-xs font-semibold text-carvao/50 bg-areia/40 rounded-full border border-areia">
          Inscrições encerradas para esta edição
        </div>
        `}
      </div>

    </div>
  `;

  return div;
}

/* --------------------------------------------------------------------------
   2. FLUXO DE INTERESSE — detecta se o usuário já é cadastrado
   -------------------------------------------------------------------------- */
function handleInteresse(edicaoId) {
  const usuarioAtual = window.atosDB.getCurrentUser();
  const edicao = edicaoId ? window.atosDB.getEdicaoById(edicaoId) : null;

  if (!usuarioAtual) {
    // Abre formulário de cadastro vinculado à edição
    abrirModalCadastro(edicaoId);
  } else {
    // Se a edição tem processo de inscrição com pagamento
    if (edicao && edicao.tem_inscricao && edicao.tem_pagamento) {
      abrirModalPagamentoInscricao(usuarioAtual, edicao);
    } else {
      abrirModalAcaoEdicao(usuarioAtual, edicao);
    }
  }
}

/* --------------------------------------------------------------------------
   3. MODAIS
   -------------------------------------------------------------------------- */
function initModais() {
  // Fecha qualquer modal clicando fora (backdrop)
  document.querySelectorAll('.modal-atos-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        fecharTodosModais();
      }
    });
  });

  // Botões de fechar
  document.querySelectorAll('.btn-fechar-modal').forEach(btn => {
    btn.addEventListener('click', fecharTodosModais);
  });

  // ESC fecha modais
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharTodosModais();
  });
}

function fecharTodosModais() {
  document.querySelectorAll('.modal-atos-backdrop').forEach(m => {
    m.classList.remove('active');
  });
  document.body.style.overflow = '';
}

function abrirModal(id) {
  fecharTodosModais();
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.lucide) lucide.createIcons();
  }
}

/* ---- Modal de Cadastro ---- */
function abrirModalCadastro(edicaoId = '') {
  const input = document.getElementById('cadastro-edicao-origem');
  if (input) input.value = edicaoId;

  // Limpa o formulário se estiver em branco (novo cadastro)
  const usuarioAtual = window.atosDB.getCurrentUser();
  if (!usuarioAtual) {
    const form = document.getElementById('form-cadastro-voluntario');
    if (form) form.reset();
    document.getElementById('secao-profissoes').classList.add('hidden');
    document.querySelector('[name="is_profissional"][value="nao"]').checked = true;
    document.querySelector('[name="is_voluntario"][value="sim"]').checked = true;
  }

  abrirModal('modal-cadastro-voluntario');
}

/* ---- Modal de Ação (Interesse / Confirmação) para usuário já cadastrado ---- */
function abrirModalAcaoEdicao(usuario, edicao) {
  const titulo = document.getElementById('modal-acao-titulo');
  const desc = document.getElementById('modal-acao-desc');
  const tag = document.getElementById('modal-acao-tag');
  const detalhes = document.getElementById('modal-acao-detalhes');
  const btnAcao = document.getElementById('btn-confirmar-acao-modal');

  const ehConfirmacao = edicao && edicao.status === 'Em Confirmação';

  if (edicao) {
    let dataFormatada = edicao.data;
    try {
      const partes = edicao.data.split('-');
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      dataFormatada = `${partes[2]} de ${meses[parseInt(partes[1]) - 1]} de ${partes[0]}`;
    } catch {}

    tag.textContent = `${edicao.cidade} • ${edicao.estado}`;
    titulo.textContent = ehConfirmacao ? 'CONFIRME SUA PRESENÇA' : 'VOCÊ QUER PARTICIPAR DESTA MISSÃO?';
    desc.textContent = `Olá, ${usuario.nome.split(' ')[0]}! ${ehConfirmacao ? 'Esta edição está na etapa de confirmação de presença.' : 'Registre seu interesse para receber todas as informações.'}`;

    detalhes.innerHTML = `
      <p class="flex items-center gap-2">
        <i data-lucide="map-pin" class="w-3.5 h-3.5 text-chama"></i>
        <strong>${edicao.nome}</strong>
      </p>
      <p class="flex items-center gap-2 mt-1.5">
        <i data-lucide="calendar" class="w-3.5 h-3.5 text-cacto"></i>
        <span>${dataFormatada} — ${edicao.horario || 'Horário a definir'}</span>
      </p>
      <p class="flex items-center gap-2 mt-1.5">
        <i data-lucide="user-check" class="w-3.5 h-3.5 text-terra"></i>
        <span>Participando como: <strong>${usuario.nome}</strong></span>
      </p>
    `;

    btnAcao.innerHTML = ehConfirmacao
      ? '<i data-lucide="check-circle" class="w-5 h-5"></i><span>CONFIRMAR PRESENÇA</span>'
      : '<i data-lucide="heart-handshake" class="w-5 h-5"></i><span>MANIFESTAR INTERESSE</span>';

    // Verifica se já tem participação
    const partExistente = window.atosDB.getParticipacao(usuario.id, edicao.id);
    if (partExistente) {
      if (partExistente.status === window.STATUS_PARTICIPACAO.INTERESSE_MANIFESTADO && !ehConfirmacao) {
        btnAcao.disabled = true;
        btnAcao.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i><span>INTERESSE JÁ REGISTRADO</span>';
        btnAcao.className = btnAcao.className.replace('bg-chama hover:bg-chama-dark', 'bg-cacto cursor-not-allowed');
      } else if (partExistente.status === window.STATUS_PARTICIPACAO.PRESENCA_CONFIRMADA) {
        btnAcao.disabled = true;
        btnAcao.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5"></i><span>PRESENÇA JÁ CONFIRMADA ✓</span>';
        btnAcao.className = btnAcao.className.replace('bg-chama hover:bg-chama-dark', 'bg-cacto cursor-not-allowed');
      } else {
        btnAcao.disabled = false;
        btnAcao.className = btnAcao.className.replace('bg-cacto cursor-not-allowed', 'bg-chama hover:bg-chama-dark');
      }
    } else {
      btnAcao.disabled = false;
      if (btnAcao.className.includes('cursor-not-allowed')) {
        btnAcao.className = btnAcao.className.replace('bg-cacto cursor-not-allowed', 'bg-chama hover:bg-chama-dark');
      }
    }

    // Clique do botão de ação
    const btnNovo = btnAcao.cloneNode(true);
    btnAcao.parentNode.replaceChild(btnNovo, btnAcao);
    btnNovo.addEventListener('click', () => {
      if (btnNovo.disabled) return;
      try {
        if (ehConfirmacao) {
          window.atosDB.confirmarPresenca(usuario.id, edicao.id);
          fecharTodosModais();
          mostrarFeedback(
            'PRESENÇA CONFIRMADA!',
            'Sua presença nesta missão foi confirmada. Aguardamos você!',
            'check-circle',
            'green'
          );
        } else {
          window.atosDB.manifestarInteresse(usuario.id, edicao.id);
          fecharTodosModais();
          mostrarFeedback(
            'INTERESSE REGISTRADO!',
            'Seu interesse nesta missão foi registrado. Em breve teremos mais informações.',
            'bell-ring',
            'chama'
          );
        }
      } catch (err) {
        alert(err.message);
      }
    });

  } else {
    // Sem edição definida (Em Breve)
    tag.textContent = 'Próxima Missão';
    titulo.textContent = 'FIQUE POR DENTRO DAS NOVIDADES!';
    desc.textContent = `Olá, ${usuario.nome.split(' ')[0]}! Quando a próxima edição for anunciada, você será um dos primeiros a saber.`;
    detalhes.innerHTML = '<p class="text-xs text-carvao/70">Avisaremos assim que a nova cidade e data forem confirmadas.</p>';
    btnAcao.innerHTML = '<i data-lucide="bell" class="w-5 h-5"></i><span>AGUARDAR E SER AVISADO</span>';

    const btnNovo = btnAcao.cloneNode(true);
    btnAcao.parentNode.replaceChild(btnNovo, btnAcao);
    btnNovo.addEventListener('click', () => {
      fecharTodosModais();
      mostrarFeedback(
        'OBRIGADO PELO INTERESSE!',
        'Avisaremos quando a próxima missão for anunciada. Deus abençoe!',
        'heart',
        'chama'
      );
    });
  }

  // Botão "Trocar de usuário"
  const btnTrocar = document.getElementById('btn-trocar-usuario');
  if (btnTrocar) {
    const btnTrocarNovo = btnTrocar.cloneNode(true);
    btnTrocar.parentNode.replaceChild(btnTrocarNovo, btnTrocar);
    btnTrocarNovo.addEventListener('click', () => {
      window.atosDB.clearCurrentUser();
      fecharTodosModais();
      abrirModalCadastro(edicao ? edicao.id : '');
    });
  }

  abrirModal('modal-acao-edicao');
}

/* ---- Modal de Feedback / Sucesso ---- */
function mostrarFeedback(titulo, mensagem, icone = 'check-circle', cor = 'green') {
  const titEl = document.getElementById('feedback-titulo');
  const msgEl = document.getElementById('feedback-msg');
  const icoEl = document.getElementById('feedback-icone');
  const icoContainer = document.getElementById('feedback-icone-container');

  if (titEl) titEl.textContent = titulo;
  if (msgEl) msgEl.textContent = mensagem;
  if (icoEl) icoEl.setAttribute('data-lucide', icone);

  const corMap = {
    green: 'bg-green-100 text-green-700',
    chama: 'bg-chama/15 text-chama',
    cacto: 'bg-cacto/15 text-cacto'
  };
  if (icoContainer) {
    icoContainer.className = `w-16 h-16 mx-auto rounded-2xl ${corMap[cor] || corMap.green} flex items-center justify-center`;
  }

  abrirModal('modal-feedback');
}

function initBtnFeedback() {
  const btn = document.getElementById('btn-feedback-ok');
  if (btn) {
    btn.addEventListener('click', fecharTodosModais);
  }
}

/* --------------------------------------------------------------------------
   4. FORMULÁRIO DE CADASTRO
   -------------------------------------------------------------------------- */
function initFormCadastro() {
  // Toggle profissões
  document.querySelectorAll('.radio-profissional').forEach(radio => {
    radio.addEventListener('change', () => {
      const secao = document.getElementById('secao-profissoes');
      if (radio.value === 'sim' && radio.checked) {
        secao.classList.remove('hidden');
      } else if (radio.value === 'nao' && radio.checked) {
        secao.classList.add('hidden');
      }
    });
  });

  // Submissão do formulário
  const form = document.getElementById('form-cadastro-voluntario');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validações
    const nome = document.getElementById('cad-nome').value.trim();
    const whatsapp = document.getElementById('cad-whatsapp').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const cidade = document.getElementById('cad-cidade').value.trim();
    const estado = document.getElementById('cad-estado').value.trim();
    const dataNasc = document.getElementById('cad-data-nasc').value;

    if (!nome || !whatsapp || !cidade || !estado) {
      alert('Por favor, preencha os campos obrigatórios: Nome, WhatsApp, Cidade e Estado.');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('O e-mail informado não é válido. Verifique e tente novamente.');
      return;
    }

    const isProfissional = document.querySelector('.radio-profissional[value="sim"]').checked;
    const isVoluntario = document.querySelector('[name="is_voluntario"][value="sim"]').checked;

    const profissoesSelecionadas = [];
    if (isProfissional) {
      document.querySelectorAll('[name="profissoes"]:checked').forEach(cb => {
        profissoesSelecionadas.push(cb.value);
      });
    }
    const outraProfissao = document.getElementById('cad-outra-profissao').value.trim();

    try {
      const resultado = window.atosDB.createOrUpdatePessoa({
        nome,
        whatsapp,
        email,
        cidade,
        estado,
        data_nascimento: dataNasc,
        profissional: isProfissional,
        profissoes_areas: profissoesSelecionadas,
        outra_profissao: outraProfissao,
        voluntario: isVoluntario
      });

      // Registra interesse automático na edição de origem, se houver
      const edicaoOrigem = document.getElementById('cadastro-edicao-origem').value;
      if (edicaoOrigem) {
        try {
          window.atosDB.manifestarInteresse(resultado.pessoa.id, edicaoOrigem);
        } catch {}
      }

      fecharTodosModais();

      if (resultado.isNovo) {
        mostrarFeedback(
          'CADASTRO REALIZADO!',
          edicaoOrigem
            ? 'Seus dados foram registrados e seu interesse na missão foi registrado automaticamente! Em breve teremos mais informações.'
            : 'Agora você faz parte da nossa rede de voluntários. Quando uma nova edição estiver disponível, você poderá manifestar seu interesse diretamente pelo site.',
          'user-check',
          'green'
        );
      } else {
        mostrarFeedback(
          'DADOS ATUALIZADOS!',
          'Seus dados foram atualizados com sucesso.' + (edicaoOrigem ? ' Seu interesse na missão também foi registrado!' : ''),
          'check-circle',
          'cacto'
        );
      }

      // Atualiza os cards para refletir o novo status
      setTimeout(() => renderEdicoesPublicas(), 200);

    } catch (err) {
      alert(err.message);
    }
  });
}

function initBtnAbrirCadastroGeral() {
  const btn = document.getElementById('btn-abrir-cadastro-geral');
  if (btn) {
    btn.addEventListener('click', () => {
      const usuarioAtual = window.atosDB.getCurrentUser();
      if (usuarioAtual) {
        mostrarFeedback(
          'Você já está cadastrado!',
          `Olá, ${usuarioAtual.nome.split(' ')[0]}! Você já faz parte da nossa rede de voluntários. Fique de olho nas próximas edições!`,
          'user-check',
          'cacto'
        );
      } else {
        abrirModalCadastro();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   5. BUSCA RÁPIDA POR WHATSAPP (identifica cadastro existente)
   -------------------------------------------------------------------------- */
function initBuscarWhats() {
  const btnBuscar = document.getElementById('btn-buscar-whats');
  const inputWhats = document.getElementById('input-buscar-whats');
  if (!btnBuscar || !inputWhats) return;

  const realizar = () => {
    const valor = inputWhats.value.trim();
    if (!valor) {
      alert('Digite seu WhatsApp para buscá-lo.');
      return;
    }
    const pessoa = window.atosDB.getPessoaByWhatsapp(valor);
    if (pessoa) {
      // Preenche o formulário com dados existentes
      document.getElementById('cad-nome').value = pessoa.nome;
      document.getElementById('cad-whatsapp').value = pessoa.whatsapp;
      document.getElementById('cad-email').value = pessoa.email || '';
      document.getElementById('cad-cidade').value = pessoa.cidade;
      document.getElementById('cad-estado').value = pessoa.estado;
      document.getElementById('cad-data-nasc').value = pessoa.data_nascimento || '';
      document.getElementById('cad-outra-profissao').value = pessoa.outra_profissao || '';

      if (pessoa.profissional) {
        document.querySelector('.radio-profissional[value="sim"]').checked = true;
        document.getElementById('secao-profissoes').classList.remove('hidden');
        document.querySelectorAll('[name="profissoes"]').forEach(cb => {
          cb.checked = (pessoa.profissoes_areas || []).includes(cb.value);
        });
      } else {
        document.querySelector('.radio-profissional[value="nao"]').checked = true;
        document.getElementById('secao-profissoes').classList.add('hidden');
      }

      if (pessoa.voluntario) {
        document.querySelector('[name="is_voluntario"][value="sim"]').checked = true;
      } else {
        document.querySelector('[name="is_voluntario"][value="nao"]').checked = true;
      }

      inputWhats.style.borderColor = '#2E7D32';
      inputWhats.title = '✓ Dados encontrados e preenchidos!';
      alert(`✓ Olá, ${pessoa.nome.split(' ')[0]}! Seus dados foram encontrados e preenchidos automaticamente. Confirme ou atualize antes de enviar.`);
    } else {
      inputWhats.style.borderColor = '#F57C00';
      alert('WhatsApp não encontrado. Você pode preencher seus dados abaixo para fazer seu cadastro.');
      document.getElementById('cad-whatsapp').value = valor;
      document.getElementById('cad-nome').focus();
    }
  };

  btnBuscar.addEventListener('click', realizar);
  inputWhats.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); realizar(); }
  });
}

/* --------------------------------------------------------------------------
   6. SINCRONIZAÇÃO DINÂMICA DE IMPACTO & AGENDA COM O SITE PÚBLICO
   -------------------------------------------------------------------------- */
function syncPublicContentFromDB() {
  if (!window.atosDB) return;

  // 1. Sincronizar Indicadores de Impacto
  try {
    const impactos = window.atosDB.getImpacto ? window.atosDB.getImpacto().filter(i => i.ativo) : [];
    const gridContadores = document.querySelector('#impacto .grid');
    if (gridContadores && impactos.length > 0) {
      gridContadores.innerHTML = '';
      impactos.forEach(imp => {
        const div = document.createElement('div');
        div.className = 'card-atos p-7 text-center relative overflow-hidden group';
        div.innerHTML = `
          <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-chama/10 flex items-center justify-center text-chama group-hover:scale-110 transition-transform">
            <i data-lucide="${imp.icone || 'sparkles'}" class="w-7 h-7"></i>
          </div>
          <div class="font-display text-5xl sm:text-6xl text-carvao mb-1">
            <span class="counter-value" data-target="${imp.valor}">0</span>${imp.sufixo || ''}
          </div>
          <h3 class="font-bold text-base text-chama uppercase tracking-wide mb-1">${imp.titulo}</h3>
          <p class="text-xs sm:text-sm text-carvao/70">
            ${imp.descricao || ''}
          </p>
        `;
        gridContadores.appendChild(div);
      });
      if (typeof initCounters === 'function') initCounters();
    }
  } catch (e) {
    console.warn('Erro ao sincronizar impactos:', e);
  }

  // 2. Sincronizar Agenda na Seção de Assessoria
  try {
    const agenda = window.atosDB.getAgenda ? window.atosDB.getAgenda().filter(a => a.status !== 'Cancelado') : [];
    const agendaSection = document.getElementById('agenda-assessoria');
    if (agendaSection && agenda.length > 0) {
      let containerEventos = document.getElementById('public-agenda-eventos');
      if (!containerEventos) {
        containerEventos = document.createElement('div');
        containerEventos.id = 'public-agenda-eventos';
        containerEventos.className = 'max-w-5xl mx-auto mt-12 pt-10 border-t border-areia';
        containerEventos.innerHTML = `
          <div class="text-center mb-8">
            <span class="text-xs font-bold uppercase tracking-widest text-cacto block mb-1">CALENDÁRIO DE MISSÕES</span>
            <h3 class="font-display text-3xl sm:text-4xl text-carvao">PRÓXIMOS COMPROMISSOS &amp; AÇÕES</h3>
          </div>
          <div id="lista-eventos-publicos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        `;
        const innerContainer = agendaSection.querySelector('.max-w-7xl');
        if (innerContainer) innerContainer.appendChild(containerEventos);
      }

      const lista = document.getElementById('lista-eventos-publicos');
      if (lista) {
        lista.innerHTML = '';
        agenda.slice(0, 6).forEach(item => {
          let dataFmt = item.data;
          try {
            const p = item.data.split('-');
            if (p.length === 3) {
              const m = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
              dataFmt = `${p[2]} ${m[parseInt(p[1]) - 1]} ${p[0]}`;
            }
          } catch {}

          const el = document.createElement('div');
          el.className = 'bg-white rounded-2xl p-6 border border-areia shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4';
          el.innerHTML = `
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[0.7rem] font-bold uppercase tracking-wider text-chama bg-chama/10 px-2.5 py-0.5 rounded-full">
                  ${item.categoria || 'Ação'}
                </span>
                <span class="text-xs text-carvao/60 flex items-center gap-1 font-semibold">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-cacto"></i>
                  ${dataFmt}
                </span>
              </div>
              <h4 class="font-display text-2xl text-carvao leading-tight">${item.titulo}</h4>
              <p class="text-xs text-carvao/70 leading-relaxed">${item.descricao || ''}</p>
            </div>
            <div class="pt-3 border-t border-areia/50 text-xs text-carvao/60 flex items-center justify-between">
              <span class="flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-chama"></i>
                <span class="truncate max-w-[140px]">${item.local || 'A definir'}</span>
              </span>
              <span class="font-semibold text-cacto">${item.horario || ''}</span>
            </div>
          `;
          lista.appendChild(el);
        });
      }
    }
  } catch (e) {
    console.warn('Erro ao sincronizar agenda pública:', e);
  }

  // 3. Atualizar ícones
  if (window.lucide) lucide.createIcons();
}


/* --------------------------------------------------------------------------
   NOVO: FLUXO DE PAGAMENTO & INSCRIÇÃO COMPLETA
   -------------------------------------------------------------------------- */
let edicaoEmInscricao = null;
let comprovanteBase64 = null;

function abrirModalPagamentoInscricao(usuario, edicao) {
  edicaoEmInscricao = edicao;
  comprovanteBase64 = null;

  const modal = document.getElementById('modal-inscricao-pagamento');
  if (!modal) return;

  const nomeEd = document.getElementById('pagamento-edicao-nome');
  const valorEd = document.getElementById('pagamento-valor');
  const chavePix = document.getElementById('inscricao-pix-chave');
  const favPix = document.getElementById('inscricao-pix-favorecido');
  const fileInput = document.getElementById('input-comprovante-pagamento');
  const feedbackPix = document.getElementById('inscricao-pix-feedback');

  if (nomeEd) nomeEd.textContent = `${edicao.nome} (${edicao.cidade} - ${edicao.estado})`;
  if (valorEd) valorEd.textContent = `R$ ${parseFloat(edicao.valor_inscricao || 0).toFixed(2).replace('.', ',')}`;
  if (chavePix) chavePix.value = edicao.chave_pix || 'projetoatosoficial@gmail.com';
  if (favPix) favPix.textContent = edicao.favorecido_pix || 'Projeto ATOS • ADPB Palmeira';
  if (fileInput) fileInput.value = '';
  if (feedbackPix) feedbackPix.classList.add('hidden');

  // Opção de Camisa
  const boxCamisa = document.getElementById('box-camisa-opcao');
  const checkCamisa = document.getElementById('check-comprar-camisa');
  const camisaValorLbl = document.getElementById('camisa-valor-label');
  const boxTam = document.getElementById('box-tamanho-camisa');
  const selectTam = document.getElementById('select-tamanho-camisa');

  if (boxCamisa) {
    if (edicao.tem_camisa) {
      boxCamisa.classList.remove('hidden');
      if (camisaValorLbl) camisaValorLbl.textContent = `+ R$ ${parseFloat(edicao.valor_camisa || 35).toFixed(2).replace('.', ',')}`;
      if (checkCamisa) checkCamisa.checked = false;
      if (boxTam) boxTam.classList.add('hidden');

      if (selectTam && edicao.tamanhos_camisa) {
        selectTam.innerHTML = '';
        edicao.tamanhos_camisa.split(',').forEach(tam => {
          const opt = document.createElement('option');
          opt.value = tam.trim();
          opt.textContent = `Tamanho ${tam.trim()}`;
          selectTam.appendChild(opt);
        });
      }
    } else {
      boxCamisa.classList.add('hidden');
    }
  }

  abrirModal('modal-inscricao-pagamento');
}

function initPagamentoInscricaoModule() {
  const btnCopiar = document.getElementById('btn-copiar-pix-inscricao');
  const chavePix = document.getElementById('inscricao-pix-chave');
  const feedbackPix = document.getElementById('inscricao-pix-feedback');
  const fileInput = document.getElementById('input-comprovante-pagamento');
  const btnFinalizar = document.getElementById('btn-finalizar-inscricao-paga');
  const checkCamisa = document.getElementById('check-comprar-camisa');
  const boxTam = document.getElementById('box-tamanho-camisa');

  if (checkCamisa && boxTam) {
    checkCamisa.addEventListener('change', () => {
      if (checkCamisa.checked) boxTam.classList.remove('hidden');
      else boxTam.classList.add('hidden');
    });
  }

  if (btnCopiar && chavePix) {
    btnCopiar.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(chavePix.value);
        if (feedbackPix) {
          feedbackPix.classList.remove('hidden');
          setTimeout(() => feedbackPix.classList.add('hidden'), 3500);
        }
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo selecionado é muito grande. Escolha um arquivo de até 5MB.');
        fileInput.value = '';
        comprovanteBase64 = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        comprovanteBase64 = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      if (!edicaoEmInscricao) return;

      const usuario = window.atosDB.getCurrentUser();
      if (!usuario) {
        alert('Sessão expirada. Preencha seus dados novamente.');
        fecharTodosModais();
        return;
      }

      if (edicaoEmInscricao.exige_comprovante && !comprovanteBase64) {
        alert('Por favor, anexe a foto ou PDF do comprovante do pagamento PIX para prosseguir.');
        return;
      }

      const querCamisa = checkCamisa ? checkCamisa.checked : false;
      const selectTam = document.getElementById('select-tamanho-camisa');
      const tamCamisa = querCamisa && selectTam ? selectTam.value : '';

      try {
        window.atosDB.createInscricao({
          edicao_id: edicaoEmInscricao.id,
          pessoa_id: usuario.id,
          nome: usuario.nome,
          whatsapp: usuario.whatsapp,
          email: usuario.email || '',
          cidade: usuario.cidade,
          estado: usuario.estado,
          profissao: usuario.outra_profissao || (usuario.profissoes_areas ? usuario.profissoes_areas.join(', ') : ''),
          comprovante: comprovanteBase64 || '',
          quer_camisa: querCamisa,
          tamanho_camisa: tamCamisa
        });

        fecharTodosModais();
        abrirTelaInscricaoConcluida({
          status: 'analise',
          edicao: edicaoEmInscricao
        });
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function abrirTelaInscricaoConcluida({ status, edicao }) {
  const modal = document.getElementById('modal-inscricao-finalizada');
  if (!modal) return;

  const icoEl = document.getElementById('final-status-icone');
  const tagEl = document.getElementById('final-tag');
  const titEl = document.getElementById('final-titulo');
  const msgEl = document.getElementById('final-mensagem');
  const boxGrupo = document.getElementById('box-botao-grupo');
  const btnGrupo = document.getElementById('btn-entrar-grupo-edicao');

  if (status === 'analise') {
    if (icoEl) icoEl.className = 'w-20 h-20 mx-auto rounded-3xl bg-yellow-100 text-yellow-700 flex items-center justify-center shadow-inner';
    if (tagEl) {
      tagEl.textContent = 'Aguardando Aprovação';
      tagEl.className = 'text-xs font-bold uppercase tracking-widest text-chama block';
    }
    if (titEl) titEl.textContent = 'INSCRIÇÃO EM ANÁLISE!';
    if (msgEl) msgEl.textContent = 'Seu comprovante foi enviado e está sendo analisado pela nossa equipe. Assim que aprovado, o link do grupo da edição será enviado para o seu WhatsApp!';
    if (boxGrupo) boxGrupo.classList.add('hidden');
  } else {
    // Inscrição Gratuita Concluída Imediatamente
    if (icoEl) icoEl.className = 'w-20 h-20 mx-auto rounded-3xl bg-green-100 text-green-700 flex items-center justify-center shadow-inner';
    if (tagEl) {
      tagEl.textContent = 'Inscrição Confirmada';
      tagEl.className = 'text-xs font-bold uppercase tracking-widest text-cacto block';
    }
    if (titEl) titEl.textContent = 'INSCRIÇÃO CONCLUÍDA!';
    if (msgEl) msgEl.textContent = 'Sua inscrição foi confirmada com sucesso! Entre agora mesmo no grupo oficial da missão para receber as orientações da coordenação.';
    
    if (boxGrupo && btnGrupo) {
      if (edicao && edicao.link_grupo) {
        btnGrupo.href = edicao.link_grupo;
        boxGrupo.classList.remove('hidden');
      } else {
        boxGrupo.classList.add('hidden');
      }
    }
  }

  abrirModal('modal-inscricao-finalizada');
  if (window.lucide) lucide.createIcons();
}

// Inicia módulo de pagamento ao carregar
document.addEventListener('DOMContentLoaded', () => {
  initPagamentoInscricaoModule();
});


// Listener para atualizacao em tempo real quando edicoes mudarem na nuvem
window.addEventListener('atos_dados_sincronizados', () => {
  renderEdicoesPublicas();
  syncPublicContentFromDB();
});
