/**
 * PROJETO ATOS — Serviço de E-mail
 * Integração com serviço real (EmailJS / API de Mensageria) para envio de e-mails
 * de confirmação de participação, com controle rigoroso de idempotência, logs e auditoria.
 *
 * Configuração:
 * As credenciais podem ser definidas diretamente aqui ou através do painel
 * administrativo em "Configurações > Serviço de E-mail".
 */

const EMAILJS_DEFAULT_CONFIG = {
  PUBLIC_KEY:   'COLE_SUA_PUBLIC_KEY_AQUI',
  SERVICE_ID:   'COLE_SEU_SERVICE_ID_AQUI',
  TEMPLATE_ID:  'COLE_SEU_TEMPLATE_ID_AQUI',
};

const EMAIL_STORAGE_KEYS = {
  CONFIG: 'atos_email_config',
  LOGS:   'atos_email_logs'
};

window.AtosEmailService = {
  _emProcessamento: new Set(),

  getConfig() {
    try {
      const salvo = localStorage.getItem(EMAIL_STORAGE_KEYS.CONFIG);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed && typeof parsed === 'object') {
          return {
            PUBLIC_KEY:  (parsed.PUBLIC_KEY || '').trim(),
            SERVICE_ID:  (parsed.SERVICE_ID || '').trim(),
            TEMPLATE_ID: (parsed.TEMPLATE_ID || '').trim(),
          };
        }
      }
    } catch { /* fallback */ }

    // Fallback para DB global ou constantes locais
    try {
      if (window.atosDB) {
        const dbCfg = window.atosDB.getConfig();
        if (dbCfg && dbCfg.email_service) {
          return {
            PUBLIC_KEY:  (dbCfg.email_service.public_key || '').trim(),
            SERVICE_ID:  (dbCfg.email_service.service_id || '').trim(),
            TEMPLATE_ID: (dbCfg.email_service.template_id || '').trim(),
          };
        }
      }
    } catch { /* fallback */ }

    return EMAILJS_DEFAULT_CONFIG;
  },

  salvarConfig(novasCredenciais) {
    const configAtualizada = {
      PUBLIC_KEY:   (novasCredenciais.PUBLIC_KEY || novasCredenciais.public_key || '').trim(),
      SERVICE_ID:   (novasCredenciais.SERVICE_ID || novasCredenciais.service_id || '').trim(),
      TEMPLATE_ID:  (novasCredenciais.TEMPLATE_ID || novasCredenciais.template_id || '').trim(),
      atualizado_em: new Date().toISOString()
    };
    try {
      localStorage.setItem(EMAIL_STORAGE_KEYS.CONFIG, JSON.stringify(configAtualizada));
      if (window.atosDB) {
        const cfg = window.atosDB.getConfig();
        cfg.email_service = {
          public_key: configAtualizada.PUBLIC_KEY,
          service_id: configAtualizada.SERVICE_ID,
          template_id: configAtualizada.TEMPLATE_ID,
          atualizado_em: configAtualizada.atualizado_em
        };
        window.atosDB.updateConfig(cfg);
        window.atosDB.registrarLog('Configurações', 'Credenciais do serviço de e-mail atualizadas.');
      }
      this.init();
      return { sucesso: true };
    } catch (e) {
      return { sucesso: false, erro: e.message };
    }
  },

  _configurado() {
    const cfg = this.getConfig();
    return Boolean(
      cfg.PUBLIC_KEY &&
      cfg.SERVICE_ID &&
      cfg.TEMPLATE_ID &&
      !cfg.PUBLIC_KEY.includes('COLE_') &&
      !cfg.SERVICE_ID.includes('COLE_') &&
      !cfg.TEMPLATE_ID.includes('COLE_')
    );
  },

  _getLogs() {
    try {
      return JSON.parse(localStorage.getItem(EMAIL_STORAGE_KEYS.LOGS)) || [];
    } catch {
      return [];
    }
  },

  _salvarLog(entrada) {
    try {
      const logs = this._getLogs();
      logs.unshift(entrada);
      if (logs.length > 500) logs.pop();
      localStorage.setItem(EMAIL_STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('[EmailService] Erro ao salvar log:', e);
    }
  },

  _jaEnviado(participacaoId, tipo = 'confirmacao_participacao') {
    const logs = this._getLogs();
    return logs.find(
      l => l.participacao_id === participacaoId &&
           l.tipo === tipo &&
           l.status === 'enviado'
    ) || null;
  },

  init() {
    const cfg = this.getConfig();
    if (typeof emailjs !== 'undefined' && this._configurado()) {
      try {
        emailjs.init({ publicKey: cfg.PUBLIC_KEY });
        console.log('[EmailService] EmailJS inicializado com sucesso.');
      } catch (err) {
        console.warn('[EmailService] Erro ao inicializar EmailJS:', err);
      }
    } else {
      console.warn('[EmailService] Serviço de e-mail aguardando configuração de credenciais.');
    }
  },

  /**
   * Envia e-mail de confirmação de presença/participação.
   * Não simula no frontend: dispara chamada real ao backend/EmailJS.
   * Proteção total contra múltiplos cliques acidentais e idempotência estrita.
   */
  async enviarConfirmacaoParticipacao(dados) {
    const {
      participacaoId,
      tipo = 'confirmacao_participacao',
      nomeParticipante,
      emailParticipante,
      edicaoNome,
      edicaoData,
      edicaoLocal,
      forcarReenvio = false
    } = dados;

    // 1. Proteção contra múltiplos cliques concorrentes (em processamento ativo)
    if (this._emProcessamento.has(participacaoId)) {
      return {
        sucesso: false,
        bloqueadoPorDuplicacao: true,
        erro: 'Já existe um envio em processamento para este participante. Aguarde a finalização.'
      };
    }

    this._emProcessamento.add(participacaoId);

    try {
      // 2. Validação estrita do e-mail realmente cadastrado
      const emailLimpo = (emailParticipante || '').trim().toLowerCase();
      if (!emailLimpo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
        return {
          sucesso: false,
          erro: `E-mail inválido ou ausente para o participante "${nomeParticipante}". Verifique o cadastro antes de enviar.`
        };
      }

      // 3. Controle de Idempotência — não reenvia se já teve sucesso, exceto se solicitado explicitamente
      if (!forcarReenvio) {
        const envioAnterior = this._jaEnviado(participacaoId, tipo);
        if (envioAnterior) {
          const dataEnvio = new Date(envioAnterior.enviado_em).toLocaleString('pt-BR');
          return {
            sucesso: false,
            jaEnviado: true,
            erro: `O e-mail de confirmação já foi enviado em ${dataEnvio} para ${envioAnterior.email_destino}.`,
            logAnterior: envioAnterior
          };
        }
      }

      // 4. Verificar se o serviço está configurado no sistema
      const cfg = this.getConfig();
      if (!this._configurado()) {
        const logId = 'email-' + Date.now();
        const logEntrada = {
          id: logId,
          participacao_id: participacaoId,
          tipo,
          email_destino: emailLimpo,
          nome_destino: nomeParticipante,
          edicao: edicaoNome || 'Edição ATOS',
          enviado_em: new Date().toISOString(),
          status: 'nao_configurado',
          erro: 'Credenciais do serviço de e-mail (EmailJS) não configuradas no sistema.'
        };
        this._salvarLog(logEntrada);

        if (window.atosDB) {
          window.atosDB.registrarLog('E-mail Falha', `Tentativa de envio para ${nomeParticipante} <${emailLimpo}> falhou: serviço não configurado.`);
        }

        // Informar erro real sem mascarar
        return {
          sucesso: false,
          erro: 'O serviço de e-mail não está configurado. Por favor, cadastre as credenciais em Configurações > Serviço de E-mail.'
        };
      }

      // 5. Verificar se a biblioteca EmailJS está carregada no ambiente
      if (typeof emailjs === 'undefined') {
        const logId = 'email-' + Date.now();
        const logEntrada = {
          id: logId,
          participacao_id: participacaoId,
          tipo,
          email_destino: emailLimpo,
          nome_destino: nomeParticipante,
          edicao: edicaoNome || 'Edição ATOS',
          enviado_em: new Date().toISOString(),
          status: 'falha',
          erro: 'Biblioteca do provedor de e-mail não carregada no navegador.'
        };
        this._salvarLog(logEntrada);

        return {
          sucesso: false,
          erro: 'Biblioteca do serviço de e-mail (EmailJS) indisponível. Verifique sua conexão com a internet.'
        };
      }

      // 6. E-mail de resposta oficial
      let emailOficial = 'projetoatosoficial@gmail.com';
      try {
        if (window.atosDB) {
          const c = window.atosDB.getConfig();
          if (c && c.email_oficial) emailOficial = c.email_oficial;
        }
      } catch { /* usa padrao */ }

      // 7. Chamada real ao backend do serviço de e-mail
      const logId = 'email-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const templateParams = {
        to_email:     emailLimpo,
        to_name:      nomeParticipante,
        edicao_nome:  edicaoNome || 'Missão Projeto ATOS',
        edicao_data:  edicaoData || 'A confirmar',
        edicao_local: edicaoLocal || 'Sertão - PB',
        reply_to:     emailOficial,
        status:       'Confirmada',
        mensagem:     `Sua presença na missão "${edicaoNome || 'Projeto ATOS'}" foi confirmada oficialmente pela coordenação do projeto.`
      };

      try {
        const respostaServico = await emailjs.send(cfg.SERVICE_ID, cfg.TEMPLATE_ID, templateParams);
        const dataEnvioISO = new Date().toISOString();

        // 8. Registrar envio com sucesso
        const logSucesso = {
          id: logId,
          participacao_id: participacaoId,
          tipo,
          email_destino: emailLimpo,
          nome_destino: nomeParticipante,
          edicao: edicaoNome || 'Edição ATOS',
          enviado_em: dataEnvioISO,
          status: 'enviado',
          erro: null,
          resposta_status: respostaServico?.status || 200
        };
        this._salvarLog(logSucesso);

        // Registrar na auditoria geral
        if (window.atosDB) {
          window.atosDB.registrarLog(
            'E-mail Enviado',
            `Confirmação de presença enviada para ${nomeParticipante} <${emailLimpo}> — ${edicaoNome || 'Missão'}`
          );
        }

        return {
          sucesso: true,
          logId,
          enviadoEm: dataEnvioISO,
          emailDestino: emailLimpo
        };

      } catch (err) {
        // 9. Não mascarar o erro do backend / provedor
        const mensagemErro = err?.text || err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
        const dataFalhaISO = new Date().toISOString();

        const logFalha = {
          id: logId,
          participacao_id: participacaoId,
          tipo,
          email_destino: emailLimpo,
          nome_destino: nomeParticipante,
          edicao: edicaoNome || 'Edição ATOS',
          enviado_em: dataFalhaISO,
          status: 'falha',
          erro: mensagemErro
        };
        this._salvarLog(logFalha);

        if (window.atosDB) {
          window.atosDB.registrarLog(
            'E-mail Falha',
            `Falha no envio de confirmação para ${nomeParticipante} <${emailLimpo}>: ${mensagemErro}`
          );
        }

        console.error('[EmailService] Falha no envio do e-mail:', err);

        return {
          sucesso: false,
          erro: `Falha no serviço de e-mail: ${mensagemErro}`,
          detalhes: err
        };
      }

    } finally {
      // Libera o lock de processamento
      this._emProcessamento.delete(participacaoId);
    }
  },

  /**
   * Reenvia confirmação permitindo forçar o reenvio explicitamente.
   */
  async reenviarConfirmacao(dados) {
    return this.enviarConfirmacaoParticipacao({
      ...dados,
      forcarReenvio: true
    });
  },

  /**
   * Testa a conexão do serviço enviando um e-mail de teste.
   */
  async testarConexao(emailDestino) {
    if (!this._configurado()) {
      return { sucesso: false, erro: 'Preencha Service ID, Template ID e Public Key antes de testar.' };
    }
    if (typeof emailjs === 'undefined') {
      return { sucesso: false, erro: 'Biblioteca EmailJS não carregada.' };
    }

    const cfg = this.getConfig();
    try {
      emailjs.init({ publicKey: cfg.PUBLIC_KEY });
      const res = await emailjs.send(cfg.SERVICE_ID, cfg.TEMPLATE_ID, {
        to_email:     emailDestino,
        to_name:      'Administrador do Projeto ATOS',
        edicao_nome:  'Teste de Integração',
        edicao_data:  new Date().toLocaleDateString('pt-BR'),
        edicao_local: 'Painel Administrativo',
        reply_to:     'projetoatosoficial@gmail.com',
        status:       'Teste Concluído',
        mensagem:     'Este é um e-mail de teste para verificar a integração do serviço de e-mail do Projeto ATOS.'
      });
      return { sucesso: true, resposta: res };
    } catch (err) {
      const msg = err?.text || err?.message || String(err);
      return { sucesso: false, erro: msg };
    }
  },

  getLogs() {
    return this._getLogs();
  },

  getLogByParticipacao(participacaoId, tipo) {
    const logs = this._getLogs();
    return logs.filter(l => l.participacao_id === participacaoId && (!tipo || l.tipo === tipo));
  },

  getUltimoLogByParticipacao(participacaoId, tipo) {
    const logs = this.getLogByParticipacao(participacaoId, tipo);
    return logs.length > 0 ? logs[0] : null;
  }
};

// Inicialização automática
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.AtosEmailService.init());
} else {
  window.AtosEmailService.init();
}
