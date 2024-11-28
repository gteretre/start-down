import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

if (!handlers || !handlers.GET || !handlers.POST) {
  throw new Error("GET or POST handler is missing in handlers object");
}

// export async function GET(req: NextRequest, res: NextResponse) {
//   const getCookies = cookies()
//   const nextAuthSession = getCookies.get('next-auth.session-token')?.value || ''

//   return NextResponse.json(nextAuthSession)
// }
export const GET = handlers.GET;
export const POST = handlers.POST;
