import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CLIENT_SESSION_COOKIE = "client_session";

export async function getClientSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
      role: "CLIENT"
    }
  });
}
