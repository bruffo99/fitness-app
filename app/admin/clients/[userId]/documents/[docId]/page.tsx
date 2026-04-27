import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { CLIENT_DOCUMENT_CATEGORIES, getClientDocumentCategoryLabel } from "@/lib/client-documents";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/app/components/Breadcrumb";

export default async function EditClientDocumentPage(props: {
  params: Promise<{ userId: string; docId: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { userId, docId } = await props.params;
  const document = await prisma.clientDocument.findFirst({
    where: {
      id: docId,
      userId,
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  if (!document || document.user.role !== "CLIENT") {
    redirect("/admin/prospects");
  }

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "820px" }}>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Prospects", href: "/admin/prospects" },
            { label: document.user.email, href: `/admin/clients/${userId}/documents` },
            { label: "Documents", href: `/admin/clients/${userId}/documents` },
            { label: "Edit" },
          ]}
        />
        <div className="page-header">
          <div className="page-kicker">Client documents</div>
          <h1>
            Edit <span className="accent">document</span>
          </h1>
          <p>Update program delivery content for {document.user.email}.</p>
        </div>

        <div className="card">
          <form
            action={`/api/admin/clients/${userId}/documents/${docId}`}
            method="post"
            className="form"
          >
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" required defaultValue={document.title} />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" defaultValue={document.category}>
                {CLIENT_DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {getClientDocumentCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                required
                rows={18}
                defaultValue={document.content}
              />
            </div>

            <div className="field">
              <label htmlFor="isActive">Status</label>
              <select id="isActive" name="isActive" defaultValue={document.isActive ? "true" : "false"}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="inline-actions">
              <button type="submit" className="button">
                Save changes
              </button>
              <button type="submit" name="action" value="delete" className="button-secondary">
                Archive document
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
