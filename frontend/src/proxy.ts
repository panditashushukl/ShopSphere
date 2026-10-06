import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  // Allow all page routes to render cleanly.
  // API security and RBAC permissions are enforced strictly by the FastAPI backend.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
