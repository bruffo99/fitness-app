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
  { params }: { params: Promise<{ userId: string; docId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const { userId, docId } = await params;
  const formData = await request.formData();
  const action = getTrimmedValue(formData.get("action"));

  const existingDocument = await prisma.clientDocument.findFirst({
    where: {
      id: docId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!existingDocument) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (action === "delete") {
    await prisma.clientDocument.update({
      where: { id: docId },
      data: { isActive: false },
    });

    return NextResponse.redirect(
      await buildAbsoluteUrl(`/admin/clients/${userId}/documents`),
      303
    );
  }

  const title = getTrimmedValue(formData.get("title"));
  const category = getTrimmedValue(formData.get("category"));
  const content = getTrimmedValue(formData.get("content"));

  if (!title || !content || !isClientDocumentCategory(category)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const isActiveValue = getTrimmedValue(formData.get("isActive"));

  await prisma.clientDocument.update({
    where: { id: docId },
    data: {
      title,
      category,
      content,
      isActive: isActiveValue === "true",
    },
  });

  return NextResponse.redirect(
    await buildAbsoluteUrl(`/admin/clients/${userId}/documents`),
    303
  );
}
