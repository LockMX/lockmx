type PageMessageProps = {
  title: string;
  message: string;
  /** The actions offered to the visitor, and any note under them. */
  children: React.ReactNode;
};

/** A page that has only something to say: not found, error. */
export function PageMessage({ title, message, children }: PageMessageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-gutter py-16 text-center">
      <h1 className="font-display text-display-sm leading-none font-black text-text-strong uppercase italic">
        {title}
      </h1>
      <p className="text-md leading-body text-text-body">{message}</p>
      {children}
    </div>
  );
}
