import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next).*_.*)"],
};

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  return new NextResponse(null, { status: 404 });
}
