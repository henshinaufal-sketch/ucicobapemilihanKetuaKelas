import { isAdmin } from "@/lib/auth";
import { usingMemory } from "@/lib/store";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;
  return <AdminPanel usingMemory={usingMemory} />;
}
