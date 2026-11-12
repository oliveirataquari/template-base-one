/**
 * BASE | main.js
 * Índice:
 *  1. Sombra/borda do header ao rolar a página
 *  2. Botão "voltar ao topo"
 *  3. Fechar o menu mobile ao clicar em um link
 *  4. Portfólio (filtros com Isotope)
 *  5. Depoimentos (carrossel com Swiper)
 *  6. Galeria (carrossel com Swiper + lightbox)
 *  7. Clientes (carrossel de logos, movimento contínuo)
 *  8. Contato (formulário que abre o WhatsApp)
 *  9. Inicialização das bibliotecas opcionais (AOS, GLightbox...)
 */
(function () {
  "use strict";


  /* ---------------------------------------------------------------------
     PRELOADER: esconde o ícone de carregamento quando tudo estiver pronto
        - Espera a página inteira carregar (imagens, fontes, estilos)
        - Se existir hero-video, espera também o primeiro quadro do vídeo
        - LIMITE: depois deste tempo (ms) o ícone some de qualquer jeito,
          para nunca deixar o visitante preso (ex.: vídeo bloqueado/lento)
     --------------------------------------------------------------------- */
  const preloader = document.getElementById("preloader");

  if (preloader) {
    const LIMITE = 8000;
    const video = document.querySelector(".hero-video-media");
    const esperas = [];

    // 1) A página inteira
    esperas.push(new Promise(function (resolve) {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    }));

    // 2) O vídeo do hero (só se existir e ainda não tiver o primeiro quadro)
    if (video && video.readyState < 2) {
      esperas.push(new Promise(function (resolve) {
        video.addEventListener("loadeddata", resolve, { once: true });
        video.addEventListener("error", resolve, { once: true });
      }));
    }

    // Termina quando tudo carregar OU quando o tempo-limite acabar (o que vier primeiro)
    const limite = new Promise(function (resolve) { setTimeout(resolve, LIMITE); });

    Promise.race([Promise.all(esperas), limite]).then(function () {
      preloader.classList.add("carregado");                      // fade-out (CSS)
      preloader.addEventListener("transitionend", function () {
        preloader.remove();                                      // tira do HTML depois do fade
      }, { once: true });
    });
  }


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
  /* ---------------------------------------------------------------------
     3. MENU: painel mobile + submenus
        - Clique em um link: fecha o painel mobile
        - Clique na SETINHA de um item com submenu: abre/fecha o submenu
          (mobile e telas de toque). No desktop com mouse, o submenu abre
          sozinho ao passar o mouse (CSS), então a setinha só navega.
        - Clique fora, tecla Esc ou mudar o tamanho da tela: fecha submenus abertos
     --------------------------------------------------------------------- */
    const navmenu = document.getElementById("navmenu");
    const telaGrande = window.matchMedia("(min-width: 992px)");
    const temMouse = window.matchMedia("(hover: hover)");

    // Fecha todos os submenus abertos pelo toque
    function fecharSubmenus() {
      navmenu.querySelectorAll(".has-submenu.aberto").forEach(function (item) {
        item.classList.remove("aberto");
      });
    }

    navmenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (evento) {

        // Clique na setinha: abre/fecha o submenu e NÃO navega
        const seta = evento.target.closest(".submenu-seta");
        if (seta && !(telaGrande.matches && temMouse.matches)) {
          evento.preventDefault();
          seta.closest(".has-submenu").classList.toggle("aberto");
          return;
        }

        // Clique em um link: fecha submenus e o painel mobile (se estiver aberto)
        fecharSubmenus();
        if (navmenu.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(navmenu, { toggle: false }).hide();
        }
      });
    });

    // Clique fora de um item com submenu: fecha os abertos
    document.addEventListener("click", function (evento) {
      if (!evento.target.closest(".has-submenu")) fecharSubmenus();
    });

    // Tecla Esc fecha os submenus
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape") fecharSubmenus();
    });

    // Mudou entre celular e desktop: recomeça com tudo fechado
    telaGrande.addEventListener("change", fecharSubmenus);



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
     5. DEPOIMENTOS (Swiper)
        - Carrossel automático com pontinhos, sem setas
        - Só roda se a seção existir e se o Swiper estiver carregado
     --------------------------------------------------------------------- */
  if (document.querySelector(".depoimentos-swiper") && typeof Swiper !== "undefined") {
    new Swiper(".depoimentos-swiper", {
      loop: true,                      // volta ao primeiro depoimento sem "pular"
      speed: 600,                      // duração da transição (ms)
      spaceBetween: 24,                // espaço entre os cards (px)
      autoplay: {
        delay: 5000,                   // tempo entre trocas (ms)
        disableOnInteraction: false,   // continua andando depois que o usuário mexe
        pauseOnMouseEnter: true        // pausa enquanto o mouse está sobre o carrossel
      },
      pagination: {
        el: ".depoimentos-pontos",     // onde ficam os pontinhos
        clickable: true                // clicar no ponto leva ao depoimento
      },
      // Quantos cards aparecem por largura de tela
      slidesPerView: 1,                // mobile
      breakpoints: {
        768:  { slidesPerView: 2 },    // tablet
        992:  { slidesPerView: 3 }     // desktop
      }
    });
  }

  /* ---------------------------------------------------------------------
     6. GALERIA (Swiper)
        - Carrossel manual, com setas (botões fora do carrossel) e sem pontinhos
        - O clique na foto é tratado pelo GLightbox (bloco 9)
        - "rewind": ao chegar na última foto, a seta leva de volta à primeira
          (usado no lugar de "loop" para não duplicar fotos no lightbox)
     --------------------------------------------------------------------- */
  if (document.querySelector(".galeria-swiper") && typeof Swiper !== "undefined") {
    new Swiper(".galeria-swiper", {
      rewind: true,
      speed: 500,                      // duração da transição (ms)
      spaceBetween: 24,                // espaço entre as fotos (px)
      navigation: {
        prevEl: ".galeria-anterior",   // botão "anterior"
        nextEl: ".galeria-proxima"     // botão "próxima"
      },
      // Quantas fotos aparecem por largura de tela
      slidesPerView: 1,                // mobile
      breakpoints: {
        768:  { slidesPerView: 2 },    // tablet
        992:  { slidesPerView: 4 }     // desktop (4 fotos)
      }
    });
  }

  /* ---------------------------------------------------------------------
     7. CLIENTES (Swiper, logos em movimento contínuo)
        - delay: 0 + transição linear (no CSS) = movimento constante, sem pausas
        - Sem pausa ao passar o mouse, sem setas e sem pontinhos
        - Dá para ARRASTAR com o mouse (segurando) ou com o dedo (celular).
          O arrasto é livre (freeMode): acompanha o mouse sem pular logos
          e, ao soltar, o movimento contínuo recomeça sozinho
        - "speed" = tempo (ms) para andar UM logo: AUMENTE para ficar mais lento
     --------------------------------------------------------------------- */
  if (document.querySelector(".logos-swiper") && typeof Swiper !== "undefined") {
    new Swiper(".logos-swiper", {
      loop: true,
      grabCursor: true,                // cursor de "mãozinha" ao passar o mouse
      freeMode: {
        enabled: true,                 // arrasto livre, sem encaixar em "páginas"
        momentum: false                // sem "deslize" depois de soltar
      },
      spaceBetween: 16,                // espaço entre os logos (px)
      speed: 3000,                     // velocidade (ms por logo)
      autoplay: {
        delay: 0,                      // sem pausa entre os passos
        disableOnInteraction: false,   // volta a andar sozinho depois do arrasto
        pauseOnMouseEnter: false       // sem pausa ao passar o mouse
      },
      // Quantos logos aparecem por largura de tela
      slidesPerView: 2,                // mobile
      breakpoints: {
        576: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        992: { slidesPerView: 5 }      // desktop: 5 logos
      }
    });
  }

    /* ---------------------------------------------------------------------
     8. CONTATO (formulário que abre o WhatsApp)
        - Máscara no telefone: (00) 00000-0000 (celular) ou (00) 0000-0000 (fixo)
        - Valida os campos (mensagens do Bootstrap)
        - Monta o texto com nome, telefone e mensagem
        - Abre o WhatsApp do número definido em data-whatsapp no <form>
        - Nada é enviado para servidor
     --------------------------------------------------------------------- */
  const contatoForm = document.getElementById("contatoForm");

  if (contatoForm) {

    // ----- Máscara do telefone -----
    const campoTelefone = contatoForm.elements["telefone"];

    // Recebe o que foi digitado e devolve o texto já formatado
    function mascaraTelefone(valor) {
      // Mantém só os números e limita a 11 dígitos (DDD + 9 dígitos)
      const n = valor.replace(/\D/g, "").slice(0, 11);

      if (n.length > 10) return n.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");  // celular
      if (n.length > 6)  return n.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");  // fixo
      if (n.length > 2)  return n.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");            // só o começo
      if (n.length > 0)  return "(" + n;                                                 // só o DDD
      return "";
    }

    // Aplica a máscara a cada tecla digitada ou número colado
    campoTelefone.addEventListener("input", function () {
      campoTelefone.value = mascaraTelefone(campoTelefone.value);
    });

    // ----- Envio do formulário -----
    contatoForm.addEventListener("submit", function (evento) {
      evento.preventDefault();                       // impede o envio padrão do formulário

      // Campo vazio ou telefone incompleto: mostra os avisos em vermelho e para por aqui
      if (!contatoForm.checkValidity()) {
        contatoForm.classList.add("was-validated");
        return;
      }

      // Lê os campos (trim = tira espaços do começo e do fim)
      const nome = contatoForm.elements["nome"].value.trim();
      const telefone = contatoForm.elements["telefone"].value.trim();
      const mensagem = contatoForm.elements["mensagem"].value.trim();

      // Texto que chegará pronto no WhatsApp (\n = quebra de linha)
      const texto =
        "Olá! Meu nome é " + nome + ".\n" +
        "Telefone: " + telefone + "\n\n" +
        mensagem;

      // Monta o link (encodeURIComponent converte acentos e espaços para o formato da URL)
      const numero = contatoForm.getAttribute("data-whatsapp");
      const link = "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);

      // Abre o WhatsApp em outra aba e limpa o formulário
      window.open(link, "_blank", "noopener");
      contatoForm.reset();
      contatoForm.classList.remove("was-validated");
    });
  }




  /* ---------------------------------------------------------------------
     NÚMEROS (contadores + gráfico rosca)
        - Quando a seção aparece na tela, os números sobem até o valor final
          (data-contador) e o gráfico se desenha. Acontece uma vez só.
        - "duracao" = tempo (ms) que o número leva para chegar ao final
        - Sem animação para quem desativou movimento no sistema
     --------------------------------------------------------------------- */
  const painelNumeros = document.querySelector(".numeros-painel");

  if (painelNumeros) {
    const contadores = painelNumeros.querySelectorAll("[data-contador]");
    const grafico = painelNumeros.querySelector(".donut");
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duracao = 1800;

    // Monta o texto: prefixo + número com separador de milhar (2.400) + sufixo
    function formatarNumero(el, valor) {
      return (el.dataset.prefixo || "") + valor.toLocaleString("pt-BR") + (el.dataset.sufixo || "");
    }

    // Faz um número subir de 0 até o valor final
    function animarContador(el) {
      const alvo = parseFloat(el.dataset.contador);
      if (semMovimento) { el.textContent = formatarNumero(el, alvo); return; }

      const inicio = performance.now();
      function passo(agora) {
        const progresso = Math.min((agora - inicio) / duracao, 1);
        const suave = 1 - Math.pow(1 - progresso, 3);        // começa rápido e desacelera no final
        el.textContent = formatarNumero(el, Math.round(alvo * suave));
        if (progresso < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    }

    function iniciarNumeros() {
      contadores.forEach(animarContador);
      if (grafico) grafico.classList.add("visivel");         // o CSS desenha o gráfico
    }

    if (!semMovimento) {
      // Antes de aparecer, os números começam em zero
      contadores.forEach(function (el) { el.textContent = formatarNumero(el, 0); });
    }

    if ("IntersectionObserver" in window) {
      const observador = new IntersectionObserver(function (entradas, obs) {
        if (entradas[0].isIntersecting) {
          iniciarNumeros();
          obs.disconnect();                                   // dispara uma vez só
        }
      }, { threshold: 0.3 });                                 // 30% da seção visível
      observador.observe(painelNumeros);
    } else {
      iniciarNumeros();                                       // navegador antigo: mostra direto
    }
  }







  /* ---------------------------------------------------------------------
     BIBLIOTECAS OPCIONAIS
     Cada bloco só roda se a biblioteca foi carregada no index.html.
     --------------------------------------------------------------------- */

  // AOS: animações ao rolar (usar data-aos="fade-up" nos elementos)
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 600, easing: "ease-in-out", once: true, mirror: false });
  }

  // GLightbox: foto ampliada (usar class="glightbox" nos links)
  // loop: false = na última foto do lightbox não volta para a primeira
  if (typeof GLightbox !== "undefined") {
    GLightbox({ selector: ".glightbox", loop: false });
  }

})();