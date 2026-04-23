import { getClientSession } from "@/lib/client-auth";
import { getClientDocumentSectionHeading } from "@/lib/client-documents";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type DocumentGroup = {
  category: string;
  documents: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
  }[];
};

export default async function PortalPlanPage() {
  const user = await getClientSession();

  if (!user) {
    return null;
  }

  const documents = await prisma.clientDocument.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: [
      { category: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      title: true,
      category: true,
      content: true,
      createdAt: true,
    },
  });

  const groups = documents.reduce<DocumentGroup[]>((acc, document) => {
    const existing = acc.find((group) => group.category === document.category);

    if (existing) {
      existing.documents.push({
        id: document.id,
        title: document.title,
        content: document.content,
        createdAt: document.createdAt,
      });
      return acc;
    }

    acc.push({
      category: document.category,
      documents: [
        {
          id: document.id,
          title: document.title,
          content: document.content,
          createdAt: document.createdAt,
        },
      ],
    });

    return acc;
  }, []);

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "920px" }}>
        <div className="page-header">
          <div className="page-kicker">Your plan</div>
          <h1>
            Program <span className="accent">delivery</span>
          </h1>
          <p>Your coach’s current programming, nutrition guidance, and reference notes live here.</p>
        </div>

        {groups.length === 0 ? (
          <div className="card">
            <div className="section__eyebrow">No documents yet</div>
            <p>Your coach has not posted any programs yet. Check back soon.</p>
          </div>
        ) : (
          <div className="stack">
            {groups.map((group) => (
              <div key={group.category} className="card">
                <div className="section__eyebrow">{getClientDocumentSectionHeading(group.category)}</div>
                <div className="stack">
                  {group.documents.map((document) => (
                    <article key={document.id}>
                      <h2>
                        {document.title} <span className="accent">.</span>
                      </h2>
                      <p className="muted">{formatDate(document.createdAt)}</p>
                      <div style={{ whiteSpace: "pre-wrap" }}>{document.content}</div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
