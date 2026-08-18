 <!-- ==========================================================================
         SEÇÃO 2: JAVASCRIPT (Pode ser copiado para um arquivo script.js no GitHub)
         ========================================================================== -->
    <script>

        // Estado global da aplicação
        let currentFontScale = 1.1; // Começa ampliado em 110% por padrão
        const MIN_FONT_SCALE = 0.8;
        const MAX_FONT_SCALE = 2.2; // Até 220% de zoom de fonte
        let isSpeaking = false;
        let speechSynth = window.speechSynthesis;

        // Inicialização ao carregar o DOM
        document.addEventListener('DOMContentLoaded', () => {
            loadSavedPreferences();
            setupEventListeners();
            setupKeyboardShortcuts();
        });

        // Configuração dos Event Listeners dos botões
        function setupEventListeners() {
            // Aumento e diminuição de fonte
            document.getElementById('btn-increase-font').addEventListener('click', () => adjustFontSize(0.1));
            document.getElementById('btn-decrease-font').addEventListener('click', () => adjustFontSize(-0.1));
            document.getElementById('btn-reset-font').addEventListener('click', () => resetFontSize());

            // Menu de contraste
            const contrastBtn = document.getElementById('btn-contrast-toggle');
            const contrastMenu = document.getElementById('contrast-menu');

            contrastBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = contrastBtn.getAttribute('aria-expanded') === 'true';
                contrastBtn.setAttribute('aria-expanded', !isExpanded);
                contrastMenu.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                contrastMenu.classList.add('hidden');
                contrastBtn.setAttribute('aria-expanded', 'false');
            });

            // Leitor de voz
            document.getElementById('btn-read-page').addEventListener('click', togglePageReader);

            // Alternar fonte para dislexia
            document.getElementById('btn-toggle-dyslexic').addEventListener('click', () => {
                const isDyslexic = document.documentElement.classList.toggle('dyslexic-font');
                showToast(isDyslexic ? "Fonte para dislexia/espaçada ativada" : "Fonte padrão restaurada");
                localStorage.setItem('dyslexicFont', isDyslexic);
            });

            // Alternar cursor grande
            document.getElementById('btn-toggle-cursor').addEventListener('click', () => {
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
            document.getElementById('font-size-display').innerText = `${percentage}%`;
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
                showToast(`Modo de contraste "${themeName.replace('high-contrast-', '')}" ativado`);
            }

            localStorage.setItem('userTheme', themeName);
        }


        // Função para leitura de texto usando Web Speech API
        function speakText(text) {
            if (!('speechSynthesis' in window)) {
                showToast("Seu navegador não suporta leitura por voz nativa.");
                return;
            }

            speechSynth.cancel(); // Parar leituras anteriores

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.95; // Velocidade ligeiramente mais pausada para clareza

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
                const mainContent = document.getElementById('conteudo-principal').innerText;
                speakText("Iniciando leitura do portal. " + mainContent.substring(0, 400) + "...");
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
                            document.getElementById('conteudo-principal').focus();
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

        // Exibir caixa de notificação acessível (substitui alert/confirm)
        function showToast(message) {
            const toast = document.getElementById('accessible-toast');
            const toastText = document.getElementById('toast-text');
            
            toastText.innerText = message;
            toast.style.display = 'block';

            setTimeout(() => {
                toast.style.display = 'none';
            }, 3500);
        }

        // Carregar preferências salvas do usuário no localStorage
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