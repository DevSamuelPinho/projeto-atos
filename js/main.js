/**
 * PROJETO ATOS — Lógica Interativa Oficial
 * Pregação do Evangelho e Obras Sociais
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  syncDynamicImpactCounters();
  initCounters();
  initComoAtuamosCarousel();
  initFloatingButtonScroll();
  initTabs();
  initLightbox();
  initPixCopy();
  initVideoPlayers();
});

// Atualiza o site quando os dados forem sincronizados em tempo real com o Supabase
window.addEventListener('atos_dados_sincronizados', () => {
  syncDynamicImpactCounters();
});

/* --------------------------------------------------------------------------
   1. NAVBAR & MENU MOBILE COM SUPORTE A DROPDOWNS E ACORDEÕES
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('main-navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const accordionBtns = mobileMenu ? mobileMenu.querySelectorAll('.mobile-accordion-btn') : [];

  // Sombra e fundo ao rolar a página
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('bg-white/95', 'backdrop-blur-md', 'shadow-md');
      navbar.classList.remove('bg-white/80', 'bg-white/90');
    } else {
      navbar.classList.remove('bg-white/95', 'backdrop-blur-md', 'shadow-md');
      navbar.classList.add('bg-white/90');
    }
  });

  // Toggle do menu mobile
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });

    // Fecha ao clicar em links (navegação por âncora)
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Acordeões dentro do menu mobile
    accordionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const content = btn.nextElementSibling;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', !isExpanded);
        if (content) {
          content.classList.toggle('open');
        }
      });
    });

    // Fechar ao clicar fora do navbar
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Fechar ao pressionar a tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   2. SINCRONIZAÇÃO DINÂMICA DE INDICADORES DE IMPACTO (EDIÇÕES FINALIZADAS)
   -------------------------------------------------------------------------- */
function syncDynamicImpactCounters() {
  if (!window.atosDB) return;

  try {
    const dinamicos = window.atosDB.getIndicadoresDinamicos();
    const impactos = window.atosDB.getImpacto();
    const impPessoas = impactos.find(i => i.chave === 'pessoas_alcancadas');
    const totalPessoas = impPessoas ? Number(impPessoas.valor) : 6500;
    const sufixoPessoas = (impPessoas && impPessoas.sufixo !== undefined) ? impPessoas.sufixo : '+';

    // 1. Atualiza os números no Hero / Início
    const heroAcoes = document.getElementById('hero-count-acoes');
    const heroLoc = document.getElementById('hero-count-localidades');
    const heroNac = document.getElementById('hero-count-nacoes');
    const heroPessoas = document.getElementById('hero-count-pessoas');

    if (heroAcoes) heroAcoes.textContent = dinamicos.acoes_realizadas;
    if (heroLoc) heroLoc.textContent = dinamicos.cidades_atendidas;
    if (heroNac) heroNac.textContent = dinamicos.paises_atendidos;
    if (heroPessoas) heroPessoas.textContent = totalPessoas.toLocaleString('pt-BR') + sufixoPessoas;

    // 2. Atualiza os targets dos contadores animados na Seção Impacto
    const impAcoes = document.getElementById('impacto-count-acoes');
    const impLoc = document.getElementById('impacto-count-localidades');
    const impNac = document.getElementById('impacto-count-nacoes');
    const impPessoasEl = document.getElementById('impacto-count-pessoas');
    const impPessoasSufixo = document.getElementById('impacto-sufixo-pessoas');

    if (impAcoes) impAcoes.setAttribute('data-target', dinamicos.acoes_realizadas);
    if (impLoc) impLoc.setAttribute('data-target', dinamicos.cidades_atendidas);
    if (impNac) impNac.setAttribute('data-target', dinamicos.paises_atendidos);
    if (impPessoasEl) impPessoasEl.setAttribute('data-target', totalPessoas);
    if (impPessoasSufixo) impPessoasSufixo.textContent = sufixoPessoas;

    // 3. Atualiza Chave PIX do site a partir da configuração oficial
    const cfg = window.atosDB.getConfig();
    const pixInput = document.getElementById('pix-key-input');
    if (pixInput && cfg.pix_oficial) {
      pixInput.value = cfg.pix_oficial;
    }

    // 4. Renderiza Localidades Atendidas dinamicamente a partir das edições
    renderLocalidadesAtendidas();
  } catch (err) {
    console.warn('Erro ao sincronizar indicadores dinâmicos:', err);
  }
}

/* --------------------------------------------------------------------------
   NOVO: RENDERIZAÇÃO DINÂMICA DE LOCALIDADES ATENDIDAS VIA EDIÇÕES (BANCO)
   -------------------------------------------------------------------------- */
