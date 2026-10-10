// The Portuguese dictionary defines the shape every locale must follow.
export const pt = {
  metadata: {
    title: "LockMX",
    description:
      "Pneus de motocross e racks para transportar equipamento no interior de carrinhas.",
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
