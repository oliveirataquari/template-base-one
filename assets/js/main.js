/**
 * BASE | main.js
 * Índice:
 *  1. Sombra/borda do header ao rolar a página
 *  2. Botão "voltar ao topo"
 *  3. Fechar o menu mobile ao clicar em um link
 *  4. Portfólio (filtros com Isotope)
 *  5. Inicialização das bibliotecas opcionais (AOS, GLightbox...)
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     1. HEADER: adiciona a classe .scrolled quando a página sai do topo
     --------------------------------------------------------------------- */
  const header = document.getElementById("header");

  function toggleScrolled() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", toggleScrolled, { passive: true });
  window.addEventListener("load", toggleScrolled);
  toggleScrolled();

  /* ---------------------------------------------------------------------
     2. BOTÃO "VOLTAR AO TOPO"
        - Aparece depois de rolar 400px (classe .visivel)
        - Ao clicar, rola suavemente até o topo
        - Se o botão não existir no HTML, este bloco é ignorado
     --------------------------------------------------------------------- */
  const voltarTopo = document.getElementById("voltarTopo");

  if (voltarTopo) {
    function toggleVoltarTopo() {
      voltarTopo.classList.toggle("visivel", window.scrollY > 400);
    }
    window.addEventListener("scroll", toggleVoltarTopo, { passive: true });
    window.addEventListener("load", toggleVoltarTopo);
    toggleVoltarTopo();

    voltarTopo.addEventListener("click", function () {
      // Sem animação se o sistema do usuário pediu menos movimento
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     3. MENU MOBILE: fecha o painel depois de clicar em um link
     --------------------------------------------------------------------- */
  const navmenu = document.getElementById("navmenu");
  navmenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      // Só fecha se o painel estiver aberto (no desktop ele nunca tem a classe .show)
      if (navmenu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(navmenu, { toggle: false }).hide();
      }
    });
  });

  /* ---------------------------------------------------------------------
     4. PORTFÓLIO (Isotope)
        - Organiza os cards em grade e filtra pelos botões
        - Só roda se a seção existir e se o Isotope estiver carregado
     --------------------------------------------------------------------- */
  const portfolio = document.querySelector(".portfolio-isotope");

  if (portfolio && typeof Isotope !== "undefined") {
    const grade = portfolio.querySelector(".portfolio-grade");
    const botoes = portfolio.querySelectorAll(".portfolio-filtro");
    let iso = null;

    function iniciarIsotope() {
      iso = new Isotope(grade, {
        itemSelector: ".portfolio-item",
        layoutMode: "fitRows"      // linhas alinhadas, igual à seção de serviços
      });
    }

    // Espera as imagens carregarem para calcular as alturas corretamente
    if (typeof imagesLoaded !== "undefined") {
      imagesLoaded(grade, iniciarIsotope);
    } else {
      iniciarIsotope();
    }

    // Recalcula o layout quando a página termina de carregar (fontes, imagens)
    window.addEventListener("load", function () {
      if (iso) iso.layout();
    });

    // Clique nos botões de filtro
    botoes.forEach(function (botao) {
      botao.addEventListener("click", function () {
        if (!iso) return;

        // Marca somente o botão clicado como selecionado
        botoes.forEach(function (b) {
          b.classList.remove("ativo");
          b.setAttribute("aria-pressed", "false");
        });
        botao.classList.add("ativo");
        botao.setAttribute("aria-pressed", "true");

        // Aplica o filtro (ex.: ".filter-categoria-1" ou "*" para todos)
        iso.arrange({ filter: botao.getAttribute("data-filter") });
      });
    });
  }

  /* ---------------------------------------------------------------------
     5. BIBLIOTECAS OPCIONAIS
     Cada bloco só roda se a biblioteca foi carregada no index.html.
     --------------------------------------------------------------------- */

  // AOS: animações ao rolar (usar data-aos="fade-up" nos elementos)
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 600, easing: "ease-in-out", once: true, mirror: false });
  }

  // GLightbox: galeria/modal (usar class="glightbox" nos links)
  if (typeof GLightbox !== "undefined") {
    GLightbox({ selector: ".glightbox" });
  }

  // Swiper é iniciado dentro de cada seção, quando ela for criada.

})();