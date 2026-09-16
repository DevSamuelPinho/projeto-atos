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

    // 1. Atualiza os números no Hero / Início
    const heroAcoes = document.getElementById('hero-count-acoes');
    const heroLoc = document.getElementById('hero-count-localidades');
    const heroNac = document.getElementById('hero-count-nacoes');

    if (heroAcoes) heroAcoes.textContent = dinamicos.acoes_realizadas;
    if (heroLoc) heroLoc.textContent = dinamicos.cidades_atendidas;
    if (heroNac) heroNac.textContent = dinamicos.paises_atendidos;

    // 2. Atualiza os targets dos contadores animados na Seção Impacto
    const impAcoes = document.getElementById('impacto-count-acoes');
    const impLoc = document.getElementById('impacto-count-localidades');
    const impNac = document.getElementById('impacto-count-nacoes');

    if (impAcoes) impAcoes.setAttribute('data-target', dinamicos.acoes_realizadas);
    if (impLoc) impLoc.setAttribute('data-target', dinamicos.cidades_atendidas);
    if (impNac) impNac.setAttribute('data-target', dinamicos.paises_atendidos);
  } catch (err) {
    console.warn('Erro ao sincronizar indicadores dinâmicos:', err);
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
  const slides = document.querySelectorAll('.como-atuamos-slide');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;

  function updateCarousel(index) {
    // Garantir loop infinito nos índices
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    // Marca o slide ativo e ajusta visuais
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    // Centraliza o slide ativo no container
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

    // Atualiza os dots
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

  // Eventos dos botões
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoplay();
      updateCarousel(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoplay();
      updateCarousel(currentIndex + 1);
      startAutoplay();
    });
  }

  // Eventos dos dots
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      stopAutoplay();
      updateCarousel(idx);
      startAutoplay();
    });
  });

  // Touch / Drag suporte
  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) updateCarousel(currentIndex + 1);
      else updateCarousel(currentIndex - 1);
    }
    isDragging = false;
    startAutoplay();
  }, { passive: true });

  track.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
    stopAutoplay();
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) updateCarousel(currentIndex + 1);
      else updateCarousel(currentIndex - 1);
    }
    isDragging = false;
    startAutoplay();
  });

  // Autoplay suave a cada 5 segundos
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  window.addEventListener('resize', () => {
    updateCarousel(currentIndex);
  });

  // Inicializa
  updateCarousel(0);
  startAutoplay();
}

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
