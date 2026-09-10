/**
 * PROJETO ATOS — Configuração de Conexão com o Banco de Dados Supabase (Nuvem)
 *
 * Conexão ativa com o projeto Supabase oficial em tempo real.
 */

const SUPABASE_CONFIG = {
  // Project URL:
  SUPABASE_URL: 'https://lontvasplrtzcvzshvzi.supabase.co',

  // Project API Key (anon / public):
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvbnR2YXNwbHJ0emN2enNodnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDEzMTYsImV4cCI6MjEwNDU3NzMxNn0.3e_3nIa-9Ca_8viy0lAwPBr757igvkHxKj8wJE1A3zM'
};

// Inicialização automática do cliente Supabase
let supabaseClient = null;

function initSupabase() {
  if (
    typeof window.supabase !== 'undefined' &&
    SUPABASE_CONFIG.SUPABASE_URL &&
    SUPABASE_CONFIG.SUPABASE_ANON_KEY &&
    SUPABASE_CONFIG.SUPABASE_URL.startsWith('http')
  ) {
    try {
      supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.SUPABASE_URL,
        SUPABASE_CONFIG.SUPABASE_ANON_KEY
      );
      console.log('⚡ [Projeto ATOS] Banco de Dados em Nuvem (Supabase) CONECTADO em tempo real!');
      return supabaseClient;
    } catch (err) {
      console.warn('⚠️ [Projeto ATOS] Erro ao inicializar Supabase:', err);
    }
  } else {
    console.log('ℹ️ [Projeto ATOS] Modo Local ativo.');
  }
  return null;
}

// Verifica se a conexão com a nuvem está pronta
function isSupabaseConfigured() {
  return (
    supabaseClient !== null &&
    Boolean(SUPABASE_CONFIG.SUPABASE_URL) &&
    Boolean(SUPABASE_CONFIG.SUPABASE_ANON_KEY)
  );
}

// Expõe globalmente
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.initSupabase = initSupabase;
window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabase = () => supabaseClient || initSupabase();
