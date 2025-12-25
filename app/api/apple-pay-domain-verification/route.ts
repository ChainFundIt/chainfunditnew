import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    
    const verificationFile = 
      process.env.APPLE_PAY_DOMAIN_VERIFICATION_FILE ||
      process.env.PAYSTACK_APPLE_PAY_DOMAIN_VERIFICATION_FILE;

    if (!verificationFile) {
      console.warn(
        'Apple Pay domain verification file not found in environment variables. ' +
        'Please download the file from Stripe/Paystack dashboard and set it in your .env file.'
      );
      
      return new NextResponse(
        'Please configure APPLE_PAY_DOMAIN_VERIFICATION_FILE in your environment variables',
        {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
    }

    return new NextResponse(verificationFile, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error serving Apple Pay domain verification file:', error);
    return new NextResponse('Error serving verification file', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

