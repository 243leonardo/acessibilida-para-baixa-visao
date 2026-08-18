&lt;div class="painel-acessibilidade" role="region" aria-label="Acessibilidade"&gt;
  &lt;h2&gt;Tamanho do Texto (Até 300%)&lt;/h2&gt;
  &lt;div class="grupo-botoes"&gt;
    &lt;button onclick="definirZoom(1)"&gt;100%&lt;/button&gt;
    &lt;button onclick="definirZoom(1.5)"&gt;150%&lt;/button&gt;
    &lt;button onclick="definirZoom(2)"&gt;200%&lt;/button&gt;
    &lt;button onclick="definirZoom(2.5)"&gt;250%&lt;/button&gt;
    &lt;button onclick="definirZoom(3)"&gt;300%&lt;/button&gt;
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
      </div>

      <!-- Aba CSS -->
      <div id="aba-css" class="conteudo-aba" role="tabpanel">
        <button class="btn-acessivel btn-copiar" onclick="copiarCodigo('codigo-css')">📋 Copiar CSS</button>
        <pre><code id="codigo-css">/* Regra CSS para ampliacao ate 300% usando calculo dinâmico */
:root {
  --fator-zoom: 1; /* Altera de 1 a 3 via JS */
  --tamanho-base: 1.25rem;
  --tamanho-calculado: calc(var(--tamanho-base) * var(--fator-zoom));
  --cor-fundo: #000000;
  --cor-texto: #FFFFFF;
  --cor-destaque: #FFFF00;
  --cor-foco: #00FF66;
}

body {
  background-color: var(--cor-fundo);
  color: var(--cor-texto);
  font-size: var(--tamanho-calculado);
  line-height: 1.8;
}

/* Indicador visual de foco do teclado */
*:focus-visible {
  outline: 5px solid var(--cor-foco) !important;
  outline-offset: 4px;
}</code></pre>
      </div>

      <!-- Aba JS -->
      <div id="aba-js" class="conteudo-aba" role="tabpanel">
        <button class="btn-acessivel btn-copiar" onclick="copiarCodigo('codigo-js')">📋 Copiar JS</button>
        <pre><code id="codigo-js">// Função JavaScript para alterar a variavel CSS de Zoom ate 300%
function definirZoom(fator) {
  document.documentElement.style.setProperty('--fator-zoom', fator);
  document.getElementById('display-zoom-atual').innerText = Math.round(fator * 100) + '%';
}