function renderLocalidadesAtendidas() {
  const containerBrasil = document.getElementById('localidades-atendidas-brasil');
  const containerExpansao = document.getElementById('localidades-atendidas-expansao');
  const badgeBrasil = document.getElementById('badge-acoes-brasil');
  const badgeExpansao = document.getElementById('badge-acoes-expansao');

  if (!containerBrasil || !window.atosDB) return;

  const edicoes = window.atosDB.getEdicoes();

  const cidadesBrasilSet = new Set();
  const cidadesExpansaoSet = new Set();
  let totalAcoesBrasil = 0;
  let totalAcoesExpansao = 0;

  edicoes.forEach(ed => {
    if (ed.status === 'Cancelada') return;

    const pais = (ed.pais || 'Brasil').trim().toLowerCase();
    const cidade = (ed.cidade || '').trim();
    if (!cidade) return;

    if (pais === 'brasil') {
      cidadesBrasilSet.add(cidade);
      totalAcoesBrasil++;
    } else {
      cidadesExpansaoSet.add(cidade);
      totalAcoesExpansao++;
    }
  });

  // Renderiza Cidades do Brasil
  containerBrasil.innerHTML = '';
  const cidadesBrasil = Array.from(cidadesBrasilSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  if (cidadesBrasil.length === 0) {
    containerBrasil.innerHTML = '<span class="text-xs text-carvao/60 italic">Nenhuma localidade cadastrada ainda.</span>';
  } else {
    cidadesBrasil.forEach(cidade => {
      const span = document.createElement('span');
      span.className = 'badge-cidade';
      span.textContent = `📍 ${cidade}`;
      containerBrasil.appendChild(span);
    });
  }
  if (badgeBrasil) {
    badgeBrasil.textContent = `${totalAcoesBrasil} ${totalAcoesBrasil === 1 ? 'AÇÃO' : 'AÇÕES'}`;
  }

  // Renderiza Cidades de Expansão / Internacional
  if (containerExpansao) {
    containerExpansao.innerHTML = '';
    const cidadesExpansao = Array.from(cidadesExpansaoSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (cidadesExpansao.length === 0) {
      containerExpansao.innerHTML = '<span class="text-xs text-carvao/60 italic">Novas missões em planejamento.</span>';
    } else {
      cidadesExpansao.forEach(cidade => {
        const span = document.createElement('span');
        span.className = 'badge-cidade';
        span.style.backgroundColor = 'var(--color-chama)';
        span.textContent = `📍 ${cidade}`;
        containerExpansao.appendChild(span);
      });
    }
    if (badgeExpansao) {
      badgeExpansao.textContent = totalAcoesExpansao > 0
        ? `${totalAcoesExpansao} ${totalAcoesExpansao === 1 ? 'AÇÃO' : 'AÇÕES'}`
        : 'EM PLANEJAMENTO';
    }
  }
}

function initCounters() {
  const counterElements = document.querySelectorAll('.counter-value');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterElements.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
          const duration = 1800; // ms
          const start = 0;
          const startTime = performance.now();

          function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(start + (target - start) * easeOut);
            counter.textContent = currentVal;

            if (progress < 1) {
              requestAnimationFrame(updateNumber);
            } else {
              counter.textContent = target;
            }
          }

          requestAnimationFrame(updateNumber);
        });
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.getElementById('impacto');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* --------------------------------------------------------------------------
   NOVO: CARROSSEL COMO ATUAMOS (INFINITO COM CARD CENTRAL AMPLIADO)
   -------------------------------------------------------------------------- */
function initComoAtuamosCarousel() {
  const track = document.getElementById('como-atuamos-track');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const dots = document.querySelectorAll('.carousel-dot');
  const slides = track ? track.querySelectorAll('.como-atuamos-slide') : [];

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateCarousel(index) {
    // Navegação puramente cíclica baseada na quantidade real de cards existentes
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    // Marca o slide ativo e ajusta destaque visual
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

    let slidePercent = 100;
    let offsetPercent = 0;

    if (isTablet) {
      slidePercent = 65;
      offsetPercent = (100 - slidePercent) / 2;
    } else if (!isMobile) {
      slidePercent = 46;
      offsetPercent = (100 - slidePercent) / 2;
    }

    // Deslocamento exato centralizado sem vazar para espaços vazios
    const translateVal = -(currentIndex * slidePercent) + offsetPercent;
    track.style.transform = `translateX(${translateVal}%)`;

    // Atualiza os dots indicadores dinâmicos
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
        dot.classList.remove('bg-areia');
      } else {
        dot.classList.remove('active');
        dot.classList.add('bg-areia');
      }
    });
  }

  // Eventos dos botões (sem autoplay)
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentIndex + 1);
    });
  }

  // Eventos dos dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      updateCarousel(idx);
    });
  });

  // Touch / Drag suave e seguro
  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) updateCarousel(currentIndex + 1);
      else updateCarousel(currentIndex - 1);
    }
    isDragging = false;
  }, { passive: true });

  track.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) updateCarousel(currentIndex + 1);
      else updateCarousel(currentIndex - 1);
    }
    isDragging = false;
  });

  window.addEventListener('resize', () => {
    updateCarousel(currentIndex);
  });

  // Inicializa estático
  updateCarousel(0);
}

