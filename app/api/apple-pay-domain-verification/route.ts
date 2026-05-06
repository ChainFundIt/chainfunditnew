import { NextResponse } from "next/server";
import { getApplePayDomainAssociation } from "@/lib/apple-pay/domain-association";

export async function GET() {
  try {
    const verificationFile = await getApplePayDomainAssociation();

    if (!verificationFile) {
      console.warn(
        "Apple Pay domain verification file not found. " +
          "Add it to environment variables or public/.well-known/apple-developer-merchantid-domain-association."
      );

      return new NextResponse(
        "Please configure APPLE_PAY_DOMAIN_VERIFICATION_FILE/PAYPAL_APPLE_PAY_DOMAIN_ASSOCIATION_FILE or add public/.well-known/apple-developer-merchantid-domain-association",
        {
          status: 404,
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
    }

    return new NextResponse(verificationFile, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error serving Apple Pay domain verification file:", error);
    return new NextResponse("Error serving verification file", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}