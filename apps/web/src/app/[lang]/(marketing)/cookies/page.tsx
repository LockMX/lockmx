import { PendingLegalPage, pendingLegalPageMetadata } from "@/server/site/pending-legal-page";

// A placeholder until the client delivers the content (spec 004, T7).
export function generateMetadata() {
  return pendingLegalPageMetadata("cookies");
}

export default function CookiesPage() {
  return <PendingLegalPage page="cookies" />;
}
