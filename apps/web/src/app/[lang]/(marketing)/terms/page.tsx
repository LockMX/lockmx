import { PendingLegalPage, pendingLegalPageMetadata } from "@/server/site/pending-legal-page";

// A placeholder until the client delivers the content (spec 004, T7).
export function generateMetadata() {
  return pendingLegalPageMetadata("terms");
}

export default function TermsPage() {
  return <PendingLegalPage page="terms" />;
}
