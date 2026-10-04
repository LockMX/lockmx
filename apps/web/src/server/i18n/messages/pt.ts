// The Portuguese dictionary defines the shape every locale must follow.
export const pt = {
  metadata: {
    title: "LockMX",
    description:
      "Pneus de motocross e racks para transportar equipamento no interior de carrinhas.",
  },
  home: {
    heading: "Em breve",
    intro: "O novo site da LockMX está em construção.",
  },
  languageSwitcher: {
    label: "Idioma",
  },
};

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type Messages = DeepString<typeof pt>;
