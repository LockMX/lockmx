// The Portuguese dictionary defines the shape every locale must follow.
export const pt = {
  metadata: {
    title: "LockMX",
    // The short description of the client, without its emoji.
    description:
      "A tua loja online de motocross. Descobre os produtos exclusivos LockMX, pneus, peças, acessórios e tudo o que precisas para elevar a tua experiência dentro e fora da pista.",
  },
  comingSoon: {
    logoAlt: "LockMX Modular System",
    message: "Em breve",
  },
  languageSwitcher: {
    label: "Idioma",
  },
  navigation: {
    main: "Principal",
    footer: "Rodapé",
    home: "Início",
    modularSystem: "Sistema modular",
    why: "Porquê",
    contact: "Contacto",
    shop: "Loja",
    cart: "Carrinho",
  },
  header: {
    skipToContent: "Saltar para o conteúdo",
    logoAlt: "LockMX, página inicial",
    menu: "Menu",
  },
  footer: {
    logoAlt: "LockMX Modular System",
    tagline: "Lock it, send it!",
    navigationTitle: "Navegação",
    legalTitle: "Legal",
    complaintsBook: "Livro de Reclamações",
    // {year} is replaced by the current year.
    copyright: "© {year} LockMX",
  },
  modularSystem: {
    eyebrow: "Sistema modular LockMX",
    title: "Um quartel-general sobre rodas",
    systemText: "Criado para aventureiros, riders e todos os que respiram desportos de ação, o sistema modular LockMX foi pensado para acompanhar o teu ritmo — sem compromissos. Transforma a tua campervan, motovan ou carrinha num verdadeiro quartel-general sobre rodas, totalmente funcional e pronto para qualquer missão.",
    partsText: "Com suportes dedicados para capacetes, botas, cabides e prateleiras modulares, cada peça encaixa num sistema inteligente que maximiza o espaço, mantém o equipamento no sítio certo e resiste ao uso duro da estrada, do pó e da lama. Tudo com um design clean, técnico e cheio de atitude.",
    helmets: {
      title: "Suportes para capacetes",
      text: "Suportes dedicados para os teus capacetes.",
    },
    boots: {
      title: "Suportes para botas",
      text: "Suportes dedicados para as tuas botas.",
    },
    hangers: {
      title: "Cabides",
      text: "Para pendurar o equipamento no sítio certo.",
    },
    shelves: {
      title: "Prateleiras modulares",
      text: "Prateleiras que encaixam no sistema.",
    },
    // The name of the page in the browser tab and in search results.
    pageTitle: "Sistema modular",
    description: "O sistema modular LockMX organiza o teu equipamento dentro da carrinha: suportes para capacetes e botas, cabides e prateleiras modulares.",
    why: {
      eyebrow: "Porquê LockMX",
      title: "Mais tempo a rodar",
      space: {
        title: "Maximiza o espaço",
        text: "Cada peça encaixa num sistema inteligente que maximiza o espaço.",
      },
      place: {
        title: "Equipamento no sítio certo",
        text: "O sistema mantém o teu equipamento no sítio certo.",
      },
      tough: {
        title: "Feito para o uso duro",
        text: "Resiste ao uso duro da estrada, do pó e da lama.",
      },
      time: {
        title: "Menos tempo a arrumar",
        text: "Menos tempo perdido a procurar e a arrumar. Mais tempo a rodar, a explorar e a enviar.",
      },
      action: "Fala connosco",
    },
  },
  // The contact page (spec 005, amendment 2).
  contact: {
    eyebrow: "LockMX",
    title: "Contactos",
    text: "Tens uma pergunta? Escreve-nos ou segue-nos.",
    description: "Fala com a LockMX por email ou segue-nos no Instagram.",
    emailTitle: "E-mail",
    socialTitle: "Redes Sociais",
    // The names of the links, also for the icons of the footer.
    email: "E-mail",
    instagram: "Instagram",
  },
  home: {
    hero: {
      eyebrow: "Sistema modular LockMX",
      // The tagline of the brand, in English in both locales.
      titleLead: "Lock it,",
      titleAccent: "send it!",
      text: "Um sistema modular que organiza o teu equipamento dentro da carrinha.",
      primaryAction: "Fala connosco",
      secondaryAction: "Conhece o sistema",
      imageAlt: "Placa preta com o logótipo LockMX Modular System numa parede de pedra.",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Pronto para arrumar a carrinha?",
      text: "Tens uma pergunta sobre o sistema? Escreve-nos.",
      emailLabel: "Email",
    },
  },
  // The shop (spec 005).
  shop: {
    home: {
      eyebrow: "LockMX",
      title: "Loja",
    },
    cart: {
      title: "Carrinho",
      empty: "O teu carrinho está vazio.",
      action: "Ir para a loja",
    },
    featured: {
      eyebrow: "Produtos",
      title: "Destaques",
      carousel: "Produtos em destaque",
      empty: "Ainda não há produtos em destaque.",
      // On every card of an example product, until the catalogue exists.
      example: "Exemplo",
    },
    categories: {
      eyebrow: "Catálogo",
      title: "Categorias",
      // On a product type that has no page yet.
      soon: "Em breve",
    },
    productTypes: {
      modularSystem: "Sistema modular",
      tyres: "Pneus",
    },
    // The sections of the shop (spec 005, amendment 2).
    sections: {
      racks: "Suportes LockMX",
      tyres: "Pneus",
      merchandise: "Merchandise",
    },
    listing: {
      eyebrow: "Loja",
      // The link of the filters that shows every section.
      all: "Todos",
      filters: "Filtros",
      sections: "Secções",
      availability: "Disponibilidade",
      apply: "Aplicar",
      clear: "Limpar filtros",
      // The name of the grid, for assistive technology.
      products: "Produtos",
      empty: "Nenhum produto corresponde aos filtros.",
    },
    product: {
      inStock: "Em stock",
      outOfStock: "Esgotado",
      // Read before each amount of a reduced price.
      compareAt: "Antes",
      current: "Agora",
    },
    search: {
      label: "Pesquisar produtos",
      submit: "Pesquisar",
      placeholder: "Pneus, suportes",
      list: "Sugestões",
      // {count} is replaced by the number of suggestions.
      results: { one: "{count} sugestão", other: "{count} sugestões" },
      noResults: "Sem sugestões",
    },
    carousel: {
      // Said in place of "region" and "group" by assistive technology.
      roleDescription: "carrossel",
      slideRoleDescription: "diapositivo",
      // {index} and {total} are replaced by the position of the slide.
      slide: "{index} de {total}",
      pause: "Pausar rotação",
      play: "Retomar rotação",
      previous: "Anterior",
      next: "Seguinte",
    },
  },
  // The pages of the legal column of the footer. Their content waits for the client.
  legal: {
    company: "Informação da empresa",
    privacy: "Política de privacidade",
    cookies: "Política de cookies",
    terms: "Termos e condições",
    pending: "Em implementação",
    home: "Voltar ao início",
  },
  notFound: {
    title: "Página não encontrada",
    message: "O endereço que abriste não existe ou mudou.",
    home: "Voltar ao início",
  },
  error: {
    title: "Ocorreu um erro",
    message: "Não foi possível mostrar esta página. Tenta novamente daqui a pouco.",
    retry: "Tentar novamente",
    home: "Voltar ao início",
    reference: "Referência:",
  },
};

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Messages = DeepString<typeof pt>;
