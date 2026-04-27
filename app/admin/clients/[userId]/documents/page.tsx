import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getClientDocumentCategoryLabel } from "@/lib/client-documents";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Breadcrumb } from "@/app/components/Breadcrumb";

export default async function AdminClientDocumentsPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { userId } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      documents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user || user.role !== "CLIENT") {
    redirect("/admin/prospects");
  }

  const clientName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;

  return (
    <section className="page">
      <div className="container">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Prospects", href: "/admin/prospects" },
            { label: clientName },
            { label: "Documents" },
          ]}
        />
        <div className="page-header">
          <div className="page-kicker">Client documents</div>
          <h1>
            {clientName} <span className="accent">programs</span>
          </h1>
          <p>Manage workouts, nutrition plans, resources, and other client-facing content.</p>
        </div>

        <div className="inline-actions" style={{ marginBottom: "1.5rem" }}>
          <Link href={`/admin/clients/${userId}/documents/new`} className="button">
            New document
          </Link>
          <Link href={`/admin/clients/${userId}/photos`} className="button-secondary">
            View gym photos
          </Link>
          <Link href="/admin/prospects" className="button-secondary">
            Back to pipeline
          </Link>
        </div>

        <div className="admin-panel">
          <div className="section__eyebrow">Document library</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {user.documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No documents created yet.
                    </td>
                  </tr>
                ) : (
                  user.documents.map((document) => (
                    <tr key={document.id}>
                      <td>{document.title}</td>
                      <td>{getClientDocumentCategoryLabel(document.category)}</td>
                      <td>{formatDateTime(document.createdAt)}</td>
                      <td>{document.isActive ? "Active" : "Inactive"}</td>
                      <td>
                        <Link
                          href={`/admin/clients/${userId}/documents/${document.id}`}
                          className="table-action"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
