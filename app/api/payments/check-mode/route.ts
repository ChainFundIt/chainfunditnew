import { NextRequest, NextResponse } from 'next/server';
import { getPaymentModeStatus } from '@/lib/payments/config';

/**
 * GET /api/payments/check-mode
 * Diagnostic endpoint to check if payment keys are in test or production mode
 */
export async function GET(request: NextRequest) {
  try {
    const status = getPaymentModeStatus();
    
    // Determine overall mode
    const isAnyTestMode =
      status.paystack.isTestMode || status.paypal.isTestMode;
    
    return NextResponse.json({
      success: true,
      overallMode: isAnyTestMode ? 'test' : 'live',
      isTestMode: isAnyTestMode,
      paystack: {
        secretKey: {
          mode: status.paystack.secretKeyMode,
          isSet: status.paystack.secretKeyMode !== 'missing',
          prefix: status.paystack.secretKeyMode === 'test' ? 'sk_test_' : 
                  status.paystack.secretKeyMode === 'live' ? 'sk_live_' : 'unknown',
        },
        publicKey: {
          mode: status.paystack.publicKeyMode,
          isSet: status.paystack.publicKeyMode !== 'missing',
          prefix: status.paystack.publicKeyMode === 'test' ? 'pk_test_' : 
                  status.paystack.publicKeyMode === 'live' ? 'pk_live_' : 'unknown',
        },
        isTestMode: status.paystack.isTestMode,
      },
      paypal: {
        clientId: {
          mode: status.paypal.clientMode,
          isSet: status.paypal.clientMode !== 'missing',
        },
        publicClientId: {
          mode: status.paypal.publicClientMode,
          isSet: status.paypal.publicClientMode !== 'missing',
        },
        clientSecret: {
          mode: status.paypal.secretMode,
          isSet: status.paypal.secretMode !== 'missing',
        },
        environment: {
          mode: status.paypal.environmentMode,
          isSet: status.paypal.environmentMode !== 'missing',
        },
        isTestMode: status.paypal.isTestMode,
      },
      recommendations: generateRecommendations(status),
    });
  } catch (error: any) {
    console.error('Error checking payment mode:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to check payment mode' 
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(status: ReturnType<typeof getPaymentModeStatus>): string[] {
  const recommendations: string[] = [];

  // Paystack recommendations
  if (status.paystack.secretKeyMode === 'test' || status.paystack.publicKeyMode === 'test') {
    recommendations.push('Paystack is in TEST mode. To switch to production:');
    recommendations.push('  - Replace PAYSTACK_SECRET_KEY with a key starting with "sk_live_"');
    recommendations.push('  - Replace NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY with a key starting with "pk_live_"');
  }
  
  if (status.paystack.secretKeyMode === 'missing') {
    recommendations.push('PAYSTACK_SECRET_KEY is missing');
  }
  
  if (status.paystack.publicKeyMode === 'missing') {
    recommendations.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is missing');
  }
  
  if (status.paystack.secretKeyMode === 'live' && status.paystack.publicKeyMode === 'test') {
    recommendations.push('⚠️ Paystack secret key is LIVE but public key is TEST - they must match!');
  }
  
  if (status.paystack.secretKeyMode === 'test' && status.paystack.publicKeyMode === 'live') {
    recommendations.push('⚠️ Paystack secret key is TEST but public key is LIVE - they must match!');
  }

  // PayPal recommendations
  if (status.paypal.clientMode === 'missing') {
    recommendations.push('PAYPAL_CLIENT_ID is missing');
  }

  if (status.paypal.publicClientMode === 'missing') {
    recommendations.push('NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing');
  }

  if (status.paypal.secretMode === 'missing') {
    recommendations.push('PAYPAL_CLIENT_SECRET is missing');
  }

  if (status.paypal.environmentMode === 'missing') {
    recommendations.push('PAYPAL_ENVIRONMENT is missing (defaults to sandbox if omitted)');
  } else if (status.paypal.environmentMode === 'test') {
    recommendations.push('PayPal is in TEST mode. Set PAYPAL_ENVIRONMENT=live to use production credentials.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ All payment keys are configured for production mode');
  }
  
  return recommendations;
}




