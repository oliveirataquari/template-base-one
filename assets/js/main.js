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