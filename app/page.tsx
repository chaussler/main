import { getDashboardSnapshot } from "@/lib/connectors";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const snapshot = await getDashboardSnapshot();
  return <Dashboard initial={snapshot} />;
}