window.initEdicoesRealizadasCarousel = function() {
  const track = document.getElementById('edicoes-realizadas-track');
  const prevBtn = document.getElementById('edicoes-prev-btn');
  const nextBtn = document.getElementById('edicoes-next-btn');
  const slides = track ? track.querySelectorAll('.como-atuamos-slide') : [];

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateCarousel(index) {
    // Loop circular entre registros reais
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

    let slidePercent = 100;
    let offsetPercent = 0;

    if (isTablet) {
      slidePercent = 65;
      offsetPercent = (100 - slidePercent) / 2;
    } else if (!isMobile) {
      slidePercent = 46;
      offsetPercent = (100 - slidePercent) / 2;
    }

    const translateVal = -(currentIndex * slidePercent) + offsetPercent;
    track.style.transform = `translateX(${translateVal}%)`;
  }

  // Setas de navegação (sem autoplay)
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentIndex + 1);
    });
  }

  // Interação manual por touch
  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) updateCarousel(currentIndex + 1);
      else updateCarousel(currentIndex - 1);
    }
    isDragging = false;
  }, { passive: true });

  // Interação manual por mouse / drag
  track.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) updateCarousel(currentIndex + 1);
      else updateCarousel(currentIndex - 1);
    }
    isDragging = false;
  });

  window.addEventListener('resize', () => {
    updateCarousel(currentIndex);
  });

  // Inicializa estático sem nenhum autoplay
  updateCarousel(0);
};


/* --------------------------------------------------------------------------
   NOVO: BOTÃO FLUTUANTE (SOME AO CHEGAR PRÓXIMO AO FOOTER)
   -------------------------------------------------------------------------- */
function initFloatingButtonScroll() {
  const floatingBtn = document.querySelector('.floating-btn-atos');
  const footer = document.querySelector('footer');

  if (!floatingBtn || !footer) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        floatingBtn.classList.add('btn-oculto');
      } else {
        floatingBtn.classList.remove('btn-oculto');
      }
    });
  }, {
    rootMargin: '100px 0px 0px 0px',
    threshold: 0.05
  });

  observer.observe(footer);
}

/* --------------------------------------------------------------------------
   3. ABAS DE LOCALIDADES E MÍDIAS (BRASIL / PARAGUAI / TODOS)
   -------------------------------------------------------------------------- */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const mediaItems = document.querySelectorAll('.media-item');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCountry = btn.getAttribute('data-country');

      // Atualiza estilo dos botões
      tabButtons.forEach(b => {
        b.classList.remove('bg-chama', 'text-white', 'shadow-md');
        b.classList.add('bg-white', 'text-carvao', 'hover:bg-areia');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('bg-chama', 'text-white', 'shadow-md');
      btn.classList.remove('bg-white', 'text-carvao', 'hover:bg-areia');
      btn.setAttribute('aria-selected', 'true');

      // Filtra os itens e pausa vídeos ocultos
      mediaItems.forEach(item => {
        const itemCountry = item.getAttribute('data-country');
        const video = item.querySelector('video');

        if (targetCountry === 'all' || itemCountry === targetCountry) {
          item.classList.remove('hidden');
          item.classList.add('flex');
        } else {
          item.classList.add('hidden');
          item.classList.remove('flex');
          if (video && !video.paused) {
            video.pause();
          }
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. GERENCIAMENTO DE PLAYERS DE VÍDEO
   -------------------------------------------------------------------------- */
function initVideoPlayers() {
  const allVideos = document.querySelectorAll('.native-video-player');

  allVideos.forEach(video => {
    // Quando um vídeo começa a tocar, pausa todos os outros
    video.addEventListener('play', () => {
      allVideos.forEach(otherVideo => {
        if (otherVideo !== video && !otherVideo.paused) {
          otherVideo.pause();
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. LIGHTBOX MODAL PARA GALERIA DE FOTOS
   -------------------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const triggers = document.querySelectorAll('.lightbox-trigger');

  if (!modal || !modalImg) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const imgSrc = trigger.getAttribute('data-img') || trigger.querySelector('img')?.src;
      const caption = trigger.getAttribute('data-caption') || '';

      if (imgSrc) {
        modalImg.src = imgSrc;
        if (modalCaption) modalCaption.textContent = caption;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   6. CÓPIA DE CHAVE PIX
   -------------------------------------------------------------------------- */
function initPixCopy() {
  const copyBtn = document.getElementById('pix-copy-btn');
  const pixKeyInput = document.getElementById('pix-key-input');
  const copyFeedback = document.getElementById('pix-copy-feedback');

  if (!copyBtn || !pixKeyInput) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pixKeyInput.value);
      if (copyFeedback) {
        copyFeedback.classList.remove('hidden');
        copyBtn.innerHTML = `
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Chave Copiada!
        `;
        copyBtn.classList.remove('bg-chama');
        copyBtn.classList.add('bg-cacto');

        setTimeout(() => {
          copyFeedback.classList.add('hidden');
          copyBtn.innerHTML = `
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copiar Chave PIX
          `;
          copyBtn.classList.remove('bg-cacto');
          copyBtn.classList.add('bg-chama');
        }, 3500);
      }
    } catch (err) {
      console.error('Erro ao copiar chave:', err);
    }
  });
}


// Listener para atualizar contadores e dados quando o banco na nuvem for atualizado
window.addEventListener('atos_dados_sincronizados', () => {
  syncDynamicImpactCounters();
});
