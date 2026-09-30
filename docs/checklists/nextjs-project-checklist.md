# Next.js Project Checklist

> Guia de referência para iniciar um novo projeto Next.js com App Router.  
> Consultar sempre antes de começar. Seguir a ordem das secções.

---

## 1. Criar o Projeto

```bash
npx create-next-app@latest nome-do-projeto
```

**Opções recomendadas no assistente:**

| Pergunta | Resposta |
|---|---|
| TypeScript? | Yes |
| ESLint? | Yes |
| Tailwind CSS? | Yes |
| React Compiler? | Yes |
| Tailwind CSS? | Yes |
| `src/` directory? | **Yes** |
| App Router? | **Yes** |
| Import alias (`@/*`)? | Yes |

> ⚠️ A pasta `src/` deve ser criada neste passo. Mudar depois obriga a mover ficheiros e atualizar configs.

---

## 2. Estrutura de Pastas

Após criar o projeto, a estrutura final deve ser:

```
nome-do-projeto/
├── public/                        # Nunca dentro de src/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css            # Estilos globais e CSS variables do shadcn
│   │   ├── layout.tsx             # root layout (html, body, fonts)
│   │   ├── favicon.ico
│   │   └── [lang]/
│   │       ├── page.tsx           # landing-page
│   │       └── [section]/         # secções independentes, acedidas em /[lang]/secção
│   │           └── page.tsx
│   ├── components/
│   │   ├── ui/                    # Primitivos reutilizáveis (Button, Card, Input…)
│   │   ├── sections/              # Blocos de página (HeroSection, ContactForm…)
│   │   └── layout/                # Header, Footer, Nav, ThemeToggle
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── config.ts
│   │   │   ├── dictionaries.ts
│   │   │   └── locales/
│   │   │       ├── pt/
│   │   │       │   ├── index.ts
│   │   │       │   └── [secção].ts
│   │   │       └── en/
│   │   │           ├── index.ts
│   │   │           └── [secção].ts
│   │   ├── data/                  # Dados estáticos (projects.ts, services.ts…)
│   │   ├── supabase/              # Criado automaticamente pelo Supabase CLI
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── middleware.ts          # Helper updateSession — criado pelo Supabase CLI
│   │   └── utils.ts
│   ├── db/
│   │   ├── schema/
│   │   │   ├── index.ts           # Re-exporta todos os schemas
│   │   │   └── contacts.ts        # Definição da tabela contacts
│   │   ├── migrations/            # Auto-gerado pelo drizzle-kit
│   │   └── index.ts               # drizzle(client, { schema }) export
│   ├── actions/                   # Server Actions (sempre com Zod)
│   ├── hooks/                     # Custom client hooks
│   ├── types/                     # Tipos globais e inferidos do Zod/Drizzle
│   └── middleware.ts              # Middleware real do Next.js (i18n + Supabase session)
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

**Regras de classificação de componentes:**

| Pergunta | Localização |
|---|---|
| É reutilizável em qualquer página sem alterações? | `components/ui/` |
| Tem lógica de negócio ou contexto de página? | `components/sections/` |
| É estrutura global (header, footer, nav)? | `components/layout/` |

**Regra da `page.tsx`:** Nunca tem lógica. Só compõe secções e passa dicionários.

---

## 3. Configurar o `tsconfig.json`

Verificar que estas opções estão presentes:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> ⚠️ `moduleResolution: "bundler"` é obrigatório para Next.js 15 com imports sem extensão.

---

## 4. Instalar Dependências

### Zod e Drizzle

```bash
# Zod — validação de formulários e Server Actions
npm install zod

# Drizzle ORM + driver PostgreSQL
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### shadcn/ui

Inicializar após o projeto estar criado:

```bash
npx shadcn@latest init
```

**Opções no assistente:**

