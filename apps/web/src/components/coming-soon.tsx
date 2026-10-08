import { Logo } from "@/components/ui";

type ComingSoonProps = {
  logoAlt: string;
  message: string;
};

/** The placeholder shown at the site's address until the real home page exists. */
export function ComingSoon({ logoAlt, message }: ComingSoonProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-gutter py-12">
      <h1 className="w-full max-w-120">
        <Logo
          variant="lockup"
          alt={logoAlt}
          sizes="(min-width: 32rem) 30rem, 100vw"
          loading="eager"
          fetchPriority="high"
          className="h-auto w-full"
        />
      </h1>
      <p className="text-sm font-semibold tracking-eyebrow text-text-muted uppercase">
        {message}
      </p>
    </main>
  );
}
