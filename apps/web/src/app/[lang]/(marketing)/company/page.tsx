import { PendingLegalPage, pendingLegalPageMetadata } from "@/server/site/pending-legal-page";

// A placeholder until the client delivers the content (spec 004, T7).
export function generateMetadata() {
  return pendingLegalPageMetadata("company");
}

export default function CompanyPage() {
  return <PendingLegalPage page="company" />;
}
