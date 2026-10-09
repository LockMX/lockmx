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
};

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Messages = DeepString<typeof pt>;