| Pergunta | Resposta |
|---|---|
| Component library? | Radix |
| Preset? | Escolher em [ui.shadcn.com/themes](https://ui.shadcn.com/themes) antes de decidir |
| CSS variables? | Yes |

> ⚠️ Se o `init` falhar com erro `ENOENT globals.css`, abrir o `components.json` gerado na raiz e corrigir o campo `tailwind.css` para `"src/app/globals.css"`. Depois repetir o comando.

Instalar componentes individualmente conforme necessário:

```bash
npx shadcn@latest add button card input textarea select badge
```

### Supabase

Seguir o fluxo oficial de ligação no Dashboard do Supabase → **Connect** → **Next.js App Router**:

```bash
npm install @supabase/supabase-js @supabase/ssr
npx shadcn@latest add @supabase/supabase-client-nextjs
```

Este comando cria automaticamente:
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/middleware.ts` ← helper `updateSession`

**Não criar estes ficheiros à mão** — o CLI do Supabase gera-os configurados para o projeto.

Após a instalação, **remover o bloco de redirecionamento para login** do `src/lib/middleware.ts` gerado (não se aplica a projetos sem autenticação):

```typescript
// ❌ Remover este bloco se não houver autenticação
if (
  !user &&
  !request.nextUrl.pathname.startsWith('/login') &&
  !request.nextUrl.pathname.startsWith('/auth')
) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/login'
  return NextResponse.redirect(url)
}
```

### Outras dependências comuns

```bash
# Ícones
npm install lucide-react

# Email (se usado)
npm install resend
```

---

## 5. Configurar as Variáveis de Ambiente

### `.env.local`

```bash
# Supabase client (geradas automaticamente pelo CLI)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Drizzle — conexão direta ao PostgreSQL
# Dashboard Supabase → Project Settings → Database → Connection string → URI
# Usar Transaction Pooler (porta 6543) para ambientes serverless
DATABASE_URL=postgresql://postgres.xxxx:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# Resend (se usado)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Cloudflare Turnstile (se usado)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

> ⚠️ `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` são para o cliente Supabase JS. `DATABASE_URL` é separada — usada pelo Drizzle para queries e migrações. Ambas são necessárias.

> ⚠️ Variáveis com `NEXT_PUBLIC_` ficam expostas no bundle do cliente. Todas as outras são server-only.

Criar também `.env.example` com as chaves sem valores para commits:

```bash
cp .env.local .env.example
# Remover os valores no .env.example
```

Confirmar que `.env.local` está no `.gitignore`.

---

## 6. Configurar o Middleware

O `src/middleware.ts` combina o refresh de sessão do Supabase com a lógica de i18n. **É o único middleware real** — o `src/lib/middleware.ts` é apenas um helper chamado por este.

```typescript
// src/middleware.ts
import { updateSession } from "@/lib/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { locales, defaultLocale } from "@/lib/i18n/config"

export async function middleware(request: NextRequest) {
  // 1. Refresh da sessão Supabase
  const supabaseResponse = await updateSession(request)

  // 2. i18n — redireciona para o locale por defeito se não tiver locale na URL
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|images|icons).*)"],
}
```

---

## 7. Configurar o i18n

### `src/lib/i18n/config.ts`

```typescript
export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
```

### `src/lib/i18n/dictionaries.ts`

```typescript
import type { Locale } from "./config";
import type { pt } from "./locales/pt/index";

export type Translations = typeof pt;

const dictionaries = {
  pt: () => import("./locales/pt/index").then((m) => m.pt),
  en: () => import("./locales/en/index").then((m) => m.en),
};

export async function getDictionary(locale: Locale): Promise<Translations> {
  return dictionaries[locale]?.() ?? dictionaries["pt"]();
}
```

### `src/lib/i18n/locales/pt/index.ts` (e equivalente `en/index.ts`)

```typescript
import { nav } from "./nav";
import { hero } from "./hero";
// ... restantes secções

export const pt = {
  nav,
  hero,
  // ...
};
```

### Regras dos ficheiros de locale

- Um ficheiro `.ts` por secção (`nav.ts`, `hero.ts`, `contact.ts`…)
- **Sem `as const`** nos ficheiros de locale — impede que PT e EN tenham strings diferentes
- Chaves idênticas em todos os locales — o TypeScript avisa se algo faltar (`Translations = typeof pt`)

---

## 8. Configurar o Drizzle

### `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

### `src/db/schema/index.ts`

```typescript
export * from "./contacts";
// Adicionar aqui cada nova tabela
```

### `src/db/schema/contacts.ts` (exemplo)

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  service: text("service").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
```

### Comandos Drizzle

```bash
# Gerar migração após criar ou alterar o schema
npx drizzle-kit generate

# Aplicar migrações à base de dados
npx drizzle-kit migrate

