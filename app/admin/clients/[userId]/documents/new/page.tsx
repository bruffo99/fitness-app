import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { CLIENT_DOCUMENT_CATEGORIES, getClientDocumentCategoryLabel } from "@/lib/client-documents";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/app/components/Breadcrumb";

export default async function NewClientDocumentPage(props: {
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
      role: true,
    },
  });

  if (!user || user.role !== "CLIENT") {
    redirect("/admin/prospects");
  }

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "820px" }}>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Prospects", href: "/admin/prospects" },
            { label: user.email, href: `/admin/clients/${userId}/documents` },
            { label: "Documents", href: `/admin/clients/${userId}/documents` },
            { label: "New" },
          ]}
        />
        <div className="page-header">
          <div className="page-kicker">Client documents</div>
          <h1>
            New <span className="accent">document</span>
          </h1>
          <p>Create a new client-facing program or resource for {user.email}.</p>
        </div>

        <div className="card">
          <form action={`/api/admin/clients/${userId}/documents`} method="post" className="form">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" required />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" defaultValue="workout">
                {CLIENT_DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {getClientDocumentCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="content">Content</label>
              <textarea id="content" name="content" required rows={18} />
            </div>

            <button type="submit" className="button">
              Save document
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
