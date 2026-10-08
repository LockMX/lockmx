// The Portuguese dictionary defines the shape every locale must follow.
export const pt = {
  metadata: {
    title: "LockMX",
    description:
      "Pneus de motocross e racks para transportar equipamento no interior de carrinhas.",
  },
  home: {
    logoAlt: "LockMX Modular System",
    comingSoon: "Em breve",
  },
  languageSwitcher: {
    label: "Idioma",
  },
};

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Messages = DeepString<typeof pt>;
