import { NextRequest, NextResponse } from "next/server";
import { getApplePayDomainAssociationBytes } from "@/lib/apple-pay/domain-association";

/**
 * Legacy path — Apple / PayPal do not use this URL for domain checks.
 * Prefer `/.well-known/apple-developer-merchantid-domain-association` (see app route).
 */
export async function GET(_request: NextRequest) {
  try {
    const payload = getApplePayDomainAssociationBytes();

    if (!payload?.length) {
      console.warn(
        "Apple Pay domain association: no file in env (PAYPAL_APPLE_PAY_DOMAIN_ASSOCIATION / APPLE_PAY_DOMAIN_VERIFICATION_FILE) and no public/.well-known file."
      );

      return new NextResponse(
        "Apple Pay domain association file is not configured. Host the file at /.well-known/apple-developer-merchantid-domain-association (see PayPal Apple Pay docs).",
        {
          status: 404,
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
    }

    return new NextResponse(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    console.error("Error serving Apple Pay domain association:", error);
    return new NextResponse("Error serving verification file", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
