import { Icon, type IconName } from "@/components/ui";

export type ContactChannel = {
  /** The heading of the subsection. */
  title: string;
  icon: IconName;
  href: string;
  /** What the link shows: the address or the handle. */
  text: string;
  /** Leaves the site: opened without handing over the opener. */
  external?: boolean;
};

type ContactChannelsProps = {
  channels: ContactChannel[];
};

/** The ways to reach LockMX, one subsection each (spec 005, decision 20). */
export function ContactChannels({ channels }: ContactChannelsProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {channels.map((channel) => (
        <div key={channel.href} className="flex flex-col gap-3 border-t-2 border-border-strong pt-4">
          <h2 className="font-display text-heading-md leading-tight font-extrabold text-text-strong uppercase italic">
            {channel.title}
          </h2>
          <a
            href={channel.href}
            rel={channel.external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 self-start text-lg leading-snug font-semibold break-all"
          >
            <Icon name={channel.icon} />
            {channel.text}
          </a>
        </div>
      ))}
    </div>
  );
}
