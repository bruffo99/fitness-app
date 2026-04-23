import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { isClientDocumentCategory } from "@/lib/client-documents";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

function getTrimmedValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const { userId } = await params;
  const formData = await request.formData();
  const title = getTrimmedValue(formData.get("title"));
  const category = getTrimmedValue(formData.get("category"));
  const content = getTrimmedValue(formData.get("content"));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "CLIENT") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (!title || !content || !isClientDocumentCategory(category)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  await prisma.clientDocument.create({
    data: {
      userId,
      title,
      category,
      content,
    },
  });

  return NextResponse.redirect(
    await buildAbsoluteUrl(`/admin/clients/${userId}/documents`),
    303
  );
}
