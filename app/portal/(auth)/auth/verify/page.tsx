import { verifyMagicLinkToken } from "@/app/portal/(auth)/auth/verify/actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PortalVerifyPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  await verifyMagicLinkToken(token);

  return null;
}
