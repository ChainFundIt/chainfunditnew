import { NextResponse } from "next/server";
import { getApplePayDomainAssociationBytes } from "@/lib/apple-pay/domain-association";

/**
 * Domain association bytes for Apple Pay on the web (PayPal + Apple checks `/.well-known/...`).
 * Rewritten from `/.well-known/apple-developer-merchantid-domain-association` in `next.config.ts`.
 */
export async function GET() {
  const payload = getApplePayDomainAssociationBytes();
  if (!payload?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
