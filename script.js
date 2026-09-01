let currentFontScale = 1.0; // Inicia em 100% para alinhar com o padrão
    const MIN_FONT_SCALE = 0.8;
    const MAX_FONT_SCALE = 2.2;
    let isSpeaking = false;
    let speechSynth = window.speechSynthesis;

    // Garantir carregamento das vozes em navegadores Chromium (Chrome/Edge)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        speechSynth.getVoices();
      };
    }

    // Inicialização ao carregar o DOM
    document.addEventListener('DOMContentLoaded', () => {
      loadSavedPreferences();
      setupEventListeners();
      setupKeyboardShortcuts();
    });

    // Configuração dos escutadores de eventos dos botões
    function setupEventListeners() {
      // 1. Controles de Fonte
      document.getElementById('btn-increase-font')?.addEventListener('click', () => adjustFontSize(0.1));
      document.getElementById('btn-decrease-font')?.addEventListener('click', () => adjustFontSize(-0.1));
      document.getElementById('btn-reset-font')?.addEventListener('click', () => resetFontSize());

      // 2. Menu de Contraste
      const contrastBtn = document.getElementById('btn-contrast-toggle');
      const contrastMenu = document.getElementById('contrast-menu');

      if (contrastBtn && contrastMenu) {
        contrastBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = contrastBtn.getAttribute('aria-expanded') === 'true';
          contrastBtn.setAttribute('aria-expanded', !isExpanded);
          contrastMenu.classList.toggle('hidden');
        });

        contrastMenu.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        // Event listener delegado para os botões do menu de contraste
        contrastMenu.querySelectorAll('.menu-item').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.menu-item');
            const theme = targetBtn ? targetBtn.getAttribute('data-theme') : null;
            if (theme) setTheme(theme);
            contrastMenu.classList.add('hidden');
            contrastBtn.setAttribute('aria-expanded', 'false');
          });
        });
      }

      // Fechar menu de contraste ao clicar fora
      document.addEventListener('click', () => {
        if (contrastMenu) {
          contrastMenu.classList.add('hidden');
          contrastBtn?.setAttribute('aria-expanded', 'false');
        }
      });

      // 3. Leitor de voz
      document.getElementById('btn-read-page')?.addEventListener('click', togglePageReader);

      // Botões de leitura de seção por atributo data
      document.querySelectorAll('[data-read-section]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-read-section');
          readSection(targetId);
        });
      });

      // 4. Modos Adicionais
      document.getElementById('btn-toggle-dyslexic')?.addEventListener('click', () => {
        const isDyslexic = document.documentElement.classList.toggle('dyslexic-font');
        showToast(isDyslexic ? "Fonte para dislexia ativada" : "Fonte padrão restaurada");
        localStorage.setItem('dyslexicFont', isDyslexic);
      });

      document.getElementById('btn-toggle-cursor')?.addEventListener('click', () => {
        const isLargeCursor = document.documentElement.classList.toggle('large-cursor');
        showToast(isLargeCursor ? "Cursor gigante ativado" : "Cursor normal restaurado");
        localStorage.setItem('largeCursor', isLargeCursor);
      });
    }

    // Função para ajustar o tamanho da fonte dinamicamente
    function adjustFontSize(delta) {
      let newScale = currentFontScale + delta;
      
      if (newScale >= MIN_FONT_SCALE && newScale <= MAX_FONT_SCALE) {
        currentFontScale = parseFloat(newScale.toFixed(2));
        applyFontSize();
      } else if (newScale > MAX_FONT_SCALE) {
        showToast("Tamanho máximo de fonte atingido (220%)");
      } else if (newScale < MIN_FONT_SCALE) {
        showToast("Tamanho mínimo de fonte atingido (80%)");
      }
    }

    function resetFontSize() {
      currentFontScale = 1.0;
      applyFontSize();
      showToast("Tamanho da letra restaurado para 100%");
    }

    function applyFontSize() {
      document.documentElement.style.setProperty('--font-scale', currentFontScale);
      const percentage = Math.round(currentFontScale * 100);
      const display = document.getElementById('font-size-display');
      if (display) display.innerText = `${percentage}%`;
      localStorage.setItem('userFontScale', currentFontScale);
    }

    // Função para alterar o tema de contraste
    function setTheme(themeName) {
      const htmlEl = document.documentElement;
      htmlEl.classList.remove('theme-default', 'theme-high-contrast-dark', 'theme-high-contrast-light', 'theme-inverted');

      if (themeName === 'default') {
        htmlEl.classList.add('theme-default');
        showToast("Tema padrão ativado");
      } else {
        htmlEl.classList.add(`theme-${themeName}`);
        showToast(`Modo de contraste ativado`);
      }

      localStorage.setItem('userTheme', themeName);
    }

    // Função para leitura de texto usando Web Speech API
    function speakText(text) {
      if (!('speechSynthesis' in window)) {
        showToast("Seu navegador não suporta leitura por voz nativa.");
        return;
      }

      speechSynth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;

      const voices = speechSynth.getVoices();
      const ptVoice = voices.find(v => v.lang.includes('pt') || v.lang.includes('PT'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onend = () => {
        isSpeaking = false;
        updateReadButtonState(false);
      };

      utterance.onerror = () => {
        isSpeaking = false;
        updateReadButtonState(false);
      };

      speechSynth.speak(utterance);
      isSpeaking = true;
      updateReadButtonState(true);
    }

    function togglePageReader() {
      if (isSpeaking) {
        speechSynth.cancel();
        isSpeaking = false;
        updateReadButtonState(false);
        showToast("Leitura pausada");
      } else {
        const mainContent = document.getElementById('conteudo-principal')?.innerText || "";
        speakText("Iniciando leitura do portal. " + mainContent.substring(0, 300) + "...");
        showToast("Lendo conteúdo principal...");
      }
    }

    function readSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        speakText(element.innerText);
        showToast("Lendo seção selecionada...");
      }
    }

    function updateReadButtonState(active) {
      const readBtnText = document.getElementById('read-btn-text');
      if (readBtnText) {
        readBtnText.innerText = active ? "Parar Leitura" : "Ouvir Página";
      }
    }

    // Atalhos de Teclado (Alt + Tecla)
    function setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.altKey) {
          switch (e.key) {
            case '1':
              e.preventDefault();
              document.getElementById('conteudo-principal')?.focus();
              showToast("Navegado para o Conteúdo Principal");
              break;
            case '2':
              e.preventDefault();
              adjustFontSize(0.15);
              break;
            case '3':
              e.preventDefault();
              adjustFontSize(-0.15);
              break;
            case '4':
              e.preventDefault();
              toggleNextTheme();
              break;
            case '5':
              e.preventDefault();
              togglePageReader();
              break;
          }
        }
      });
    }

    function toggleNextTheme() {
      const themes = ['default', 'high-contrast-dark', 'high-contrast-light', 'inverted'];
      const currentTheme = localStorage.getItem('userTheme') || 'default';
      const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
      setTheme(themes[nextIndex]);
    }

    // Exibir notificação toast
    function showToast(message) {
      const toast = document.getElementById('accessible-toast');
      const toastText = document.getElementById('toast-text');
      if (!toast || !toastText) return;
      
      toastText.innerText = message;
      toast.style.display = 'block';

      setTimeout(() => {
        toast.style.display = 'none';
      }, 3500);
    }

    // Carregar preferências salvas no localStorage
    function loadSavedPreferences() {
      const savedScale = localStorage.getItem('userFontScale');
      if (savedScale) {
        currentFontScale = parseFloat(savedScale);
        applyFontSize();
      }

      const savedTheme = localStorage.getItem('userTheme');
      if (savedTheme) {
        setTheme(savedTheme);
      }

      if (localStorage.getItem('dyslexicFont') === 'true') {
        document.documentElement.classList.add('dyslexic-font');
      }

      if (localStorage.getItem('largeCursor') === 'true') {
        document.documentElement.classList.add('large-cursor');
      }
    }