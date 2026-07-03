document.addEventListener('DOMContentLoaded', () => {
  // Configuración global y elementos comunes
  const headerEl = document.querySelector('header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * 1. MÓDULO: NAVEGACIÓN Y SCROLL SUAVE
   * Maneja el desplazamiento calculando la altura dinámica del header sticky.
   */
  const initNavigation = () => {
    const goToTarget = (hash) => {
      if (hash === '#inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      const target = document.querySelector(hash);
      if (!target) return;

      const headerHeight = headerEl.offsetHeight;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    };

    document.querySelectorAll('[data-target]').forEach(btn => {
      btn.addEventListener('click', function () {
        const hash = this.dataset.target;
        const insideMobileMenu = this.closest('#mobileMenu');

        if (insideMobileMenu) {
          closeMobileMenu();
          // Doble frame para asegurar que el reflow del menú cerrado terminó antes de medir
          requestAnimationFrame(() => requestAnimationFrame(() => goToTarget(hash)));
        } else {
          goToTarget(hash);
        }
      });
    });
  };

  /**
   * 2. MÓDULO: MENÚ MÓVIL (HAMBURGUESA)
   */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobileMenu = () => {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const toggleMobileMenu = () => {
    if (!mobileMenu || !hamburger) return;
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  const initMobileMenu = () => {
    if (!hamburger || !mobileMenu) return;
    hamburger.addEventListener('click', toggleMobileMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 840) closeMobileMenu(); });
  };

  /**
   * 3. MÓDULO: SIMULADOR DE TERMINAL OPERATIVA
   */
  const initTerminal = () => {
    const termBody = document.getElementById('termBody');
    if (!termBody) return;

    const lines = [
      { text: "Conectando a MongoDB Atlas...", tag: "$" },
      { text: "Base de datos sincronizada correctamente.", tag: "OK" },
      { text: "Verificando webhook Mercado Pago...", tag: "$" },
      { text: "Pago procesado • Webhook activo.", tag: "OK" }
    ];

    if (reduceMotion) {
      lines.forEach(l => {
        const div = document.createElement('div');
        div.className = 'term-line show';
        div.innerHTML = `<span class="tag-ok">${l.tag}</span><span>${l.text}</span>`;
        termBody.appendChild(div);
      });
      return;
    }

    let i = 0;
    const next = () => {
      if (i >= lines.length) {
        setTimeout(() => { termBody.innerHTML = ''; i = 0; next(); }, 3200);
        return;
      }

      const div = document.createElement('div');
      div.className = 'term-line';
      div.innerHTML = `<span class="tag-ok">${lines[i].tag}</span><span></span>`;
      termBody.appendChild(div);
      
      requestAnimationFrame(() => div.classList.add('show'));
      
      const span = div.querySelector('span:last-child');
      let c = 0;
      const txt = lines[i].text;
      
      const type = setInterval(() => {
        span.textContent = txt.slice(0, c + 1);
        c++;
        if (c >= txt.length) {
          clearInterval(type);
          i++;
          setTimeout(next, 380);
        }
      }, 22);
    };

    next();
  };

  /**
   * 4. MÓDULO: INTERSECTION OBSERVERS (REVEAL & HERO ANIMATIONS)
   */
  const initObservers = () => {
    // Scroll reveal genérico
    const revealEls = document.querySelectorAll('.reveal');
    const revealIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { 
          e.target.classList.add('in'); 
          revealIo.unobserve(e.target); 
        }
      });
    }, { threshold: 0.15 });
    
    revealEls.forEach(el => revealIo.observe(el));

    // Animación del panel del Hero (Terminal + Gráficos)
    const chartRow = document.getElementById('chartRow');
    const floatTags = document.getElementById('floatTags')?.querySelectorAll('.ftag');
    const termCard = document.querySelector('.term-card');

    if (termCard) {
      const heroIo = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            if (chartRow) chartRow.classList.add('show');
            if (floatTags) {
              floatTags.forEach((t, idx) => {
                setTimeout(() => t.classList.add('show'), 300 + idx * 220);
              });
            }
            initTerminal();
            heroIo.disconnect();
          }
        });
      }, { threshold: 0.2 });
      
      heroIo.observe(termCard);
    }
  };

  /**
   * 5. MÓDULO: TRADUCTOR DE JERGA INTERACTIVO (MIRROL ROWS)
   */
  const initMirrorRows = () => {
    const mirrorRows = document.querySelectorAll('.mirror-row');
    
    const sizeMirrorSwap = (row) => {
      const swap = row.querySelector('.mirror-swap');
      const jargon = row.querySelector('.mirror-jargon');
      const benefit = row.querySelector('.mirror-benefit');
      if (!swap || !jargon || !benefit) return;

      const h = Math.max(jargon.scrollHeight, benefit.scrollHeight);
      swap.style.minHeight = h + 'px';
    };

    const activate = (row) => row.classList.add('active');
    const deactivate = (row) => row.classList.remove('active');

    mirrorRows.forEach(row => {
      sizeMirrorSwap(row);
      
      // Eventos de Mouse y Foco para accesibilidad
      row.addEventListener('mouseenter', () => activate(row));
      row.addEventListener('mouseleave', () => deactivate(row));
      row.addEventListener('focus', () => activate(row));
      row.addEventListener('blur', () => deactivate(row));
      row.addEventListener('click', () => row.classList.toggle('active'));
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { 
          e.preventDefault(); 
          row.classList.toggle('active'); 
        }
      });
    });

    // Ajuste dinámico de tamaños en redimensionamiento de pantalla
    window.addEventListener('resize', () => mirrorRows.forEach(sizeMirrorSwap));
    if (document.fonts) {
      document.fonts.ready.then(() => mirrorRows.forEach(sizeMirrorSwap));
    }
  };

  // --- ORQUESTACIÓN DE INICIALIZACIÓN ---
  initNavigation();
  initMobileMenu();
  initObservers();
  initMirrorRows();

  // Lógica de Accesibilidad: Alternancia manual de Modo Claro / Oscuro
const themeToggleBtn = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

// 1. Recuperar preferencia guardada localmente
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  htmlEl.setAttribute('data-theme', savedTheme);
}

// 2. Función unificada para cambiar el tema
function handleThemeToggle(e) {
  // Evita el doble click fantasma en pantallas táctiles híbridas
  if (e) e.preventDefault();

  // Detectamos el tema actual mirando el atributo (o el esquema del sistema si está vacío)
  const currentTheme = htmlEl.getAttribute('data-theme') || 
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  if (currentTheme === 'light') {
    htmlEl.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }

  // Forzamos el recálculo del alto en los módulos interactivos si es necesario
  if (typeof mirrorRows !== 'undefined') {
    mirrorRows.forEach(sizeMirrorSwap);
  }
}

// 3. Vinculación limpia de eventos para Escritorio y Mobile
if (themeToggleBtn) {
  // Escucha click clásico (Escritorio)
  themeToggleBtn.addEventListener('click', handleThemeToggle);
  
  // Escucha touchstart inmediato (Mobile) sin retraso de 300ms
  themeToggleBtn.addEventListener('touchstart', handleThemeToggle, { passive: false });
}
});