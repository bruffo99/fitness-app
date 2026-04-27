import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <AdminNav email={session.email} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