# Abrir Drizzle Studio (visualizar DB)
npx drizzle-kit studio
```

> ⚠️ Nunca alterar o schema pelo Dashboard do Supabase. Todas as alterações passam pelo Drizzle.

---

## 9. Configurar o Tailwind e Temas

### Regra fundamental

**Nunca usar classes de cor Tailwind diretamente em componentes.** Usar sempre tokens semânticos do shadcn:

```tsx
// ❌ Errado — quebra o tema light/dark
<div className="bg-zinc-900 text-white">

// ✅ Correto — funciona em ambos os temas
<div className="bg-background text-foreground">
```

Tokens semânticos disponíveis: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-primary`, `text-primary-foreground`.

### Dark/Light mode

Implementar ambos os temas desde o início — o custo agora é mínimo, o custo depois é refazer componente a componente. O `ThemeToggle` em `components/layout/` controla a classe `dark` no elemento `<html>`.

---

## 10. Padrão de Server Actions com Zod

Todas as Server Actions seguem este padrão:

```typescript
// src/actions/exemplo.ts
"use server";
import { z } from "zod";

const schema = z.object({
  campo: z.string().min(2),
});

export type FormState = {
  success?: boolean;
  errors?: z.ZodFormattedError<z.infer<typeof schema>>;
  serverError?: string;
};

export async function submitExemplo(
  prev: FormState,
  formData: FormData
): Promise<FormState> {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { errors: result.error.format() };

  // lógica: DB, email, etc.

  return { success: true };
}
```

No componente cliente usar `useActionState`:

```tsx
"use client";
import { useActionState } from "react";
import { submitExemplo } from "@/actions/exemplo";

const [state, action, isPending] = useActionState(submitExemplo, {});
```

---

## 11. Dados Estáticos

Para conteúdo que não requer base de dados (projetos, serviços, etc.):

```typescript
// src/lib/data/projects.ts
import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "nome-do-projeto",   // slug kebab-case, nunca numérico
    title: "Nome do Projeto",
    // ...
  },
];
```

**IDs são sempre slugs string** (`"greenlink"`), nunca números sequenciais (`1`, `2`, `3`).

---

## 12. Convenções Gerais

| Regra | Detalhe |
|---|---|
| Imports | Sempre `@/` — nunca caminhos relativos (`../../`) |
| Ficheiros | kebab-case (`contact-form.tsx`) |
| Exports | PascalCase (`export function ContactForm`) |
| Tipos | Em `src/types/` ou inferidos com `z.infer<>` — nunca duplicados |
| `page.tsx` | Zero lógica — só composição de secções |
| DB | Drizzle para queries. Supabase client só para Auth e Storage |
| Schema DB | Só via Drizzle — nunca pelo Dashboard do Supabase |
| Tokens semânticos | Sempre — nunca classes de cor Tailwind diretas |

---

## 13. Checklist de Arranque Rápido

- [ ] Projeto criado com `src/`, App Router, TypeScript, Tailwind e alias `@/*`
- [ ] `tsconfig.json` com `moduleResolution: "bundler"` e `strict: true`
- [ ] Estrutura de pastas criada (`components/ui`, `sections`, `layout`, `lib`, `db`, `actions`, `hooks`, `types`)
- [ ] `public/` na raiz (fora do `src/`)
- [ ] Zod e Drizzle instalados
- [ ] shadcn inicializado (`npx shadcn@latest init`) com Radix e CSS variables
- [ ] Preset shadcn escolhido em [ui.shadcn.com/themes](https://ui.shadcn.com/themes)
- [ ] Supabase ligado via CLI — `client.ts`, `server.ts` e `lib/middleware.ts` gerados automaticamente
- [ ] Bloco de redirecionamento para login removido do `src/lib/middleware.ts` (se sem autenticação)
- [ ] `src/middleware.ts` atualizado para combinar Supabase session + i18n
- [ ] i18n configurado (`config.ts`, `dictionaries.ts`, locales por secção sem `as const`)
- [ ] `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `DATABASE_URL`
- [ ] `.env.example` criado e `.env.local` no `.gitignore`
- [ ] Drizzle configurado (`drizzle.config.ts`, `db/index.ts`, `db/schema/`)
- [ ] Dark mode e light mode implementados com tokens semânticos
- [ ] `ARCHITECTURE.md` criado no projeto

