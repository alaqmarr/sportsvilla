import { redirect } from "next/navigation";
import MagicFallbackClient from "./MagicFallbackClient";

export const dynamic = 'force-dynamic';

export default async function LoginPage(props: { searchParams: Promise<{ magic?: string, magic_verified?: string }> }) {
  const searchParams = await props.searchParams;
  if (searchParams.magic) {
    redirect(`/api/client/v1/auth/magic/verify?token=${searchParams.magic}`);
  }

  // If magic_verified is present, render the app download prompt
  return <MagicFallbackClient />;
}
