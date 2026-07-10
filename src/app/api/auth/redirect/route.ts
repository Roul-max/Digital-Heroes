import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(session.user.role === "REP" ? "/rep" : "/admin");
}
