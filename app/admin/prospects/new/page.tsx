import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { Breadcrumb } from "@/app/components/Breadcrumb";

export const metadata: Metadata = {
  title: "New Prospect",
  robots: { index: false, follow: false, nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true } },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid:   "Please fill in all required fields.",
  duplicate: "A prospect with that email already exists.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewProspectPage(props: { searchParams: SearchParams }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const searchParams = await props.searchParams;
  const errorKey = typeof searchParams.error === "string" ? searchParams.error : "";
  const errorMessage = ERROR_MESSAGES[errorKey] ?? "";

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "820px" }}>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Prospects", href: "/admin/prospects" },
            { label: "New prospect" },
          ]}
        />

        <div className="page-header">
          <div className="page-kicker">Admin pipeline</div>
          <h1>
            New <span className="accent">prospect</span>
          </h1>
          <p>Manually add a lead to the pipeline.</p>
        </div>

        {errorMessage && (
          <div className="feedback feedback--error" style={{ marginBottom: "1.25rem" }}>
            {errorMessage}
          </div>
        )}

        <div className="card">
          <form action="/api/admin/prospects" method="post" className="form">
            <div className="field-row">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" type="text" required autoComplete="off" />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" type="text" required autoComplete="off" />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required autoComplete="off" />
              </div>
              <div className="field">
                <label htmlFor="phone">
                  Phone <span className="field__optional">(optional)</span>
                </label>
                <input id="phone" name="phone" type="tel" autoComplete="off" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="goalSummary">Goal summary</label>
              <textarea id="goalSummary" name="goalSummary" required rows={3} placeholder="What are they looking to achieve?" />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="goalType">
                  Goal type <span className="field__optional">(optional)</span>
                </label>
                <select id="goalType" name="goalType" defaultValue="">
                  <option value="">— Select —</option>
                  <option value="fat_loss">Fat loss</option>
                  <option value="muscle_gain">Muscle gain</option>
                  <option value="body_recomp">Body recomposition</option>
                  <option value="performance">Athletic performance</option>
                  <option value="general_health">General health &amp; fitness</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="fitnessLevel">
                  Fitness level <span className="field__optional">(optional)</span>
                </label>
                <select id="fitnessLevel" name="fitnessLevel" defaultValue="">
                  <option value="">— Select —</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="status">Pipeline status</label>
              <select id="status" name="status" defaultValue="NEW_LEAD">
                <option value="NEW_LEAD">New lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
              </select>
            </div>

            <div className="inline-actions">
              <button type="submit" className="button">
                Add to pipeline
              </button>
              <Link href="/admin/prospects" className="button-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
