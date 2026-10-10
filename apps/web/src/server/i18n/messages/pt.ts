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
    system: "Sistema",
    parts: "Peças",
    why: "Porquê",
    contact: "Contacto",
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
    system: {
      eyebrow: "O sistema",
      title: "Um quartel-general sobre rodas",
      text: "Criado para aventureiros, riders e todos os que respiram desportos de ação, o sistema modular LockMX foi pensado para acompanhar o teu ritmo — sem compromissos. Transforma a tua campervan, motovan ou carrinha num verdadeiro quartel-general sobre rodas, totalmente funcional e pronto para qualquer missão.",
    },
    parts: {
      eyebrow: "As peças",
      title: "Cada peça no seu lugar",
      text: "Com suportes dedicados para capacetes, botas, cabides e prateleiras modulares, cada peça encaixa num sistema inteligente que maximiza o espaço, mantém o equipamento no sítio certo e resiste ao uso duro da estrada, do pó e da lama. Tudo com um design clean, técnico e cheio de atitude.",
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
    },
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
    },
    buy: {
      eyebrow: "LockMX",
      title: "Pronto para arrumar a carrinha?",
      text: "Fala connosco e dizemos-te como ter o sistema modular LockMX.",
      action: "Fala connosco",
    },
    complements: {
      eyebrow: "Loja",
      title: "Tudo para motocross",
      text: "Além dos produtos exclusivos LockMX, encontras pneus, peças, acessórios e tudo o que precisas para elevar a tua experiência dentro e fora da pista.",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Fala connosco",
      text: "Tens uma pergunta sobre o sistema? Escreve-nos.",
      emailLabel: "Email",
    },
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
